import { Mod } from '../Mod.js';

export class ToxicMod extends Mod {
	#amount;

	constructor(amount = 10) {
		super({
			name:        'Toxic',
			description: `+${amount} toxic damage`,
			type:        'elemental',
		});
		this.#amount = amount;
	}

	apply(weapon)  { weapon.toxicDamage = (weapon.toxicDamage ?? 0) + this.#amount; }
	remove(weapon) { weapon.toxicDamage = (weapon.toxicDamage ?? 0) - this.#amount; }
}
