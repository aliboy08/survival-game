import { Melee } from './Melee.js';

export class Sword extends Melee {
	constructor() {
		super({
			name:        'Sword',
			damage:      40,
			range:       80,
			attackSpeed: 1.2,
		});
		this.category = 'melee';
	}
}
