import { Mod } from '../Mod.js';

export class StrengthMod extends Mod {
	#amount;

	constructor(amount = 0.25) {
		super({
			name:        'Skill Strength',
			description: `+${Math.round(amount * 100)}% skill effectiveness`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.skillStrengthMult += this.#amount; }
	remove(player) { player.skillStrengthMult -= this.#amount; }
}
