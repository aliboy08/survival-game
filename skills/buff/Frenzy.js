import { Skill } from '../Skill.js';
import { Gun }   from '../../weapon/guns/Gun.js';

export class Frenzy extends Skill {
	#saved = new Map();

	constructor() {
		super({
			name:        'Frenzy',
			description: 'Doubles weapon fire rate temporarily',
			category:    'buff',
			energyCost:  35,
			cooldown:    12,
			duration:    5,
			strength:    2, // fire rate multiplier
		});
	}

	activate(player, game) {
		this.#saved.clear();
		const { primary, secondary, melee } = player.equipment;
		for (const weapon of [primary, secondary, melee]) {
			if (weapon instanceof Gun) {
				this.#saved.set(weapon, weapon.fireRate);
				weapon.fireRate = weapon.fireRate / this.effectiveStrength(player); // lower = faster
			}
		}
	}

	deactivate(player, game) {
		for (const [weapon, rate] of this.#saved) weapon.fireRate = rate;
		this.#saved.clear();
	}
}
