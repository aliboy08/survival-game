import { Skill }  from '../Skill.js';
import { Enemy }  from '../../enemy/enemy.js';

const RADIUS    = 80;
const DAMAGE_PS = 40; // damage per second

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
		});
	}

	update(dt, player, game) {
		for (const enemy of game.getEntities(Enemy)) {
			const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			if (dist <= RADIUS) enemy.takeDamage(DAMAGE_PS * dt);
		}
	}
}
