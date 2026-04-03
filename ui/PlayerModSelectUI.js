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

function injectStyles() {
	if (document.getElementById('player-mod-styles')) return;
	const style = document.createElement('style');
	style.id = 'player-mod-styles';
	style.textContent = `
		#player-mod-open-btn {
			position: fixed;
			top: 260px;
			left: 12px;
			width: 82px;
			height: 38px;
			border-radius: 20px;
			background: rgba(12, 12, 28, 0.88);
			border: 1px solid rgba(255, 255, 255, 0.16);
			color: rgba(255, 255, 255, 0.7);
			font-size: 10px;
			font-weight: bold;
			font-family: monospace;
			letter-spacing: 2px;
			cursor: pointer;
			z-index: 9999;
			touch-action: none;
			user-select: none;
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);
			transition: border-color 0.15s, color 0.15s, background 0.15s;
		}
		#player-mod-open-btn:active {
			background: rgba(93, 173, 226, 0.14);
			border-color: rgba(93, 173, 226, 0.55);
			color: #5dade2;
		}
		#player-mod-overlay {
			display: none;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.6);
			align-items: center;
			justify-content: center;
			z-index: 100001;
			touch-action: none;
		}
		#player-mod-overlay.visible {
			display: flex;
		}
		#player-mod-panel {
			background: rgba(8, 8, 20, 0.99);
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 14px;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			box-shadow: 0 8px 64px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.05);
			width: 420px;
		}
		#player-mod-title-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 14px 20px 13px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.07);
			background: rgba(255, 255, 255, 0.02);
		}
		#player-mod-subtitle {
			color: rgba(255, 255, 255, 0.3);
			font-family: monospace;
			font-size: 8px;
			letter-spacing: 4px;
			margin-bottom: 3px;
		}
		#player-mod-label {
			color: rgba(255, 255, 255, 0.9);
			font-family: monospace;
			font-size: 14px;
			font-weight: bold;
			letter-spacing: 4px;
		}
		#player-mod-close-btn {
			width: 26px;
			height: 26px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.06);
			border: 1px solid rgba(255, 255, 255, 0.15);
			color: rgba(255, 255, 255, 0.45);
			font-size: 11px;
			font-family: monospace;
			font-weight: bold;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		#player-mod-close-btn:active { background: rgba(255,255,255,0.14); color: #fff; }
		#player-mod-slots-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 6px;
		}
		#player-mod-avail-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 6px;
		}
	`;
	document.head.appendChild(style);
}

export class PlayerModSelectUI {
	#player;
	#overlay;
	#slotsGrid;

	constructor(player) {
		this.#player = player;
		injectStyles();
		this.#build();
	}

	#build() {
		const openBtn = document.createElement('button');
		openBtn.id = 'player-mod-open-btn';
		openBtn.textContent = 'MODS';
		openBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#open();
		});
		document.body.appendChild(openBtn);

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
