import { Gun }    from './Gun.js';
import { Bullet } from '../../projectile/Bullet.js';

export class Pistol extends Gun {
  constructor() {
    super({
      name:          'Pistol',
      damage:        25,
      projectile: Bullet,
      fireRate:      0.3,
      magazine:      12,
      ammo:          60,
      reloadTime:    1.5,
    });
  }
}
