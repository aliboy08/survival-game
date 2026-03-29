import { Rifle }     from '../weapon/guns/Rifle.js';
import { Pistol }    from '../weapon/guns/Pistol.js';
import { Revolver }  from '../weapon/guns/Revolver.js';
import { HomingGun } from '../weapon/guns/HomingGun.js';
import { Sword }     from '../weapon/melee/Sword.js';

const WEAPON_REGISTRY = {
	primary:   [Rifle],
	secondary: [Pistol, Revolver, HomingGun],
	melee:     [Sword],
};

function getStats(weapon) {
	if (weapon.magazine !== undefined) {
		return `DMG ${weapon.damage}  ·  ${weapon.magazine} / ${weapon.ammo}`;
	}
	return `DMG ${weapon.damage}  ·  SPD ${weapon.attackSpeed}s`;
}

export class EquipmentSelectUI {
	#player;
	#overlay;
	#slotLists = {};

	constructor(player) {
		this.#player = player;
		this.#build();
	}

	#build() {
		const openBtn = document.createElement('button');
		openBtn.id = 'equip-open-btn';
		openBtn.textContent = 'EQUIP';
		openBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#toggle();
		});
		document.body.appendChild(openBtn);

		this.#overlay = document.createElement('div');
		this.#overlay.id = 'equip-overlay';
		this.#overlay.addEventListener('pointerdown', (e) => {
			if (e.target === this.#overlay) this.#close();
		});

		const panel = document.createElement('div');
		panel.id = 'equip-panel';

		// Title bar
		const titleBar = document.createElement('div');
		titleBar.id = 'equip-title-bar';

		const title = document.createElement('div');
		title.id = 'equip-title';
		title.textContent = 'EQUIPMENT';
		titleBar.appendChild(title);

		const closeBtn = document.createElement('button');
		closeBtn.id = 'equip-close-btn';
		closeBtn.textContent = 'X';
		closeBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#close();
		});
		titleBar.appendChild(closeBtn);
		panel.appendChild(titleBar);

		// Columns
		const cols = document.createElement('div');
		cols.id = 'equip-columns';

		for (const [slot, weaponClasses] of Object.entries(WEAPON_REGISTRY)) {
			const col = document.createElement('div');
			col.className = 'equip-col';
			col.dataset.slot = slot;

			const header = document.createElement('div');
			header.className = 'equip-col-header';

			const label = document.createElement('div');
			label.className = 'equip-col-label';
			label.textContent = slot.toUpperCase();
			header.appendChild(label);

			const accent = document.createElement('div');
			accent.className = 'equip-col-accent';
			header.appendChild(accent);

			col.appendChild(header);

			const list = document.createElement('div');
			list.className = 'equip-weapon-list';

			for (const WeaponClass of weaponClasses) {
				const card = this.#buildCard(WeaponClass, slot);
				list.appendChild(card);
			}

			col.appendChild(list);
			cols.appendChild(col);
			this.#slotLists[slot] = list;
		}

		panel.appendChild(cols);
		this.#overlay.appendChild(panel);
		document.body.appendChild(this.#overlay);
	}

	#buildCard(WeaponClass, slot) {
		const temp = new WeaponClass();
		const btn  = document.createElement('button');
		btn.className      = 'equip-weapon-btn';
		btn.dataset.slot   = slot;
		btn.dataset.weapon = temp.name;

		const name = document.createElement('div');
		name.className   = 'card-name';
		name.textContent = temp.name.toUpperCase();

		const stats = document.createElement('div');
		stats.className   = 'card-stats';
		stats.textContent = getStats(temp);

		btn.appendChild(name);
		btn.appendChild(stats);

		btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#equip(slot, WeaponClass);
		});

		return btn;
	}

	#equip(slot, WeaponClass) {
		this.#player.equipment[slot] = new WeaponClass();
		this.#refreshHighlights();
		this.#player.emit('weaponswitch', this.#player.activeSlot);
	}

	#refreshHighlights() {
		for (const [slot, list] of Object.entries(this.#slotLists)) {
			const current = this.#player.equipment[slot];
			for (const btn of list.querySelectorAll('.equip-weapon-btn')) {
				btn.classList.toggle('active', !!current && btn.dataset.weapon === current.name);
			}
		}
	}

	#toggle() {
		if (this.#overlay.classList.contains('visible')) {
			this.#close();
		} else {
			this.#open();
		}
	}

	#open() {
		this.#refreshHighlights();
		this.#overlay.classList.add('visible');
	}

	#close() {
		this.#overlay.classList.remove('visible');
	}
}
