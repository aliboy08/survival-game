import { Weapon } from '../Weapon.js';

export class Gun extends Weapon {
  constructor({ name, damage, projectile, fireRate, magazine, ammo }) {
    super({ name, damage, projectile });
    this.fireRate = fireRate;     // seconds between shots
    this.magazine = magazine;     // shots per magazine
    this.ammo = ammo;             // total ammo remaining
    this.currentMagazine = magazine;
  }
}
