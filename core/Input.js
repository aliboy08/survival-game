export class Input {
  #keys           = new Set();
  #joystickVector = { x: 0, y: 0 };

  constructor() {
    window.addEventListener('keydown', (e) => this.#keys.add(e.code));
    window.addEventListener('keyup',   (e) => this.#keys.delete(e.code));
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
