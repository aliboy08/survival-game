import { Weapon } from '../Weapon.js';

export class Gun extends Weapon {
  constructor({ name, damage, projectile, fireRate, magazine, ammo, reloadTime }) {
    super({ name, damage, projectile });
    this.fireRate        = fireRate;
    this.magazine        = magazine;
    this.ammo            = ammo;
    this.reloadTime      = reloadTime;
    this.currentMagazine = magazine;
  }
}
