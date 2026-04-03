import { Nova }       from '../skills/damage/Nova.js';
import { Shockwave }  from '../skills/damage/Shockwave.js';
import { Blaze }      from '../skills/damage/Blaze.js';
import { Frenzy }     from '../skills/buff/Frenzy.js';
import { Shield }     from '../skills/buff/Shield.js';
import { Overclock }  from '../skills/buff/Overclock.js';
import { Bloodlust }  from '../skills/buff/Bloodlust.js';
import { Adrenaline } from '../skills/buff/Adrenaline.js';

const SKILL_POOL = [
	{ factory: () => new Nova(),       color: '#e74c3c', label: 'DMG' },
	{ factory: () => new Shockwave(),  color: '#e67e22', label: 'DMG' },
	{ factory: () => new Blaze(),      color: '#ff6b35', label: 'DMG' },
	{ factory: () => new Frenzy(),     color: '#9b59b6', label: 'BUFF' },
	{ factory: () => new Shield(),     color: '#3498db', label: 'BUFF' },
	{ factory: () => new Overclock(),  color: '#f1c40f', label: 'BUFF' },
	{ factory: () => new Bloodlust(),  color: '#e74c3c', label: 'BUFF' },
	{ factory: () => new Adrenaline(), color: '#2ecc71', label: 'BUFF' },
];

function injectStyles() {
	if (document.getElementById('skill-select-styles')) return;
	const style = document.createElement('style');
	style.id = 'skill-select-styles';
	style.textContent = `
		#skill-select-overlay {
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.7);
			display: none;
			align-items: center;
			justify-content: center;
			z-index: 200;
		}
		#skill-select-overlay.visible { display: flex; }

		#skill-select-panel {
			background: #12121f;
			border: 1px solid rgba(255,255,255,0.1);
			border-radius: 14px;
			padding: 18px;
			width: min(420px, 92vw);
			max-height: 88vh;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			gap: 14px;
		}

		#skill-select-title-bar {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}
		#skill-select-subtitle {
			font: 10px monospace;
			color: rgba(255,255,255,0.35);
			letter-spacing: 2px;
		}
		#skill-select-slot-label {
			font: bold 15px monospace;
			color: #fff;
			margin-top: 2px;
		}
		#skill-select-close-btn {
			background: rgba(255,255,255,0.08);
			border: none;
			color: #fff;
			font: bold 12px monospace;
			width: 28px;
			height: 28px;
			border-radius: 6px;
			cursor: pointer;
		}

		.skill-select-section-label {
			font: 10px monospace;
			color: rgba(255,255,255,0.3);
			letter-spacing: 2px;
			margin-bottom: 6px;
		}
		.skill-select-divider {
			height: 1px;
			background: rgba(255,255,255,0.07);
		}

		/* ── Slot strip ── */
		#skill-slots-strip {
			display: flex;
			gap: 8px;
		}
		.skill-strip-slot {
			flex: 1;
			height: 52px;
			border-radius: 8px;
			background: rgba(255,255,255,0.05);
			border: 2px solid rgba(255,255,255,0.1);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: border-color 0.15s;
			padding: 4px;
		}
		.skill-strip-slot.selected {
			border-color: var(--skill-color, #fff);
			background: rgba(255,255,255,0.08);
		}
		.skill-strip-slot-name {
			font: bold 8px monospace;
			color: #fff;
			text-align: center;
		}
		.skill-strip-slot-index {
			font: 7px monospace;
			color: rgba(255,255,255,0.3);
		}
		.skill-strip-remove {
			font: 8px monospace;
			color: rgba(255,100,100,0.7);
			background: none;
			border: none;
			cursor: pointer;
			padding: 0;
			margin-top: 2px;
		}

		/* ── Available skill cards ── */
		#skill-avail-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;
		}
		.skill-avail-card {
			background: rgba(255,255,255,0.04);
			border: 1.5px solid rgba(255,255,255,0.09);
			border-left: 3px solid var(--skill-color, #555);
			border-radius: 8px;
			padding: 10px;
			text-align: left;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			gap: 3px;
			transition: background 0.12s;
		}
		.skill-avail-card:hover,
		.skill-avail-card:active { background: rgba(255,255,255,0.09); }
		.skill-avail-type {
			font: 8px monospace;
			color: var(--skill-color, #aaa);
			letter-spacing: 1px;
		}
		.skill-avail-name {
			font: bold 11px monospace;
			color: #fff;
		}
		.skill-avail-desc {
			font: 9px monospace;
			color: rgba(255,255,255,0.45);
			line-height: 1.3;
		}
		.skill-avail-stats {
			font: 8px monospace;
			color: rgba(255,255,255,0.28);
			margin-top: 2px;
		}
	`;
	document.head.appendChild(style);
}

export class SkillSelectUI {
	#overlay;
	#slotLabel;
	#slotsStrip;
	#skillSlots   = null;
	#selectedIndex = 0;

	constructor() {
		injectStyles();
		this.#build();
	}

	open(slotIndex, skillSlots) {
		this.#skillSlots    = skillSlots;
		this.#selectedIndex = slotIndex;
		this.#slotLabel.textContent = `SLOT ${slotIndex + 1}`;
		this.#refreshStrip();
		this.#overlay.classList.add('visible');
	}

