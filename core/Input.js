const TAP_MAX_DURATION_MS = 250;
const TAP_MAX_MOVE_PX     = 8;

export class Input {
  #keys           = new Set();
  #joystickVector = { x: 0, y: 0 };
  #shootPressed   = false;

  // tap-to-move
  #canvas;
  #tapTarget       = null; // { x, y } in canvas coords, consumed once
  #pointerDownPos  = null;
  #pointerDownTime = 0;

  constructor(canvas) {
    this.#canvas = canvas;

    window.addEventListener('keydown', (e) => {
      this.#keys.add(e.code);
      if (e.code === 'Space') { e.preventDefault(); this.setShoot(); }
    });
    window.addEventListener('keyup', (e) => this.#keys.delete(e.code));

    canvas.addEventListener('pointerdown', (e) => this.#onPointerDown(e));
    canvas.addEventListener('pointerup',   (e) => this.#onPointerUp(e));
  }

  #onPointerDown(e) {
    // Only primary button / first touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    this.#pointerDownPos  = { x: e.clientX, y: e.clientY };
    this.#pointerDownTime = performance.now();
  }

  #onPointerUp(e) {
    if (!this.#pointerDownPos) return;

    const duration = performance.now() - this.#pointerDownTime;
    const dx       = e.clientX - this.#pointerDownPos.x;
    const dy       = e.clientY - this.#pointerDownPos.y;
    const moved    = Math.hypot(dx, dy);

    this.#pointerDownPos = null;

    if (duration <= TAP_MAX_DURATION_MS && moved <= TAP_MAX_MOVE_PX) {
      // Convert client coords to canvas coords
      const rect = this.#canvas.getBoundingClientRect();
      this.#tapTarget = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }

  isDown(code) {
    return this.#keys.has(code);
  }

  // Raw keyboard direction (-1 | 0 | 1 per axis) — used by joystick visual
  get keyboardMovement() {
    const up    = this.isDown('KeyW') || this.isDown('ArrowUp');
    const down  = this.isDown('KeyS') || this.isDown('ArrowDown');
    const left  = this.isDown('KeyA') || this.isDown('ArrowLeft');
    const right = this.isDown('KeyD') || this.isDown('ArrowRight');

    return {
      x: (right ? 1 : 0) - (left ? 1 : 0),
      y: (down  ? 1 : 0) - (up   ? 1 : 0),
    };
  }

  // Called by VirtualJoystick with a normalised vector
  setJoystick(x, y) {
    this.#joystickVector = { x, y };
  }

  setShoot() { this.#shootPressed = true; }

  consumeShoot() {
    const s = this.#shootPressed;
    this.#shootPressed = false;
    return s;
  }

  // Returns the pending tap target and clears it (one-shot)
  consumeTapTarget() {
    const t = this.#tapTarget;
    this.#tapTarget = null;
    return t;
  }

  // Combined keyboard + joystick, clamped to magnitude 1
  get movement() {
    const kb = this.keyboardMovement;
    let x = kb.x + this.#joystickVector.x;
    let y = kb.y + this.#joystickVector.y;

    const len = Math.sqrt(x * x + y * y);
    if (len > 1) { x /= len; y /= len; }

    return { x, y };
  }
}
