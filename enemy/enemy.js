import { GameObject } from '../core/GameObject.js';

const WIDTH  = 48;
const HEIGHT = 48;

const HP_BAR_WIDTH  = 44;
const HP_BAR_HEIGHT = 5;
const HP_BAR_OFFSET = 10; // px above sprite

export class Enemy extends GameObject {
  constructor(x, y, { hp = 100 } = {}) {
    super();
    this.x      = x;
    this.y      = y;
    this.width  = WIDTH;
    this.height = HEIGHT;
    this.maxHp  = hp;
    this.hp     = hp;
  }

  get isDead() { return this.hp <= 0; }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  update(dt) {
    super.update(dt);
  }

  draw(ctx) {
    const left = Math.round(this.x - this.width  / 2);
    const top  = Math.round(this.y - this.height / 2);

    // Body
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(left, top, this.width, this.height);

    // Border
    ctx.strokeStyle = '#7b241c';
    ctx.lineWidth   = 2;
    ctx.strokeRect(left, top, this.width, this.height);

    // HP bar background
    const barX = Math.round(this.x - HP_BAR_WIDTH / 2);
    const barY = top - HP_BAR_OFFSET;
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, HP_BAR_WIDTH, HP_BAR_HEIGHT);

    // HP bar fill
    const fillWidth = Math.round((this.hp / this.maxHp) * HP_BAR_WIDTH);
    ctx.fillStyle   = '#2ecc71';
    ctx.fillRect(barX, barY, fillWidth, HP_BAR_HEIGHT);

    super.draw(ctx);
  }
}
