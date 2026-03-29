import { Mod } from '../Mod.js';

export class DamageMod extends Mod {
	#amount;

	constructor(amount = 20) {
		super({
			name:        'Damage',
			description: `+${amount} damage`,
			type:        'stat',
		});
		this.#amount = amount;
	}

	apply(weapon)  { weapon.damage += this.#amount; }
	remove(weapon) { weapon.damage -= this.#amount; }
}
