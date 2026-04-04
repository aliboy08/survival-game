import { GameObject } from '../core/GameObject.js';

export class EnemyBullet extends GameObject {
  #vx; #vy;
  #game;
  #player;
  #damage;

  constructor(x, y, player, game, { velocity = 300, damage = 12 } = {}) {
    super();
    this.x       = x;
    this.y       = y;
    this.#game   = game;
    this.#player = player;
    this.#damage = damage;

    const dx   = player.x - x;
    const dy   = player.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    this.#vx   = (dx / dist) * velocity;
    this.#vy   = (dy / dist) * velocity;
  }

  update(dt) {
    this.x += this.#vx * dt;
    this.y += this.#vy * dt;

    const { width, height } = this.#game.canvas;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.dead = true;
      return;
    }

    const p     = this.#player;
    const halfW = p.width  / 2 + 4;
    const halfH = p.height / 2 + 4;
    if (
      Math.abs(this.x - p.x) < halfW &&
      Math.abs(this.y - p.y) < halfH
    ) {
      p.takeDamage(this.#damage);
      this.dead = true;
      return;
    }

    super.update(dt);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8a80';
    ctx.fill();
    super.draw(ctx);
  }
}
