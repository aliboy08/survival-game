import { Mod } from '../Mod.js';

export class ShieldRegenMod extends Mod {
	#amount;

	constructor(amount = 4) {
		super({
			name:        'Shield Regen',
			description: `+${amount}/s shield regeneration`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.shieldRegen += this.#amount; }
	remove(player) { player.shieldRegen -= this.#amount; }
}
