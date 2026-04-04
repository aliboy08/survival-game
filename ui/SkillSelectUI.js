import { Nova } from '../skills/damage/Nova.js';
import { Shockwave } from '../skills/damage/Shockwave.js';
import { Blaze } from '../skills/damage/Blaze.js';
import { Frenzy } from '../skills/buff/Frenzy.js';
import { Shield } from '../skills/buff/Shield.js';
import { Overclock } from '../skills/buff/Overclock.js';
import { Bloodlust } from '../skills/buff/Bloodlust.js';
import { Adrenaline } from '../skills/buff/Adrenaline.js';
import { Invisibility } from '../skills/buff/Invisibility.js';
import { Teleport } from '../skills/buff/Teleport.js';
import { FrostDome } from '../skills/cc/FrostDome.js';

const SKILL_POOL = [
	{ factory: () => new Nova(), color: '#e74c3c', label: 'DMG' },
	{ factory: () => new Shockwave(), color: '#e67e22', label: 'DMG' },
	{ factory: () => new Blaze(), color: '#ff6b35', label: 'DMG' },
	{ factory: () => new Frenzy(), color: '#9b59b6', label: 'BUFF' },
	{ factory: () => new Shield(), color: '#3498db', label: 'BUFF' },
	{ factory: () => new Overclock(), color: '#f1c40f', label: 'BUFF' },
	{ factory: () => new Bloodlust(), color: '#e74c3c', label: 'BUFF' },
	{ factory: () => new Adrenaline(), color: '#2ecc71', label: 'BUFF' },
	{ factory: () => new Invisibility(), color: '#8e44ad', label: 'BUFF' },
	{ factory: () => new Teleport(), color: '#c39bd3', label: 'BUFF' },
	{ factory: () => new FrostDome(), color: '#00c8ff', label: 'CC' },
];

export class SkillSelectUI {
	#overlay;
	#slotLabel;
	#slotsStrip;
	#skillSlots = null;
	#selectedIndex = 0;

	constructor() {
		this.#build();
	}

	open(slotIndex, skillSlots) {
		this.#skillSlots = skillSlots;
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
		const subtitle = document.createElement('div');
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
		closeBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#close();
		});
		titleBar.appendChild(closeBtn);
		panel.appendChild(titleBar);

		// ── Slot strip ─────────────────────────────────────────────
		const slotSection = document.createElement('div');
		const slotHeader = document.createElement('div');
		slotHeader.className = 'skill-select-section-label';
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
		const availHeader = document.createElement('div');
		availHeader.className = 'skill-select-section-label';
		availHeader.textContent = 'AVAILABLE';
		availSection.appendChild(availHeader);

		const availGrid = document.createElement('div');
		availGrid.id = 'skill-avail-grid';

		for (const entry of SKILL_POOL) {
			const skill = entry.factory();
			const card = document.createElement('button');
			card.className = 'skill-avail-card';
			card.style.setProperty('--skill-color', entry.color);

			const typeEl = document.createElement('div');
			typeEl.className = 'skill-avail-type';
			typeEl.textContent = entry.label;

			const nameEl = document.createElement('div');
			nameEl.className = 'skill-avail-name';
			nameEl.textContent = skill.name.toUpperCase();

			const descEl = document.createElement('div');
			descEl.className = 'skill-avail-desc';
			descEl.textContent = skill.description;

			const statsEl = document.createElement('div');
			statsEl.className = 'skill-avail-stats';
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
		if (skill.energyCost > 0) parts.push(`${skill.energyCost} NRG`);
		if (skill.drainRate > 0) parts.push(`${skill.drainRate}/s`);
		parts.push(`${skill.cooldown}s CD`);
		if (skill.duration > 0) parts.push(`${skill.duration}s DUR`);
		if (skill.range > 0) parts.push(`${skill.range}px`);
		if (skill.strength > 0) parts.push(`STR ${skill.strength}`);
		if (skill.channeling) parts.push('CHANNEL');
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
			indexEl.className = 'skill-strip-slot-index';
			indexEl.textContent = `SLOT ${i + 1}`;
			slotEl.appendChild(indexEl);

			if (skill) {
				const nameEl = document.createElement('div');
				nameEl.className = 'skill-strip-slot-name';
				nameEl.textContent = skill.name.toUpperCase();
				slotEl.appendChild(nameEl);

				const removeBtn = document.createElement('button');
				removeBtn.className = 'skill-strip-remove';
				removeBtn.textContent = '✕ REMOVE';
				removeBtn.addEventListener('pointerdown', (e) => {
					e.stopPropagation();
					this.#skillSlots.unequip(i);
					this.#refreshStrip();
				});
				slotEl.appendChild(removeBtn);
			} else {
				const emptyEl = document.createElement('div');
				emptyEl.className = 'skill-strip-slot-name';
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
