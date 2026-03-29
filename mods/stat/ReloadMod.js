import { Mod } from '../Mod.js';

const MIN_RELOAD_TIME = 0.3;

export class ReloadMod extends Mod {
	#amount;

	constructor(amount = 0.3) {
		super({
			name:        'Reload',
			description: `−${amount}s reload time`,
			type:        'stat',
		});
		this.#amount = amount;
	}

	apply(weapon) {
		if (weapon.reloadTime === undefined) return;
		weapon.reloadTime = Math.max(MIN_RELOAD_TIME, weapon.reloadTime - this.#amount);
	}

	remove(weapon) {
		if (weapon.reloadTime === undefined) return;
		weapon.reloadTime += this.#amount;
	}
}
