import { Mod } from '../Mod.js';

export class FireMod extends Mod {
	#amount;

	constructor(amount = 15) {
		super({
			name:        'Fire',
			description: `+${amount} fire damage`,
			type:        'elemental',
		});
		this.#amount = amount;
	}

	apply(weapon)  { weapon.fireDamage = (weapon.fireDamage ?? 0) + this.#amount; }
	remove(weapon) { weapon.fireDamage = (weapon.fireDamage ?? 0) - this.#amount; }
}
