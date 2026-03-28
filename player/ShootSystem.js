import { GameObject }  from '../core/GameObject.js';
import { Enemy }       from '../enemy/enemy.js';
import { Projectile }  from '../projectile/projectile.js';

const FIRE_RATE = 0.15; // seconds between shots

export class ShootSystem extends GameObject {
  #game;
  #player;
  #input;
  #cooldown = 0;

  constructor(game, player, input) {
    super();
    this.#game   = game;
    this.#player = player;
    this.#input  = input;
  }

  update(dt) {
    if (this.#cooldown > 0) this.#cooldown -= dt;

    if (!this.#input.shootHeld || this.#cooldown > 0) return;

    const enemies = this.#game.getEntities(Enemy);
    if (enemies.length === 0) return;

    const player  = this.#player;
    const closest = enemies.reduce((nearest, enemy) => {
      const d = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      return d < Math.hypot(nearest.x - player.x, nearest.y - player.y) ? enemy : nearest;
    });

    this.#game.add(new Projectile(player.x, player.y, closest, this.#game));
    this.#cooldown = FIRE_RATE;

    super.update(dt);
  }
}
