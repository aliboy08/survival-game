import { Mod } from '../Mod.js';

const MIN_FIRE_RATE = 0.05;

export class FireRateMod extends Mod {
	#amount;

	constructor(amount = 0.05) {
		super({
			name:        'Fire Rate',
			description: `−${amount}s fire interval`,
			type:        'stat',
		});
		this.#amount = amount;
	}

	apply(weapon) {
		if (weapon.fireRate === undefined) return;
		weapon.fireRate = Math.max(MIN_FIRE_RATE, weapon.fireRate - this.#amount);
	}

	remove(weapon) {
		if (weapon.fireRate === undefined) return;
		weapon.fireRate += this.#amount;
	}
}
