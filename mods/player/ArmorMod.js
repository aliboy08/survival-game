import { Mod } from '../Mod.js';

export class ArmorMod extends Mod {
	#amount;

	constructor(amount = 5) {
		super({
			name:        'Armor',
			description: `+${amount} armor (flat damage reduction)`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.armor += this.#amount; }
	remove(player) { player.armor -= this.#amount; }
}
