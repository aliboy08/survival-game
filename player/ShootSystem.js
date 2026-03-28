import { GameObject } from '../core/GameObject.js';
import { Enemy }      from '../enemy/enemy.js';
import { Bullet }     from '../projectile/Bullet.js';
import { Laser }      from '../projectile/Laser.js';

const BULLET_FIRE_RATE = 0.15;

export class ShootSystem extends GameObject {
  #game;
  #player;
  #input;
  #selector;
  #cooldown    = 0;
  #autoShoot   = false;
  #activeLaser = null;

  constructor(game, player, input, selector) {
    super();
    this.#game     = game;
    this.#player   = player;
    this.#input    = input;
    this.#selector = selector;
  }

  get autoShoot() { return this.#autoShoot; }

  toggleAutoShoot() {
    this.#autoShoot = !this.#autoShoot;
    return this.#autoShoot;
  }

  update(dt) {
    const weapon      = this.#selector.activeWeapon;
    const shouldShoot = this.#input.shootHeld || this.#autoShoot;

    if (weapon === 'laser') {
      this.#updateLaser(shouldShoot);
    } else {
      this.#killLaser();
      this.#updateBullet(dt, shouldShoot);
    }

    super.update(dt);
  }

  #updateBullet(dt, shouldShoot) {
    if (this.#cooldown > 0) this.#cooldown -= dt;
    if (this.#cooldown > 0 || !shouldShoot) return;

    const enemies = this.#game.getEntities(Enemy);
    if (enemies.length === 0) return;

    const player  = this.#player;
    const closest = enemies.reduce((nearest, enemy) =>
      Math.hypot(enemy.x - player.x, enemy.y - player.y) <
      Math.hypot(nearest.x - player.x, nearest.y - player.y) ? enemy : nearest
    );

    this.#game.add(new Bullet(player.x, player.y, closest, this.#game));
    this.#cooldown = BULLET_FIRE_RATE;
  }

  #updateLaser(shouldShoot) {
    if (shouldShoot) {
      if (!this.#activeLaser || this.#activeLaser.dead) {
        this.#activeLaser = new Laser(this.#player, this.#game);
        this.#game.add(this.#activeLaser);
      }
    } else {
      this.#killLaser();
    }
  }

  #killLaser() {
    if (this.#activeLaser) {
      this.#activeLaser.dead = true;
      this.#activeLaser = null;
    }
  }
}
