import { GameObject }  from '../core/GameObject.js';
import { Enemy }       from '../enemy/enemy.js';
import { Projectile }  from '../projectile/projectile.js';

export class ShootSystem extends GameObject {
  #game;
  #player;
  #input;

  constructor(game, player, input) {
    super();
    this.#game   = game;
    this.#player = player;
    this.#input  = input;
  }

  update(dt) {
    if (!this.#input.consumeShoot()) return;

    const enemies = this.#game.getEntities(Enemy);
    if (enemies.length === 0) return;

    const player  = this.#player;
    const closest = enemies.reduce((nearest, enemy) => {
      const d = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      return d < Math.hypot(nearest.x - player.x, nearest.y - player.y) ? enemy : nearest;
    });

    this.#game.add(new Projectile(player.x, player.y, closest, this.#game));

    super.update(dt);
  }
}
