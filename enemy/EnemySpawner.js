import { GameObject } from '../core/GameObject.js';
import { Enemy }      from './enemy.js';

const SPAWN_INTERVAL = 2;   // seconds between spawns
const MAX_ENEMIES    = 10;
const PADDING        = 60;  // keep away from screen edges

export class EnemySpawner extends GameObject {
  #game;
  #timer = 0;

  constructor(game) {
    super();
    this.#game = game;
  }

  update(dt) {
    this.#timer += dt;

    if (this.#timer >= SPAWN_INTERVAL) {
      this.#timer = 0;

      const current = this.#game.getEntities(Enemy).length;
      if (current < MAX_ENEMIES) this.#spawn();
    }

    super.update(dt);
  }

  #spawn() {
    const { width, height } = this.#game.canvas;
    const x = PADDING + Math.random() * (width  - PADDING * 2);
    const y = PADDING + Math.random() * (height - PADDING * 2);
    this.#game.add(new Enemy(x, y));
  }
}
