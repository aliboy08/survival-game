import { Mod } from '../Mod.js';

export class DurationMod extends Mod {
	#amount;

	constructor(amount = 0.25) {
		super({
			name:        'Skill Duration',
			description: `+${Math.round(amount * 100)}% skill duration`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.skillDurationMult += this.#amount; }
	remove(player) { player.skillDurationMult -= this.#amount; }
}
