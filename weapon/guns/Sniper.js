import { Gun }    from './Gun.js';
import { Bullet } from '../../projectile/Bullet.js';

export class Sniper extends Gun {
	constructor() {
		super({
			name:            'Sniper',
			damage:          150,
			projectile:      Bullet,
			fireRate:        1.8,
			magazine:        5,
			ammo:            25,
			reloadTime:      2.8,
			range:           -1,
			projectileSpeed: -1,
		});
		this.category = 'primary';
	}
}
