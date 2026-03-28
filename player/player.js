import { GameObject }      from '../core/GameObject.js';
import { loadPlayerSprites } from './sprite.js';
import { Animator }          from './animator.js';
import { Movement }          from './movement.js';

const SPRITE_SCALE      = 2; // 48x48 → 96x96
const SPRITE_SIZE       = 48;
const MAX_HP            = 100;
const DAMAGE_COOLDOWN   = 1; // seconds of invincibility after a hit

export class Player extends GameObject {
  #animator        = null;
  #direction       = 'south';
  #input;
  #movement        = new Movement();
  #damageCooldown  = 0;

  hp    = MAX_HP;
  maxHp = MAX_HP;

  constructor(x, y, input) {
    super();
    this.x      = x;
    this.y      = y;
    this.width  = SPRITE_SIZE * SPRITE_SCALE;
    this.height = SPRITE_SIZE * SPRITE_SCALE;
    this.#input = input;
  }

  async init() {
    const sprites  = await loadPlayerSprites();
    this.#animator = new Animator(sprites);
    super.init();
  }

  takeDamage(amount) {
    if (this.#damageCooldown > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.#damageCooldown = DAMAGE_COOLDOWN;
  }

  update(dt) {
    if (this.#damageCooldown > 0) this.#damageCooldown -= dt;

    const dir = this.#movement.update(this, this.#input, dt);

    if (dir) {
      this.#direction = dir;
      this.#animator.setState('walk');
    } else {
      this.#animator.setState('breathing-idle');
    }

    this.#animator.update(dt);
    super.update(dt);
  }

  draw(ctx) {
    if (!this.#animator) return;

    ctx.drawImage(
      this.#animator.getFrame(this.#direction),
      Math.round(this.x - this.width  / 2),
      Math.round(this.y - this.height / 2),
      this.width,
      this.height,
    );

    super.draw(ctx);
  }
}
