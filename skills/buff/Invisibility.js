import { Skill } from '../Skill.js';

export class Invisibility extends Skill {
	constructor() {
		super({
			name:        'Invisibility',
			description: 'Become invisible — enemies lose sight of you',
			category:    'buff',
			energyCost:  25,
			cooldown:    20,
			duration:    8,
		});
	}

	activate(player) {
		player.invisible = true;
	}

	deactivate(player) {
		player.invisible = false;
	}
}
