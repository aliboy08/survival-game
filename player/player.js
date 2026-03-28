import { GameObject } from '../core/GameObject.js';
import { loadPlayerSprites } from './sprite.js';

const SPRITE_SCALE = 2; // 48x48 → 96x96
const SPRITE_SIZE  = 48;
const SPEED        = 150; // pixels per second

const DIRECTION_MAP = {
  '0,-1':  'north',
  '1,-1':  'north-east',
  '1,0':   'east',
  '1,1':   'south-east',
  '0,1':   'south',
  '-1,1':  'south-west',
  '-1,0':  'west',
  '-1,-1': 'north-west',
};

export class Player extends GameObject {
  #sprites   = null;
  #direction = 'south';
  #input;

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
    const { x, y } = this.#input.movement;

    if (x !== 0 || y !== 0) {
      // normalize diagonal movement
      const len = Math.sqrt(x * x + y * y);
      this.x += (x / len) * SPEED * dt;
      this.y += (y / len) * SPEED * dt;

      const dir = DIRECTION_MAP[`${x},${y}`];
      if (dir) this.#direction = dir;
    }

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
