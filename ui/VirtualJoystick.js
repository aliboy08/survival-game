import { GameObject } from '../core/GameObject.js';

const OUTER_RADIUS = 60;
const KNOB_RADIUS  = 24;
const PADDING      = 90; // distance from bottom-left corner

export class VirtualJoystick extends GameObject {
  #canvas;
  #input;

  // touch state
  #touchId  = null;
  #active   = false;

  // knob offset from centre (pixels)
  #knobX = 0;
  #knobY = 0;

  constructor(canvas, input) {
    super();
    this.#canvas = canvas;
    this.#input  = input;
  }

  init() {
    const c = this.#canvas;
    c.addEventListener('touchstart', (e) => this.#onTouchStart(e), { passive: false });
    c.addEventListener('touchmove',  (e) => this.#onTouchMove(e),  { passive: false });
    c.addEventListener('touchend',   (e) => this.#onTouchEnd(e),   { passive: false });
    c.addEventListener('touchcancel',(e) => this.#onTouchEnd(e),   { passive: false });
    super.init();
  }

  // Centre of the joystick base (bottom-left, fixed)
  get #origin() {
    return {
      x: PADDING,
      y: this.#canvas.height - PADDING,
    };
  }

  #onTouchStart(e) {
    if (this.#touchId !== null) return; // already tracking a touch
    const o = this.#origin;

    for (const t of e.changedTouches) {
      const dx = t.clientX - o.x;
      const dy = t.clientY - o.y;
      if (Math.hypot(dx, dy) <= OUTER_RADIUS * 1.5) {
        e.preventDefault();
        this.#touchId = t.identifier;
        this.#active  = true;
        this.#update(t.clientX, t.clientY);
        return;
      }
    }
  }

  #onTouchMove(e) {
    if (!this.#active) return;
    for (const t of e.changedTouches) {
      if (t.identifier === this.#touchId) {
        e.preventDefault();
        this.#update(t.clientX, t.clientY);
        return;
      }
    }
  }

  #onTouchEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === this.#touchId) {
        this.#touchId = null;
        this.#active  = false;
        this.#knobX   = 0;
        this.#knobY   = 0;
        this.#input.setJoystick(0, 0);
        return;
      }
    }
  }

  #update(touchX, touchY) {
    const o  = this.#origin;
    let dx   = touchX - o.x;
    let dy   = touchY - o.y;
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
    // When WASD is held and touch is not active, animate the knob to reflect keyboard input
    if (!this.#active) {
      const { x, y } = this.#input.keyboardMovement;
      if (x !== 0 || y !== 0) {
        const len    = Math.hypot(x, y);
        const target = OUTER_RADIUS * 0.65;
        this.#knobX  = (x / len) * target;
        this.#knobY  = (y / len) * target;
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

    // Outer ring fill
    ctx.globalAlpha = 0.25;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, OUTER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring border
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Knob
    ctx.globalAlpha = this.#active ? 0.85 : 0.55;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + this.#knobX, cy + this.#knobY, KNOB_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    super.draw(ctx);
  }
}
