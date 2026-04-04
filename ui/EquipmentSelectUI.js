import { ModSelectUI } from './ModSelectUI.js';

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
	#modBtns = {};
	#modUI = new ModSelectUI();

	constructor(player, weapons_manager) {
		this.#player = player;
		this.weapons_manager = weapons_manager;
		this.#build();
	}

	#build() {
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

		for (const [slot, weaponClasses] of Object.entries(
			this.weapons_manager.weapons,
		)) {
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
				list.appendChild(this.#buildCard(WeaponClass, slot));
			}

			col.appendChild(list);

			// MOD button for this slot
			const modBtn = document.createElement('button');
			modBtn.className = 'equip-mod-btn';
			modBtn.addEventListener('pointerdown', (e) => {
				e.stopPropagation();
				const weapon = this.#player.equipment[slot];
				if (!weapon) return;
				this.#modUI.open(weapon, () => this.#refreshModBtns());
			});
			col.appendChild(modBtn);
			this.#modBtns[slot] = modBtn;

			cols.appendChild(col);
			this.#slotLists[slot] = list;
		}

		panel.appendChild(cols);
		this.#overlay.appendChild(panel);
		document.body.appendChild(this.#overlay);
	}

	#buildCard(WeaponClass, slot) {
		const temp = new WeaponClass();
		const btn = document.createElement('button');
		btn.className = 'equip-weapon-btn';
		btn.dataset.slot = slot;
		btn.dataset.weapon = temp.name;

		const name = document.createElement('div');
		name.className = 'card-name';
		name.textContent = temp.name.toUpperCase();

		const stats = document.createElement('div');
		stats.className = 'card-stats';
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
		this.#refreshModBtns();
		this.#player.emit('weaponswitch', this.#player.activeSlot);
	}

	#refreshHighlights() {
		for (const [slot, list] of Object.entries(this.#slotLists)) {
			const current = this.#player.equipment[slot];
			for (const btn of list.querySelectorAll('.equip-weapon-btn')) {
				btn.classList.toggle(
					'active',
					!!current && btn.dataset.weapon === current.name,
				);
			}
		}
	}

	#refreshModBtns() {
		for (const [slot, btn] of Object.entries(this.#modBtns)) {
			const weapon = this.#player.equipment[slot];
			if (!weapon) {
				btn.textContent = 'MODS';
				btn.disabled = true;
				return;
			}
			const count = weapon.modSlots.count;
			btn.textContent = `MODS  ${count} / 6`;
			btn.disabled = false;
		}
	}

	open() { this.#open(); }

	#open() {
		this.#refreshHighlights();
		this.#refreshModBtns();
		this.#overlay.classList.add('visible');
	}

	#close() {
		this.#overlay.classList.remove('visible');
	}
}
