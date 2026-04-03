import { Mod } from '../Mod.js';

export class EnergyMod extends Mod {
	#amount;

	constructor(amount = 25) {
		super({
			name:        'Max Energy',
			description: `+${amount} max energy`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.maxEnergy += this.#amount; }
	remove(player) { player.maxEnergy -= this.#amount; player.energy = Math.min(player.energy, player.maxEnergy); }
}
