import { Enemy, _steerToward } from './enemy.js';
import { HealthBar } from '../ui/HealthBar.js';
import { EnemyBullet } from './EnemyBullet.js';

const SPEED          = 55;
const WANDER_SPEED   = 30;
const PREFERRED_DIST = 250;
const MIN_DIST       = 180;
const MAX_DIST       = 320;
const FIRE_INTERVAL  = 2.0;
const WIDTH          = 40;
const HEIGHT         = 40;
const AGGRO_RANGE    = 300;
const DEAGGRO_RANGE  = 450;
const TURN_RATE      = 2.5; // rad/s — floaty, deliberate turns

export class RangedEnemy extends Enemy {
  #player;
  #game;
  #hitFlash       = 0;
  #aggroed        = false;
  #aggroFlash     = 0;
  #headingAngle   = Math.random() * Math.PI * 2;
  #wanderTarget   = null;
  #wanderTimer    = 0;
  #fireTimer      = Math.random() * FIRE_INTERVAL;
  #strafeDir      = (Math.random() < 0.5) ? 1 : -1;
  #strafeDirTimer = 0;
  #healthBar      = new HealthBar();

  constructor(x, y, player, game, opts = {}) {
    super(x, y, player, { hp: 80, xpReward: 40, ...opts });
    this.#player = player;
    this.#game   = game;
    this.width   = WIDTH;
    this.height  = HEIGHT;
  }

  update(dt) {
    if (this.#hitFlash  > 0) this.#hitFlash  -= dt;
    if (this.#aggroFlash > 0) this.#aggroFlash -= dt;

    this.#updateAggro();
    this.#move(dt);
    if (this.#aggroed) this.#updateFire(dt);
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
      this.#keepDistance(dt);
    } else {
      this.#wander(dt);
    }
  }

  #keepDistance(dt) {
    const dx   = this.#player.x - this.x;
    const dy   = this.#player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx   = dx / dist;
    const ny   = dy / dist;

    // Perpendicular for strafing
    const px = -ny;
    const py =  nx;

    // Flip strafe direction periodically
    this.#strafeDirTimer -= dt;
    if (this.#strafeDirTimer <= 0) {
      this.#strafeDir      = -this.#strafeDir;
      this.#strafeDirTimer = 2 + Math.random() * 2;
    }

    let desiredX, desiredY;
    if (dist < MIN_DIST) {
      // Flee away
      desiredX = -nx;
      desiredY = -ny;
    } else if (dist > MAX_DIST) {
      // Close in
      desiredX = nx;
      desiredY = ny;
    } else {
      // Strafe sideways
      desiredX = px * this.#strafeDir;
      desiredY = py * this.#strafeDir;
    }

    const desiredAngle = Math.atan2(desiredY, desiredX);
    this.#headingAngle = _steerToward(this.#headingAngle, desiredAngle, TURN_RATE, dt);

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
    this.#headingAngle = _steerToward(this.#headingAngle, target, 1.2, dt);

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
    this.#wanderTimer = 2 + Math.random() * 3;
  }

  #updateFire(dt) {
    this.#fireTimer -= dt;
    if (this.#fireTimer <= 0) {
      this.#fireTimer = FIRE_INTERVAL;
      this.#shoot();
    }
  }

  #shoot() {
    this.#game.add(new EnemyBullet(this.x, this.y, this.#player, this.#game));
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

    // Body — purple
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(left, top, this.width, this.height);

    // Eye — tracks player when aggroed, looks along heading when idle
    {
      let eyeX, eyeY;
      if (this.#aggroed && !this.#player.invisible) {
        const dx   = this.#player.x - this.x;
        const dy   = this.#player.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        eyeX = Math.round(this.x + (dx / dist) * 10);
        eyeY = Math.round(this.y + (dy / dist) * 10);
      } else {
        eyeX = Math.round(this.x + Math.cos(this.#headingAngle) * 10);
        eyeY = Math.round(this.y + Math.sin(this.#headingAngle) * 10);
      }
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
      ctx.fillStyle = this.#aggroed ? '#e74c3c' : '#95a5a6';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.#aggroed ? '#ff8a80' : '#bdc3c7';
      ctx.fill();
    }

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

    ctx.strokeStyle = '#6c3483';
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
