import { Gun } from '../weapon/guns/Gun.js';

export class WeaponSwitchButton {
	#player;
	#shootSystem;
	#btn;
	#ammoDisplay;
	#slotBadges = {};

	constructor(player, shootSystem) {
		this.#player      = player;
		this.#shootSystem = shootSystem;
		this.#build();
		player.on('weaponswitch', () => this.#updateLabel());
		this.#tick();
	}

	#build() {
		const container  = document.getElementById('hud-bottom-right');
		const firstRow   = document.getElementById('hud-br-row-secondary');

		// ── Weapon slot indicator (topmost in container) ──────────────
		const indicator = document.createElement('div');
		indicator.id = 'weapon-indicator';

		for (const { key, label } of [
			{ key: 'primary',   label: 'PRI' },
			{ key: 'secondary', label: 'SEC' },
			{ key: 'melee',     label: 'MEL' },
		]) {
			const badge = document.createElement('span');
			badge.className = 'wi-slot';
			badge.dataset.slot = key;
			badge.textContent  = label;
			indicator.appendChild(badge);
			this.#slotBadges[key] = badge;
		}

		container.insertBefore(indicator, firstRow);

		// ── Ammo display (below indicator, above rows) ────────────────
		this.#ammoDisplay = document.createElement('div');
		this.#ammoDisplay.id = 'ammo-display';
		container.insertBefore(this.#ammoDisplay, firstRow);

		// ── Switch button (in secondary row) ─────────────────────────
		this.#btn = document.createElement('button');
		this.#btn.id = 'weapon-switch-button';
		this.#updateLabel();
		this.#btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#player.cycleWeapon();
		});
		firstRow.appendChild(this.#btn);
	}

	#updateLabel() {
		this.#btn.textContent = 'SWITCH';
	}

	#tick() {
		// Update ammo display
		const weapon = this.#player.activeWeapon;
		if (weapon instanceof Gun) {
			if (this.#shootSystem?.reloading) {
				this.#ammoDisplay.textContent = 'RELOADING...';
				this.#ammoDisplay.classList.add('reloading');
			} else {
				this.#ammoDisplay.textContent = `${weapon.currentMagazine} / ${weapon.magazine}  |  ${weapon.ammo}`;
				this.#ammoDisplay.classList.remove('reloading');
			}
			this.#ammoDisplay.style.display = '';
		} else {
			this.#ammoDisplay.style.display = 'none';
		}

		// Update weapon slot indicator
		const active = this.#player.activeSlot;
		for (const [key, badge] of Object.entries(this.#slotBadges)) {
			badge.classList.toggle('active', key === active);
		}

		requestAnimationFrame(() => this.#tick());
	}
}
