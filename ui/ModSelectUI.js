import { DamageMod }   from '../mods/stat/DamageMod.js';
import { FireRateMod } from '../mods/stat/FireRateMod.js';
import { ReloadMod }   from '../mods/stat/ReloadMod.js';
import { FireMod }     from '../mods/elemental/FireMod.js';
import { ElectricMod } from '../mods/elemental/ElectricMod.js';
import { ColdMod }     from '../mods/elemental/ColdMod.js';
import { ToxicMod }    from '../mods/elemental/ToxicMod.js';

const MOD_POOL = [
	{ factory: () => new DamageMod(),   color: '#bdc3c7', label: 'STAT' },
	{ factory: () => new FireRateMod(), color: '#bdc3c7', label: 'STAT' },
	{ factory: () => new ReloadMod(),   color: '#bdc3c7', label: 'STAT' },
	{ factory: () => new FireMod(),     color: '#e67e22', label: 'ELEM' },
	{ factory: () => new ElectricMod(), color: '#f1c40f', label: 'ELEM' },
	{ factory: () => new ColdMod(),     color: '#00c8ff', label: 'ELEM' },
	{ factory: () => new ToxicMod(),    color: '#2ecc71', label: 'ELEM' },
];

const MOD_COLORS = Object.fromEntries(
	MOD_POOL.map(e => [e.factory().name, e.color])
);

export class ModSelectUI {
	#overlay;
	#weaponLabel;
	#slotsGrid;
	#weapon    = null;
	#onChange  = null;

	constructor() {
		this.#build();
	}

	/** @param {import('../weapon/Weapon.js').Weapon} weapon
	 *  @param {() => void} onChange — called whenever a mod is equipped/unequipped */
	open(weapon, onChange = null) {
		this.#weapon   = weapon;
		this.#onChange = onChange;
		this.#weaponLabel.textContent = weapon.name.toUpperCase();
		this.#refreshSlots();
		this.#overlay.classList.add('visible');
	}

	#build() {
		this.#overlay = document.createElement('div');
		this.#overlay.id = 'mod-overlay';
		this.#overlay.addEventListener('pointerdown', (e) => {
			if (e.target === this.#overlay) this.#close();
		});

		const panel = document.createElement('div');
		panel.id = 'mod-panel';

		// ── Title bar ────────────────────────────────────────────
		const titleBar = document.createElement('div');
		titleBar.id = 'mod-title-bar';

		const titleWrap = document.createElement('div');

		const subtitle = document.createElement('div');
		subtitle.id = 'mod-subtitle';
		subtitle.textContent = 'WEAPON MODS';
		titleWrap.appendChild(subtitle);

		this.#weaponLabel = document.createElement('div');
		this.#weaponLabel.id = 'mod-weapon-label';
		titleWrap.appendChild(this.#weaponLabel);

		titleBar.appendChild(titleWrap);

		const closeBtn = document.createElement('button');
		closeBtn.id = 'mod-close-btn';
		closeBtn.textContent = 'X';
		closeBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#close();
		});
		titleBar.appendChild(closeBtn);
		panel.appendChild(titleBar);

		// ── Installed slots ───────────────────────────────────────
		const slotsSection = document.createElement('div');
		slotsSection.className = 'mod-section';

		const slotsHeader = document.createElement('div');
		slotsHeader.className = 'mod-section-label';
		slotsHeader.textContent = 'INSTALLED';
		slotsSection.appendChild(slotsHeader);

		this.#slotsGrid = document.createElement('div');
		this.#slotsGrid.id = 'mod-slots-grid';
		slotsSection.appendChild(this.#slotsGrid);
		panel.appendChild(slotsSection);

		// ── Divider ───────────────────────────────────────────────
		const divider = document.createElement('div');
		divider.className = 'mod-divider';
		panel.appendChild(divider);

		// ── Available mods ────────────────────────────────────────
		const availSection = document.createElement('div');
		availSection.className = 'mod-section';

		const availHeader = document.createElement('div');
		availHeader.className = 'mod-section-label';
		availHeader.textContent = 'AVAILABLE';
		availSection.appendChild(availHeader);

		const availGrid = document.createElement('div');
		availGrid.id = 'mod-avail-grid';

		for (const entry of MOD_POOL) {
			const mod  = entry.factory();
			const card = document.createElement('button');
			card.className = 'mod-avail-card';
			card.style.setProperty('--mod-color', entry.color);

			const name = document.createElement('div');
			name.className   = 'mod-avail-name';
			name.textContent = mod.name.toUpperCase();

			const desc = document.createElement('div');
			desc.className   = 'mod-avail-desc';
			desc.textContent = mod.description;

			const type = document.createElement('div');
			type.className   = 'mod-avail-type';
			type.textContent = entry.label;

			card.appendChild(type);
			card.appendChild(name);
			card.appendChild(desc);

			card.addEventListener('pointerdown', (e) => {
				e.stopPropagation();
				this.#assign(entry.factory);
			});

			availGrid.appendChild(card);
		}

		availSection.appendChild(availGrid);
		panel.appendChild(availSection);

		this.#overlay.appendChild(panel);
		document.body.appendChild(this.#overlay);
	}

	#refreshSlots() {
		this.#slotsGrid.innerHTML = '';
		const slots = this.#weapon.modSlots.slots;

		slots.forEach((mod, index) => {
			const card = document.createElement('div');
			card.className = mod ? 'mod-slot filled' : 'mod-slot empty';

			if (mod) {
				const color = MOD_COLORS[mod.name] ?? '#95a5a6';
				card.style.setProperty('--mod-color', color);

				const name = document.createElement('div');
				name.className   = 'mod-slot-name';
				name.textContent = mod.name.toUpperCase();

				const removeBtn = document.createElement('button');
				removeBtn.className   = 'mod-slot-remove';
				removeBtn.textContent = 'X';
				removeBtn.addEventListener('pointerdown', (e) => {
					e.stopPropagation();
					this.#weapon.modSlots.unequip(index);
					this.#refreshSlots();
					this.#onChange?.();
				});

				card.appendChild(name);
				card.appendChild(removeBtn);
			} else {
				const label = document.createElement('div');
				label.className   = 'mod-slot-empty-label';
				label.textContent = `SLOT ${index + 1}`;
				card.appendChild(label);
			}

			this.#slotsGrid.appendChild(card);
		});
	}

	#assign(factory) {
		if (!this.#weapon || this.#weapon.modSlots.isFull) return;
		this.#weapon.modSlots.equipNext(factory());
		this.#refreshSlots();
		this.#onChange?.();
	}

	#close() {
		this.#overlay.classList.remove('visible');
		this.#weapon   = null;
		this.#onChange = null;
	}
}
