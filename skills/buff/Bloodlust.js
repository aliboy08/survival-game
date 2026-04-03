import { Skill } from '../Skill.js';

const HEAL_PER_KILL = 15;

export class Bloodlust extends Skill {
	#killHandler = null;

	constructor() {
		super({
			name:        'Bloodlust',
			description: `Heals ${HEAL_PER_KILL} HP on each kill while active`,
			category:    'buff',
			energyCost:  20,
			cooldown:    10,
			duration:    6,
		});
	}

	activate(player, game) {
		this.#killHandler = () => {
			player.hp = Math.min(player.maxHp, player.hp + HEAL_PER_KILL);
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
