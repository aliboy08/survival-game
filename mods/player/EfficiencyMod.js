import { Mod } from '../Mod.js';

export class EfficiencyMod extends Mod {
	#amount;

	constructor(amount = 0.20) {
		super({
			name:        'Efficiency',
			description: `−${Math.round(amount * 100)}% skill energy cost`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.skillCostMult -= this.#amount; }
	remove(player) { player.skillCostMult += this.#amount; }
}
