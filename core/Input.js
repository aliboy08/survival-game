import { Bindings } from './Bindings.js';

export class Input {
  #keys           = new Set();
  #joystickVector = { x: 0, y: 0 };
  #shootHeld      = false;

  // canvas pointer-to-shoot
  #canvas;
  #canvasPointerHeld   = false;
  #canvasPointerTarget = null; // { x, y } in canvas coords

  constructor(canvas) {
    this.#canvas = canvas;

    window.addEventListener('keydown', (e) => {
      this.#keys.add(e.code);
      if (e.code === Bindings.get('shoot')) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.#keys.delete(e.code));

    canvas.addEventListener('pointerdown',   (e) => this.#onPointerDown(e));
    canvas.addEventListener('pointermove',   (e) => this.#onPointerMove(e));
    canvas.addEventListener('pointerup',     (e) => this.#onPointerUp(e));
    canvas.addEventListener('pointercancel', (e) => this.#onPointerUp(e));
  }

  #onPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    this.#canvasPointerHeld   = true;
    this.#canvasPointerTarget = this.#toCanvas(e);
  }

  #onPointerMove(e) {
    if (!this.#canvasPointerHeld) return;
    this.#canvasPointerTarget = this.#toCanvas(e);
  }

  #onPointerUp(e) {
    this.#canvasPointerHeld   = false;
    this.#canvasPointerTarget = null;
  }

  #toCanvas(e) {
    const rect = this.#canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  isDown(code) {
    return this.#keys.has(code);
  }

  // Raw keyboard direction (-1 | 0 | 1 per axis) — used by joystick visual
  get keyboardMovement() {
    const up    = this.isDown(Bindings.get('moveUp'))    || this.isDown('ArrowUp');
    const down  = this.isDown(Bindings.get('moveDown'))  || this.isDown('ArrowDown');
    const left  = this.isDown(Bindings.get('moveLeft'))  || this.isDown('ArrowLeft');
    const right = this.isDown(Bindings.get('moveRight')) || this.isDown('ArrowRight');

    return {
      x: (right ? 1 : 0) - (left ? 1 : 0),
      y: (down  ? 1 : 0) - (up   ? 1 : 0),
    };
  }

  // Called by VirtualJoystick with a normalised vector
  setJoystick(x, y) {
    this.#joystickVector = { x, y };
  }

  setShootHeld(val) { this.#shootHeld = val; }

  get shootHeld() {
    return this.#shootHeld || this.isDown(Bindings.get('shoot')) || this.#canvasPointerHeld;
  }

  // Current canvas shoot target while pointer is held (null when released)
  get canvasShootTarget() {
    return this.#canvasPointerHeld ? this.#canvasPointerTarget : null;
  }

  // Called by joystick to suppress canvas shoot when it captures the pointer
  cancelTap() {
    this.#canvasPointerHeld   = false;
    this.#canvasPointerTarget = null;
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
