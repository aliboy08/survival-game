import { Skill } from '../Skill.js';

export class Adrenaline extends Skill {
	constructor() {
		super({
			name:        'Adrenaline',
			description: 'Greatly increases movement speed',
			category:    'buff',
			energyCost:  25,
			cooldown:    8,
			duration:    5,
		});
	}

	activate(player, game)   { player.speedMultiplier = 2.0; }
	deactivate(player, game) { player.speedMultiplier = 1.0; }
}
