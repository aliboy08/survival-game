import { Weapon } from '../Weapon.js';

export class Melee extends Weapon {
	constructor({ name, damage, range, attackSpeed }) {
		super({ name, damage });
		this.range       = range;
		this.attackSpeed = attackSpeed;
	}
}