	#build() {
		this.#overlay = document.createElement('div');
		this.#overlay.id = 'skill-select-overlay';
		this.#overlay.addEventListener('pointerdown', (e) => {
			if (e.target === this.#overlay) this.#close();
		});

		const panel = document.createElement('div');
		panel.id = 'skill-select-panel';

		// ── Title bar ─────────────────────────────────────────────
		const titleBar = document.createElement('div');
		titleBar.id = 'skill-select-title-bar';

		const titleWrap = document.createElement('div');
		const subtitle  = document.createElement('div');
		subtitle.id = 'skill-select-subtitle';
		subtitle.textContent = 'SKILL SLOTS';
		titleWrap.appendChild(subtitle);

		this.#slotLabel = document.createElement('div');
		this.#slotLabel.id = 'skill-select-slot-label';
		titleWrap.appendChild(this.#slotLabel);
		titleBar.appendChild(titleWrap);

		const closeBtn = document.createElement('button');
		closeBtn.id = 'skill-select-close-btn';
		closeBtn.textContent = 'X';
		closeBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.#close(); });
		titleBar.appendChild(closeBtn);
		panel.appendChild(titleBar);

		// ── Slot strip ─────────────────────────────────────────────
		const slotSection = document.createElement('div');
		const slotHeader  = document.createElement('div');
		slotHeader.className   = 'skill-select-section-label';
		slotHeader.textContent = 'INSTALLED';
		slotSection.appendChild(slotHeader);

		this.#slotsStrip = document.createElement('div');
		this.#slotsStrip.id = 'skill-slots-strip';
		slotSection.appendChild(this.#slotsStrip);
		panel.appendChild(slotSection);

		// ── Divider ────────────────────────────────────────────────
		const divider = document.createElement('div');
		divider.className = 'skill-select-divider';
		panel.appendChild(divider);

		// ── Available skills ───────────────────────────────────────
		const availSection = document.createElement('div');
		const availHeader  = document.createElement('div');
		availHeader.className   = 'skill-select-section-label';
		availHeader.textContent = 'AVAILABLE';
		availSection.appendChild(availHeader);

		const availGrid = document.createElement('div');
		availGrid.id = 'skill-avail-grid';

		for (const entry of SKILL_POOL) {
			const skill = entry.factory();
			const card  = document.createElement('button');
			card.className = 'skill-avail-card';
			card.style.setProperty('--skill-color', entry.color);

			const typeEl = document.createElement('div');
			typeEl.className   = 'skill-avail-type';
			typeEl.textContent = entry.label;

			const nameEl = document.createElement('div');
			nameEl.className   = 'skill-avail-name';
			nameEl.textContent = skill.name.toUpperCase();

			const descEl = document.createElement('div');
			descEl.className   = 'skill-avail-desc';
			descEl.textContent = skill.description;

			const statsEl = document.createElement('div');
			statsEl.className   = 'skill-avail-stats';
			statsEl.textContent = this.#statsLine(skill);

			card.appendChild(typeEl);
			card.appendChild(nameEl);
			card.appendChild(descEl);
			card.appendChild(statsEl);

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

	#statsLine(skill) {
		const parts = [];
		if (skill.energyCost > 0)  parts.push(`${skill.energyCost} NRG`);
		if (skill.drainRate > 0)   parts.push(`${skill.drainRate}/s`);
		parts.push(`${skill.cooldown}s CD`);
		if (skill.duration > 0)    parts.push(`${skill.duration}s DUR`);
		if (skill.channeling)      parts.push('CHANNEL');
		return parts.join('  ·  ');
	}

	#refreshStrip() {
		this.#slotsStrip.innerHTML = '';
		const slots = this.#skillSlots.slots;

		slots.forEach((skill, i) => {
			const slotEl = document.createElement('div');
			slotEl.className = 'skill-strip-slot';
			if (i === this.#selectedIndex) {
				slotEl.classList.add('selected');
				if (skill) slotEl.style.setProperty('--skill-color', '#3498db');
			}

			const indexEl = document.createElement('div');
			indexEl.className   = 'skill-strip-slot-index';
			indexEl.textContent = `SLOT ${i + 1}`;
			slotEl.appendChild(indexEl);

			if (skill) {
				const nameEl = document.createElement('div');
				nameEl.className   = 'skill-strip-slot-name';
				nameEl.textContent = skill.name.toUpperCase();
				slotEl.appendChild(nameEl);

				const removeBtn = document.createElement('button');
				removeBtn.className   = 'skill-strip-remove';
				removeBtn.textContent = '✕ REMOVE';
				removeBtn.addEventListener('pointerdown', (e) => {
					e.stopPropagation();
					this.#skillSlots.unequip(i);
					this.#refreshStrip();
				});
				slotEl.appendChild(removeBtn);
			} else {
				const emptyEl = document.createElement('div');
				emptyEl.className   = 'skill-strip-slot-name';
				emptyEl.textContent = '—';
				slotEl.appendChild(emptyEl);
			}

			slotEl.addEventListener('pointerdown', (e) => {
				e.stopPropagation();
				this.#selectedIndex = i;
				this.#slotLabel.textContent = `SLOT ${i + 1}`;
				this.#refreshStrip();
			});

			this.#slotsStrip.appendChild(slotEl);
		});
	}

	#assign(factory) {
		if (!this.#skillSlots) return;
		this.#skillSlots.equip(factory(), this.#selectedIndex);
		this.#refreshStrip();
	}

	#close() {
		this.#overlay.classList.remove('visible');
		this.#skillSlots = null;
	}
}
