import { GameObject } from '../core/GameObject.js';
import { Laser }      from '../projectile/Laser.js';

const DIRECTION_VECTORS = {
  'north':      { x:  0, y: -1 },
  'north-east': { x:  1, y: -1 },
  'east':       { x:  1, y:  0 },
  'south-east': { x:  1, y:  1 },
  'south':      { x:  0, y:  1 },
  'south-west': { x: -1, y:  1 },
  'west':       { x: -1, y:  0 },
  'north-west': { x: -1, y: -1 },
};

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
      this.#updateGun(dt, shouldShoot);
    }

    super.update(dt);
  }

  #updateGun(dt, shouldShoot) {
    if (this.#cooldown > 0) this.#cooldown -= dt;
    if (this.#cooldown > 0 || !shouldShoot) return;

    const player = this.#player;
    const weapon = player.equipment.primary;
    if (!weapon) return;

    const dir    = DIRECTION_VECTORS[player.facing] ?? DIRECTION_VECTORS['south'];
    const target = { x: player.x + dir.x * 100, y: player.y + dir.y * 100 };

    this.#game.add(new weapon.projectile(player.x, player.y, target, this.#game));
    this.#cooldown = weapon.fireRate;
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
