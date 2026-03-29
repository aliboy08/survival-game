import { GameObject } from '../core/GameObject.js';

const OUTER_RADIUS = 60;
const KNOB_RADIUS  = 24;
const PADDING      = 90; // distance from bottom-left corner

export class VirtualJoystick extends GameObject {
  #canvas;
  #input;

  #pointerId = null;
  #active    = false;
  #knobX     = 0;
  #knobY     = 0;

  constructor(canvas, input) {
    super();
    this.layer   = 10;
    this.#canvas = canvas;
    this.#input  = input;
  }

  init() {
    const c = this.#canvas;
    c.addEventListener('pointerdown',   (e) => this.#onPointerDown(e));
    c.addEventListener('pointermove',   (e) => this.#onPointerMove(e));
    c.addEventListener('pointerup',     (e) => this.#onPointerUp(e));
    c.addEventListener('pointercancel', (e) => this.#onPointerUp(e));
    super.init();
  }

  get #origin() {
    return { x: PADDING, y: this.#canvas.height - PADDING };
  }

  #onPointerDown(e) {
    if (this.#pointerId !== null) return;
    const o  = this.#origin;
    const dx = e.clientX - o.x;
    const dy = e.clientY - o.y;

    if (Math.hypot(dx, dy) <= OUTER_RADIUS * 1.5) {
      e.preventDefault();
      this.#input.cancelTap();
      this.#pointerId = e.pointerId;
      this.#active    = true;
      this.#canvas.setPointerCapture(e.pointerId);
      this.#updateKnob(e.clientX, e.clientY);
    }
  }

  #onPointerMove(e) {
    if (e.pointerId !== this.#pointerId) return;
    e.preventDefault();
    this.#updateKnob(e.clientX, e.clientY);
  }

  #onPointerUp(e) {
    if (e.pointerId !== this.#pointerId) return;
    this.#pointerId = null;
    this.#active    = false;
    this.#knobX     = 0;
    this.#knobY     = 0;
    this.#input.setJoystick(0, 0);
  }

  #updateKnob(clientX, clientY) {
    const o   = this.#origin;
    let dx    = clientX - o.x;
    let dy    = clientY - o.y;
    const len = Math.hypot(dx, dy);

    if (len > OUTER_RADIUS) {
      dx = (dx / len) * OUTER_RADIUS;
      dy = (dy / len) * OUTER_RADIUS;
    }

    this.#knobX = dx;
    this.#knobY = dy;
    this.#input.setJoystick(
      len > 0 ? dx / OUTER_RADIUS : 0,
      len > 0 ? dy / OUTER_RADIUS : 0,
    );
  }

  update(dt) {
    if (!this.#active) {
      const { x, y } = this.#input.keyboardMovement;
      if (x !== 0 || y !== 0) {
        const len   = Math.hypot(x, y);
        const reach = OUTER_RADIUS * 0.65;
        this.#knobX = (x / len) * reach;
        this.#knobY = (y / len) * reach;
      } else {
        this.#knobX = 0;
        this.#knobY = 0;
      }
    }
    super.update(dt);
  }

  draw(ctx) {
    const { x: cx, y: cy } = this.#origin;

    ctx.save();

    ctx.globalAlpha = 0.25;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, OUTER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.globalAlpha = this.#active ? 0.85 : 0.55;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + this.#knobX, cy + this.#knobY, KNOB_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    super.draw(ctx);
  }
}
