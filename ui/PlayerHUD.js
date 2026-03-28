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
    const p     = this.#player;
    const x     = PADDING;
    const y     = PADDING;
    const ratio = Math.max(0, p.hp / p.maxHp);

    // Bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);

    // Bar fill — green → yellow → red
    ctx.fillStyle = ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(x, y, Math.round(BAR_WIDTH * ratio), BAR_HEIGHT);

    // Bar border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x, y, BAR_WIDTH, BAR_HEIGHT);

    // Label below bar
    ctx.fillStyle    = '#fff';
    ctx.font         = 'bold 11px monospace';
    ctx.textAlign    = 'left';
    ctx.fillText(`HP  ${p.hp} / ${p.maxHp}`, x, y + BAR_HEIGHT + 13);

    super.draw(ctx);
  }
}
