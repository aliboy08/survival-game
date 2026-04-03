import { Skill } from '../Skill.js';

export class Bloodlust extends Skill {
	#killHandler = null;

	constructor() {
		super({
			name:        'Bloodlust',
			description: 'Heals HP on each kill while active',
			category:    'buff',
			energyCost:  20,
			cooldown:    10,
			duration:    6,
			strength:    15, // HP healed per kill
		});
	}

	activate(player, game) {
		this.#killHandler = () => {
			player.hp = Math.min(player.maxHp, player.hp + this.effectiveStrength(player));
		};
		player.on('kill', this.#killHandler);
	}

	deactivate(player, game) {
		if (this.#killHandler) {
			player.off('kill', this.#killHandler);
			this.#killHandler = null;
		}
	}
}
