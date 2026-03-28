import { GameObject } from '../core/GameObject.js';
import { Enemy }      from '../enemy/enemy.js';

export class Bullet extends GameObject {
  #vx; #vy;
  #game;
  #size;
  #damage;

  constructor(x, y, target, game, { velocity = 500, size = 5, damage = 25 } = {}) {
    super();
    this.x       = x;
    this.y       = y;
    this.#game   = game;
    this.#size   = size;
    this.#damage = damage;

    const dx   = target.x - x;
    const dy   = target.y - y;
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

    for (const enemy of this.#game.getEntities(Enemy)) {
      if (
        this.x >= enemy.x - enemy.width  / 2 &&
        this.x <= enemy.x + enemy.width  / 2 &&
        this.y >= enemy.y - enemy.height / 2 &&
        this.y <= enemy.y + enemy.height / 2
      ) {
        enemy.takeDamage(this.#damage);
        this.dead = true;
        return;
      }
    }

    super.update(dt);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.#size, 0, Math.PI * 2);
    ctx.fillStyle = '#f9ca24';
    ctx.fill();
    super.draw(ctx);
  }
}
