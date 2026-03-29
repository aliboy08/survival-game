import { Gun }    from './Gun.js';
import { Bullet } from '../../projectile/Bullet.js';

export class Revolver extends Gun {
	constructor() {
		super({
			name:            'Revolver',
			damage:          60,
			projectile:      Bullet,
			fireRate:        0.6,
			magazine:        6,
			ammo:            36,
			reloadTime:      2.0,
			range:           -1,
			projectileSpeed: -1,
		});
		this.category = 'secondary';
	}
}
