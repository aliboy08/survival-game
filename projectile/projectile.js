import { GameObject } from '../core/GameObject.js';
import { Enemy }      from '../enemy/enemy.js';

const SPEED   = 500; // px/s
const DAMAGE  = 25;
const RADIUS  = 5;

export class Projectile extends GameObject {
  #vx; #vy;
  #game;

  constructor(x, y, target, game) {
    super();
    this.x     = x;
    this.y     = y;
    this.#game = game;

    const dx   = target.x - x;
    const dy   = target.y - y;
    const dist = Math.hypot(dx, dy);
    this.#vx   = (dx / dist) * SPEED;
    this.#vy   = (dy / dist) * SPEED;
  }

  update(dt) {
    this.x += this.#vx * dt;
    this.y += this.#vy * dt;

    // Off-screen
    const { width, height } = this.#game.canvas;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.dead = true;
      return;
    }

    // Hit enemy
    for (const enemy of this.#game.getEntities(Enemy)) {
      if (
        this.x >= enemy.x - enemy.width  / 2 &&
        this.x <= enemy.x + enemy.width  / 2 &&
        this.y >= enemy.y - enemy.height / 2 &&
        this.y <= enemy.y + enemy.height / 2
      ) {
        enemy.takeDamage(DAMAGE);
        if (enemy.isDead) enemy.dead = true;
        this.dead = true;
        return;
      }
    }

    super.update(dt);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#f9ca24';
    ctx.fill();

    super.draw(ctx);
  }
}
