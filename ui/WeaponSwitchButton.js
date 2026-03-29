import { Gun } from '../weapon/guns/Gun.js';

export class WeaponSwitchButton {
	#player;
	#shootSystem;
	#btn;
	#ammoDisplay;

	constructor(player, shootSystem) {
		this.#player      = player;
		this.#shootSystem = shootSystem;
		this.#build();
		player.on('weaponswitch', () => this.#updateLabel());
		this.#tick();
	}

	#build() {
		this.#btn = document.createElement('button');
		this.#btn.id = 'weapon-switch-button';
		this.#updateLabel();
		this.#btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#player.cycleWeapon();
		});
		document.body.appendChild(this.#btn);

		this.#ammoDisplay = document.createElement('div');
		this.#ammoDisplay.id = 'ammo-display';
		document.body.appendChild(this.#ammoDisplay);
	}

	#updateLabel() {
		this.#btn.textContent = 'SWITCH';
	}

	#tick() {
		const weapon = this.#player.activeWeapon;
		if (weapon instanceof Gun) {
			if (this.#shootSystem?.reloading) {
				this.#ammoDisplay.textContent = 'RELOADING...';
				this.#ammoDisplay.classList.add('reloading');
			} else {
				this.#ammoDisplay.textContent = `${weapon.currentMagazine} / ${weapon.magazine}  |  ${weapon.ammo}`;
				this.#ammoDisplay.classList.remove('reloading');
			}
			this.#ammoDisplay.style.display = 'block';
		} else {
			this.#ammoDisplay.style.display = 'none';
		}
		requestAnimationFrame(() => this.#tick());
	}
}
