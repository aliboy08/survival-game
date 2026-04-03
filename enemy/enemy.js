import { GameObject } from '../core/GameObject.js';
import { HealthBar }  from '../ui/HealthBar.js';

const WIDTH          = 48;
const HEIGHT         = 48;
const SPEED          = 80;  // px/s
const CONTACT_DAMAGE = 10;

export class Enemy extends GameObject {
  #healthBar = new HealthBar();
  #player;
  #hitFlash  = 0;

  constructor(x, y, player, { hp = 100, xpReward = 25 } = {}) {
    super();
    this.x         = x;
    this.y         = y;
    this.width     = WIDTH;
    this.height    = HEIGHT;
    this.maxHp     = hp;
    this.hp        = hp;
    this.xpReward  = xpReward;
    this.#player   = player;
  }

  get isDead() { return this.hp <= 0; }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.#hitFlash = 0.12;
    if (this.isDead) {
      this.#player.gainXp(this.xpReward);
      this.#player.emit('kill', this);
      this.dead = true;
    }
  }

  update(dt) {
    if (this.#hitFlash > 0) this.#hitFlash -= dt;
    this.#moveTowardPlayer(dt);
    this.#checkPlayerCollision();
    super.update(dt);
  }

  #moveTowardPlayer(dt) {
    const dx   = this.#player.x - this.x;
    const dy   = this.#player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    this.x += (dx / dist) * SPEED * dt;
    this.y += (dy / dist) * SPEED * dt;
  }

  #checkPlayerCollision() {
    const p        = this.#player;
    const halfW    = (this.width  + p.width)  / 2;
    const halfH    = (this.height + p.height) / 2;
    const dx       = this.x - p.x;
    const dy       = this.y - p.y;

    if (Math.abs(dx) >= halfW || Math.abs(dy) >= halfH) return;

    // Push enemy out of player
    const dist = Math.hypot(dx, dy) || 1;
    const push = Math.max(halfW, halfH);
    this.x = p.x + (dx / dist) * push;
    this.y = p.y + (dy / dist) * push;

    p.takeDamage(CONTACT_DAMAGE);
  }

  draw(ctx) {
    const left = Math.round(this.x - this.width  / 2);
    const top  = Math.round(this.y - this.height / 2);

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(left, top, this.width, this.height);

    if (this.#hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (this.#hitFlash / 0.12) * 0.6;
      ctx.fillStyle   = '#ffffff';
      ctx.fillRect(left, top, this.width, this.height);
      ctx.restore();
    }

    ctx.strokeStyle = '#7b241c';
    ctx.lineWidth   = 2;
    ctx.strokeRect(left, top, this.width, this.height);

    this.#healthBar.draw(ctx, this);

    super.draw(ctx);
  }
}
