import { Gun }         from './Gun.js';
import { HomingBullet } from '../../projectile/HomingBullet.js';

export class HomingGun extends Gun {
  constructor() {
    super({
      name:            'Homing Gun',
      damage:          20,
      projectile:      HomingBullet,
      fireRate:        0.5,
      magazine:        12,
      ammo:            72,
      reloadTime:      1.8,
      range:           -1,
      projectileSpeed: 400,
    });
    this.category = 'secondary';
  }
}
