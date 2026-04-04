import { Enemy, _steerToward } from './enemy.js';
import { HealthBar } from '../ui/HealthBar.js';

const SPEED          = 120;
const WANDER_SPEED   = 32;
const CONTACT_DAMAGE = 15;
const WIDTH          = 44;
const HEIGHT         = 44;
const AGGRO_RANGE    = 300;
const DEAGGRO_RANGE  = 450;
const TURN_RATE      = 4.5; // rad/s — turns sharply when charging

export class MeleeEnemy extends Enemy {
  #player;
  #hitFlash     = 0;
  #healthBar    = new HealthBar();
  #aggroed      = false;
  #aggroFlash   = 0;
  #headingAngle = Math.random() * Math.PI * 2;
  #wanderTarget = null;
  #wanderTimer  = 0;

  constructor(x, y, player, opts = {}) {
    super(x, y, player, { hp: 150, xpReward: 30, ...opts });
    this.#player = player;
    this.width   = WIDTH;
    this.height  = HEIGHT;
  }

  update(dt) {
    if (this.#hitFlash  > 0) this.#hitFlash  -= dt;
    if (this.#aggroFlash > 0) this.#aggroFlash -= dt;

    this.#updateAggro();
    this.#move(dt);
    this.#checkPlayerCollision();
  }

  #updateAggro() {
    if (this.#player.invisible) {
      this.#aggroed = false;
      return;
    }
    const dist = Math.hypot(this.#player.x - this.x, this.#player.y - this.y);
    if (!this.#aggroed && dist <= AGGRO_RANGE) {
      this.#aggroed    = true;
      this.#aggroFlash = 0.6;
    }
    if (this.#aggroed && dist > DEAGGRO_RANGE) {
      this.#aggroed = false;
    }
  }

  #move(dt) {
    if (this.frozen) return;
    if (this.#aggroed) {
      this.#chasePlayer(dt);
    } else {
      this.#wander(dt);
    }
  }

  #chasePlayer(dt) {
    const dx = this.#player.x - this.x;
    const dy = this.#player.y - this.y;
    if (Math.hypot(dx, dy) === 0) return;

    const target = Math.atan2(dy, dx);
    this.#headingAngle = _steerToward(this.#headingAngle, target, TURN_RATE, dt);

    const speed = SPEED * this.speedMultiplier;
    this.x += Math.cos(this.#headingAngle) * speed * dt;
    this.y += Math.sin(this.#headingAngle) * speed * dt;
  }

  #wander(dt) {
    this.#wanderTimer -= dt;
    if (!this.#wanderTarget || this.#wanderTimer <= 0) {
      this.#pickWanderTarget();
    }

    const dx   = this.#wanderTarget.x - this.x;
    const dy   = this.#wanderTarget.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) { this.#pickWanderTarget(); return; }

    const target = Math.atan2(dy, dx);
    this.#headingAngle = _steerToward(this.#headingAngle, target, 1.5, dt);

    const speed = WANDER_SPEED * this.speedMultiplier;
    this.x += Math.cos(this.#headingAngle) * speed * dt;
    this.y += Math.sin(this.#headingAngle) * speed * dt;
  }

  #pickWanderTarget() {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 80 + Math.random() * 140;
    this.#wanderTarget = {
      x: this.x + Math.cos(angle) * dist,
      y: this.y + Math.sin(angle) * dist,
    };
    this.#wanderTimer = 2 + Math.random() * 2;
  }

  #checkPlayerCollision() {
    if (this.#player.invisible) return;
    const p     = this.#player;
    const halfW = (this.width  + p.width)  / 2;
    const halfH = (this.height + p.height) / 2;
    const dx    = this.x - p.x;
    const dy    = this.y - p.y;

    if (Math.abs(dx) >= halfW || Math.abs(dy) >= halfH) return;

    const dist = Math.hypot(dx, dy) || 1;
    const push = Math.max(halfW, halfH);
    this.x = p.x + (dx / dist) * push;
    this.y = p.y + (dy / dist) * push;

    p.takeDamage(CONTACT_DAMAGE);
  }

  takeDamage(amount) {
    this.#hitFlash = 0.12;
    if (!this.#aggroed) {
      this.#aggroed    = true;
      this.#aggroFlash = 0.6;
    }
    super.takeDamage(amount);
  }

  draw(ctx) {
    const left = Math.round(this.x - this.width  / 2);
    const top  = Math.round(this.y - this.height / 2);

    // Body — orange-red
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(left, top, this.width, this.height);

    // Claw marks
    ctx.save();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(left + 10, top + 8);
    ctx.lineTo(left + 18, top + this.height - 8);
    ctx.moveTo(left + 18, top + 8);
    ctx.lineTo(left + 26, top + this.height - 8);
    ctx.moveTo(left + 26, top + 8);
    ctx.lineTo(left + 34, top + this.height - 8);
    ctx.stroke();
    ctx.restore();

    // Freeze/slow overlay
    if (this.frozen) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle   = '#00c8ff';
      ctx.fillRect(left, top, this.width, this.height);
      ctx.restore();
    } else if (this.speedMultiplier < 1.0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle   = '#00c8ff';
      ctx.fillRect(left, top, this.width, this.height);
      ctx.restore();
    }

    // Hit flash
    if (this.#hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = (this.#hitFlash / 0.12) * 0.6;
      ctx.fillStyle   = '#ffffff';
      ctx.fillRect(left, top, this.width, this.height);
      ctx.restore();
    }

    ctx.strokeStyle = '#a04000';
    ctx.lineWidth   = 2;
    ctx.strokeRect(left, top, this.width, this.height);

    // Aggro "!" flash
    if (this.#aggroFlash > 0) {
      const alpha = Math.min(1, this.#aggroFlash / 0.3);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#f1c40f';
      ctx.font        = 'bold 14px sans-serif';
      ctx.textAlign   = 'center';
      ctx.fillText('!', Math.round(this.x), top - 14);
      ctx.restore();
    }

    this.#healthBar.draw(ctx, this);
  }
}
