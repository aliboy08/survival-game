import { Mod } from '../Mod.js';

export class ShieldMod extends Mod {
	#amount;

	constructor(amount = 25) {
		super({
			name:        'Max Shield',
			description: `+${amount} max shield`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player) {
		player.maxShield += this.#amount;
		player.shield     = Math.min(player.shield + this.#amount, player.maxShield);
	}

	remove(player) {
		player.maxShield -= this.#amount;
		player.shield     = Math.min(player.shield, player.maxShield);
	}
}
