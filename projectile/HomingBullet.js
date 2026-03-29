import { GameObject } from '../core/GameObject.js';
import { Enemy }      from '../enemy/enemy.js';

export class HomingBullet extends GameObject {
  #vx; #vy;
  #game;
  #size;
  #damage;
  #range;
  #distTraveled = 0;
  #target;
  #turnRate;

  constructor(x, y, target, game, { velocity = 400, size = 5, damage = 20, range = -1, turnRate = 4 } = {}) {
    super();
    this.x        = x;
    this.y        = y;
    this.#game    = game;
    this.#size    = size;
    this.#damage  = damage;
    this.#range   = range;
    this.#target  = target;
    this.#turnRate = turnRate;

    const dx   = target.x - x;
    const dy   = target.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    this.#vx   = (dx / dist) * velocity;
    this.#vy   = (dy / dist) * velocity;
  }

  update(dt) {
    const speed = Math.hypot(this.#vx, this.#vy);

    // Acquire closest enemy if no live enemy target
    if (!this.#target || this.#target.dead || !('dead' in this.#target)) {
      let closest = null;
      let closestDist = Infinity;
      for (const enemy of this.#game.getEntities(Enemy)) {
        const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (d < closestDist) { closestDist = d; closest = enemy; }
      }
      this.#target = closest;
    }

    // Steer toward live target
    if (this.#target && !this.#target.dead) {
      const dx      = this.#target.x - this.x;
      const dy      = this.#target.y - this.y;
      const dist    = Math.hypot(dx, dy) || 1;
      const desiredVx = (dx / dist) * speed;
      const desiredVy = (dy / dist) * speed;
      const maxDelta  = this.#turnRate * speed * dt;
      const diffX     = desiredVx - this.#vx;
      const diffY     = desiredVy - this.#vy;
      const diffLen   = Math.hypot(diffX, diffY) || 1;
      const clamp     = Math.min(maxDelta, diffLen) / diffLen;
      this.#vx += diffX * clamp;
      this.#vy += diffY * clamp;
      // Normalize back to original speed
      const newSpeed = Math.hypot(this.#vx, this.#vy) || 1;
      this.#vx = (this.#vx / newSpeed) * speed;
      this.#vy = (this.#vy / newSpeed) * speed;
    }

    this.x += this.#vx * dt;
    this.y += this.#vy * dt;
    this.#distTraveled += speed * dt;

    if (this.#range !== -1 && this.#distTraveled >= this.#range) {
      this.dead = true;
      return;
    }

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
    ctx.fillStyle = '#e056fd';
    ctx.shadowColor = '#e056fd';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    super.draw(ctx);
  }
}
