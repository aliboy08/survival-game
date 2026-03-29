import { Melee } from './Melee.js';

export class Greatsword extends Melee {
	constructor() {
		super({
			name:        'Greatsword',
			damage:      90,
			range:       140,
			attackSpeed: 2.0,
		});
		this.category = 'melee';
	}
}
