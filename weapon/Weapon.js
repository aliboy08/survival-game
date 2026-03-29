import { ModSlots } from '../mods/ModSlots.js';

export class Weapon {
  constructor({ name, damage, projectile }) {
    this.name      = name;
    this.damage    = damage;
    this.projectile = projectile;
    this.modSlots  = new ModSlots(this);
  }
}
