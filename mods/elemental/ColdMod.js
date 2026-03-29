import { Mod } from '../Mod.js';

export class ColdMod extends Mod {
	#amount;

	constructor(amount = 12) {
		super({
			name:        'Cold',
			description: `+${amount} cold damage`,
			type:        'elemental',
		});
		this.#amount = amount;
	}

	apply(weapon)  { weapon.coldDamage = (weapon.coldDamage ?? 0) + this.#amount; }
	remove(weapon) { weapon.coldDamage = (weapon.coldDamage ?? 0) - this.#amount; }
}
