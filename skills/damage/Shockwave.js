import { Skill }  from '../Skill.js';
import { Enemy }  from '../../enemy/enemy.js';

const RANGE    = 200;
const HALF_FOV = Math.PI / 4; // 45° half-angle → 90° total cone

const FACING_VECTORS = {
	'north':      { x:  0, y: -1 },
	'north-east': { x:  1, y: -1 },
	'east':       { x:  1, y:  0 },
	'south-east': { x:  1, y:  1 },
	'south':      { x:  0, y:  1 },
	'south-west': { x: -1, y:  1 },
	'west':       { x: -1, y:  0 },
	'north-west': { x: -1, y: -1 },
};

export class Shockwave extends Skill {
	constructor() {
		super({
			name:        'Shockwave',
			description: 'Damages enemies in a forward cone',
			category:    'damage',
			energyCost:  25,
			cooldown:    6,
			damage:      60,
		});
	}

	activate(player, game) {
		const fv   = FACING_VECTORS[player.facing] ?? { x: 0, y: 1 };
		const fLen = Math.hypot(fv.x, fv.y);
		const fx   = fv.x / fLen;
		const fy   = fv.y / fLen;
		const minDot = Math.cos(HALF_FOV);

		for (const enemy of game.getEntities(Enemy)) {
			const dx   = enemy.x - player.x;
			const dy   = enemy.y - player.y;
			const dist = Math.hypot(dx, dy);
			if (dist === 0 || dist > RANGE) continue;
			const dot = (dx / dist) * fx + (dy / dist) * fy;
			if (dot >= minDot) enemy.takeDamage(this.damage);
		}
	}
}
