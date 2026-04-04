import { StrengthMod } from '../mods/player/StrengthMod.js';
import { DurationMod } from '../mods/player/DurationMod.js';
import { CooldownMod } from '../mods/player/CooldownMod.js';
import { EfficiencyMod } from '../mods/player/EfficiencyMod.js';
import { EnergyMod } from '../mods/player/EnergyMod.js';
import { HpMod } from '../mods/player/HpMod.js';
import { ArmorMod } from '../mods/player/ArmorMod.js';
import { ShieldMod } from '../mods/player/ShieldMod.js';
import { ShieldRegenMod } from '../mods/player/ShieldRegenMod.js';

const PLAYER_MOD_POOL = [
	{ factory: () => new StrengthMod(), color: '#e74c3c', label: 'SKILL' },
	{ factory: () => new DurationMod(), color: '#9b59b6', label: 'SKILL' },
	{ factory: () => new CooldownMod(), color: '#3498db', label: 'SKILL' },
	{ factory: () => new EfficiencyMod(), color: '#00c8ff', label: 'SKILL' },
	{ factory: () => new EnergyMod(), color: '#00c8ff', label: 'STAT' },
	{ factory: () => new HpMod(), color: '#2ecc71', label: 'STAT' },
	{ factory: () => new ArmorMod(), color: '#95a5a6', label: 'STAT' },
	{ factory: () => new ShieldMod(), color: '#5dade2', label: 'STAT' },
	{ factory: () => new ShieldRegenMod(), color: '#5dade2', label: 'STAT' },
];

const MOD_COLORS = Object.fromEntries(
	PLAYER_MOD_POOL.map((e) => [e.factory().name, e.color]),
);

export class PlayerModSelectUI {
	#player;
	#overlay;
	#slotsGrid;

	constructor(player) {
		this.#player = player;
		this.#build();
	}

	#build() {
		this.#overlay = document.createElement('div');
		this.#overlay.id = 'player-mod-overlay';
		this.#overlay.addEventListener('pointerdown', (e) => {
			if (e.target === this.#overlay) this.#close();
		});

		const panel = document.createElement('div');
		panel.id = 'player-mod-panel';

		// ── Title bar ─────────────────────────────────────────────
		const titleBar = document.createElement('div');
		titleBar.id = 'player-mod-title-bar';

		const titleWrap = document.createElement('div');
		const subtitle = document.createElement('div');
		subtitle.id = 'player-mod-subtitle';
		subtitle.textContent = 'PLAYER MODS';
		titleWrap.appendChild(subtitle);

		const label = document.createElement('div');
		label.id = 'player-mod-label';
		label.textContent = 'CHARACTER';
		titleWrap.appendChild(label);
		titleBar.appendChild(titleWrap);

		const closeBtn = document.createElement('button');
		closeBtn.id = 'player-mod-close-btn';
		closeBtn.textContent = 'X';
		closeBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#close();
		});
		titleBar.appendChild(closeBtn);
		panel.appendChild(titleBar);

		// ── Installed slots ────────────────────────────────────────
		const slotsSection = document.createElement('div');
		slotsSection.className = 'mod-section';

		const slotsHeader = document.createElement('div');
		slotsHeader.className = 'mod-section-label';
		slotsHeader.textContent = 'INSTALLED';
		slotsSection.appendChild(slotsHeader);

		this.#slotsGrid = document.createElement('div');
		this.#slotsGrid.id = 'player-mod-slots-grid';
		slotsSection.appendChild(this.#slotsGrid);
		panel.appendChild(slotsSection);

		// ── Divider ────────────────────────────────────────────────
		const divider = document.createElement('div');
		divider.className = 'mod-divider';
		panel.appendChild(divider);

		// ── Available mods ─────────────────────────────────────────
		const availSection = document.createElement('div');
		availSection.className = 'mod-section';

		const availHeader = document.createElement('div');
		availHeader.className = 'mod-section-label';
		availHeader.textContent = 'AVAILABLE';
		availSection.appendChild(availHeader);

		const availGrid = document.createElement('div');
		availGrid.id = 'player-mod-avail-grid';

		for (const entry of PLAYER_MOD_POOL) {
			const mod = entry.factory();
			const card = document.createElement('button');
			card.className = 'mod-avail-card';
			card.style.setProperty('--mod-color', entry.color);

			const typeEl = document.createElement('div');
			typeEl.className = 'mod-avail-type';
			typeEl.textContent = entry.label;

			const nameEl = document.createElement('div');
			nameEl.className = 'mod-avail-name';
			nameEl.textContent = mod.name.toUpperCase();

			const descEl = document.createElement('div');
			descEl.className = 'mod-avail-desc';
			descEl.textContent = mod.description;

			card.appendChild(typeEl);
			card.appendChild(nameEl);
			card.appendChild(descEl);

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

	open() {
		this.#open();
	}

	#open() {
		this.#refreshSlots();
		this.#overlay.classList.add('visible');
	}

	#refreshSlots() {
		this.#slotsGrid.innerHTML = '';
		const slots = this.#player.playerModSlots.slots;

		slots.forEach((mod, index) => {
			const card = document.createElement('div');
			card.className = mod ? 'mod-slot filled' : 'mod-slot empty';

			if (mod) {
				const color = MOD_COLORS[mod.name] ?? '#95a5a6';
				card.style.setProperty('--mod-color', color);

				const nameEl = document.createElement('div');
				nameEl.className = 'mod-slot-name';
				nameEl.textContent = mod.name.toUpperCase();

				const removeBtn = document.createElement('button');
				removeBtn.className = 'mod-slot-remove';
				removeBtn.textContent = 'X';
				removeBtn.addEventListener('pointerdown', (e) => {
					e.stopPropagation();
					this.#player.playerModSlots.unequip(index);
					this.#refreshSlots();
				});

				card.appendChild(nameEl);
				card.appendChild(removeBtn);
			} else {
				const emptyEl = document.createElement('div');
				emptyEl.className = 'mod-slot-empty-label';
				emptyEl.textContent = `SLOT ${index + 1}`;
				card.appendChild(emptyEl);
			}

			this.#slotsGrid.appendChild(card);
		});
	}

	#assign(factory) {
		if (this.#player.playerModSlots.isFull) return;
		this.#player.playerModSlots.equipNext(factory());
		this.#refreshSlots();
	}

	#close() {
		this.#overlay.classList.remove('visible');
	}
}
