import { Skill } from '../Skill.js';
import { Gun }   from '../../weapon/guns/Gun.js';

export class Overclock extends Skill {
	#saved = new Map();

	constructor() {
		super({
			name:        'Overclock',
			description: 'Instant reload all weapons and near-zero reload time',
			category:    'buff',
			energyCost:  30,
			cooldown:    10,
			duration:    4,
		});
	}

	activate(player, game) {
		this.#saved.clear();
		const { primary, secondary, melee } = player.equipment;
		for (const weapon of [primary, secondary, melee]) {
			if (weapon instanceof Gun) {
				this.#saved.set(weapon, weapon.reloadTime);
				weapon.currentMagazine = weapon.magazine;
				weapon.reloadTime      = 0.1;
			}
		}
	}

	deactivate(player, game) {
		for (const [weapon, time] of this.#saved) weapon.reloadTime = time;
		this.#saved.clear();
	}
}
