import { Skill } from '../Skill.js';

export class Shield extends Skill {
	constructor() {
		super({
			name:        'Shield',
			description: 'Grants temporary damage immunity',
			category:    'buff',
			energyCost:  40,
			cooldown:    15,
			duration:    4,
		});
	}

	activate(player, game)   { player.shielded = true;  }
	deactivate(player, game) { player.shielded = false; }
}
