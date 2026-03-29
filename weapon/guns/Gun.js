import { Weapon } from '../Weapon.js';

export class Gun extends Weapon {
  constructor({ name, damage, projectile, fireRate, magazine, ammo, reloadTime, range = -1, projectileSpeed = 500 }) {
    super({ name, damage, projectile });
    this.fireRate        = fireRate;
    this.magazine        = magazine;
    this.ammo            = ammo;
    this.reloadTime      = reloadTime;
    this.currentMagazine = magazine;
    this.range           = range;
    this.projectileSpeed = projectileSpeed;
  }
}
