import { GameObject }     from '../core/GameObject.js';
import { loadPlayerSprites } from './sprite.js';
import { Movement }         from './movement.js';

const SPRITE_SCALE = 2; // 48x48 → 96x96
const SPRITE_SIZE  = 48;

export class Player extends GameObject {
  #sprites   = null;
  #direction = 'south';
  #input;
  #movement  = new Movement();

  constructor(x, y, input) {
    super();
    this.x      = x;
    this.y      = y;
    this.width  = SPRITE_SIZE * SPRITE_SCALE;
    this.height = SPRITE_SIZE * SPRITE_SCALE;
    this.#input = input;
  }

  async init() {
    this.#sprites = await loadPlayerSprites();
    super.init();
  }

  get direction() { return this.#direction; }

  set direction(dir) {
    if (this.#sprites && !(dir in this.#sprites)) {
      console.warn(`Unknown direction: ${dir}`);
      return;
    }
    this.#direction = dir;
  }

  update(dt) {
    const dir = this.#movement.update(this, this.#input, dt);
    if (dir) this.#direction = dir;
    super.update(dt);
  }

  draw(ctx) {
    if (!this.#sprites) return;

    ctx.drawImage(
      this.#sprites[this.#direction],
      Math.round(this.x - this.width  / 2),
      Math.round(this.y - this.height / 2),
      this.width,
      this.height,
    );

    super.draw(ctx);
  }
}
