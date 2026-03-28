import { GameObject } from '../core/GameObject.js';

const BAR_WIDTH  = 160;
const BAR_HEIGHT = 14;
const PADDING    = 16;

export class PlayerHUD extends GameObject {
  #player;

  constructor(player) {
    super();
    this.#player = player;
  }

  draw(ctx) {
    const p      = this.#player;
    const x      = PADDING;
    const y      = PADDING;
    const ratio  = Math.max(0, p.hp / p.maxHp);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font      = 'bold 12px monospace';
    ctx.fillText(`HP  ${p.hp} / ${p.maxHp}`, x, y + BAR_HEIGHT - 2);

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 72, y, BAR_WIDTH, BAR_HEIGHT);

    // Fill — green → yellow → red based on ratio
    ctx.fillStyle = ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(x + 72, y, Math.round(BAR_WIDTH * ratio), BAR_HEIGHT);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x + 72, y, BAR_WIDTH, BAR_HEIGHT);

    super.draw(ctx);
  }
}
