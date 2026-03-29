import { Mod } from '../Mod.js';

export class ElectricMod extends Mod {
	#amount;

	constructor(amount = 12) {
		super({
			name:        'Electric',
			description: `+${amount} electric damage`,
			type:        'elemental',
		});
		this.#amount = amount;
	}

	apply(weapon)  { weapon.electricDamage = (weapon.electricDamage ?? 0) + this.#amount; }
	remove(weapon) { weapon.electricDamage = (weapon.electricDamage ?? 0) - this.#amount; }
}
