import { Mod } from '../Mod.js';

export class HpMod extends Mod {
	#amount;

	constructor(amount = 25) {
		super({
			name:        'Max HP',
			description: `+${amount} max HP`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player) {
		player.maxHp += this.#amount;
		player.hp     = Math.min(player.hp + this.#amount, player.maxHp);
	}

	remove(player) {
		player.maxHp -= this.#amount;
		player.hp     = Math.min(player.hp, player.maxHp);
	}
}
