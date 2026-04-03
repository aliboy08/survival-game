import { Mod } from '../Mod.js';

export class CooldownMod extends Mod {
	#amount;

	constructor(amount = 0.15) {
		super({
			name:        'Cooldown',
			description: `−${Math.round(amount * 100)}% skill cooldown`,
			type:        'player',
		});
		this.#amount = amount;
	}

	apply(player)  { player.skillCooldownMult -= this.#amount; }
	remove(player) { player.skillCooldownMult += this.#amount; }
}
