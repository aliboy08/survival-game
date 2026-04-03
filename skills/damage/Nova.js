import { Skill }  from '../Skill.js';
import { Enemy }  from '../../enemy/enemy.js';

export class Nova extends Skill {
	constructor() {
		super({
			name:        'Nova',
			description: 'Burst of energy damages all nearby enemies',
			category:    'damage',
			energyCost:  30,
			cooldown:    8,
			range:       150,
			strength:    80,
		});
	}

	activate(player, game) {
		for (const enemy of game.getEntities(Enemy)) {
			const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			if (dist <= this.range) enemy.takeDamage(this.strength);
		}
	}
}
