import { GameObject } from '../core/GameObject.js';
import { Enemy }      from './enemy.js';

const SPAWN_INTERVAL = 2;  // seconds between spawns
const MAX_ENEMIES    = 10;

export class EnemySpawner extends GameObject {
  #game;
  #player;
  #timer = 0;

  constructor(game, player) {
    super();
    this.#game   = game;
    this.#player = player;
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
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0: x = Math.random() * width;  y = 0;       break; // top
      case 1: x = Math.random() * width;  y = height;  break; // bottom
      case 2: x = 0;                      y = Math.random() * height; break; // left
      case 3: x = width;                  y = Math.random() * height; break; // right
    }

    this.#game.add(new Enemy(x, y, this.#player));
  }
}
