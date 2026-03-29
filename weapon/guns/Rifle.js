import { Gun }    from './Gun.js';
import { Bullet } from '../../projectile/Bullet.js';

export class Rifle extends Gun {
	constructor() {
		super({
			name:            'Rifle',
			damage:          40,
			projectile:      Bullet,
			fireRate:        0.1,
			magazine:        30,
			ammo:            120,
			reloadTime:      2.2,
			range:           -1,
			projectileSpeed: 800,
		});
	}
}
