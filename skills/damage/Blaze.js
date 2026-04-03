import { Skill }  from '../Skill.js';
import { Enemy }  from '../../enemy/enemy.js';

export class Blaze extends Skill {
	constructor() {
		super({
			name:        'Blaze',
			description: 'Channel fire around you, burning nearby enemies',
			category:    'damage',
			energyCost:  0,
			cooldown:    3,
			channeling:  true,
			drainRate:   8, // energy per second
			range:       80,
			strength:    40, // damage per second
		});
	}

	update(dt, player, game) {
		for (const enemy of game.getEntities(Enemy)) {
			const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			if (dist <= this.range) enemy.takeDamage(this.effectiveStrength(player) * dt);
		}
	}
}
