import { EventEmitter } from './EventEmitter.js';

export class WeaponSelector extends EventEmitter {
  #active = 'bullet';

  get activeWeapon() { return this.#active; }

  select(weapon) {
    if (weapon === this.#active) return;
    this.#active = weapon;
    this.emit('change', weapon);
  }
}
