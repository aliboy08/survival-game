const SLOT_COLORS = {
	damage: '#e74c3c',
	buff: '#3498db',
	cc: '#00c8ff',
};

export class SkillHUD {
	#player;
	#skillSystem;
	#skillSelectUI;
	#cards = [];
	#overlays = [];
	#container;

	constructor(player, skillSystem, skillSelectUI) {
		this.#player = player;
		this.#skillSystem = skillSystem;
		this.#skillSelectUI = skillSelectUI;
		this.#build();
		this.#loop();
	}

	#build() {
		this.#container = document.createElement('div');
		this.#container.id = 'skill-hud';

		for (let i = 0; i < 4; i++) {
			const card = document.createElement('div');
			card.className = 'skill-card';

			const indexLabel = document.createElement('div');
			indexLabel.className = 'skill-card-index';
			indexLabel.textContent = i + 1;

			const nameEl = document.createElement('div');
			nameEl.className = 'skill-card-name';

			const costEl = document.createElement('div');
			costEl.className = 'skill-card-cost';

			const overlay = document.createElement('div');
			overlay.className = 'skill-cooldown-overlay';
			overlay.style.height = '0%';

			const cdText = document.createElement('div');
			cdText.className = 'skill-cooldown-text';
			overlay.appendChild(cdText);

			card.appendChild(indexLabel);
			card.appendChild(nameEl);
			card.appendChild(costEl);
			card.appendChild(overlay);

			card.addEventListener('pointerdown', (e) => {
				e.stopPropagation();
				this.#onTap(i);
			});

			this.#container.appendChild(card);
			this.#cards.push({ card, nameEl, costEl, overlay, cdText });
		}

		document.getElementById('hud-bottom-center').appendChild(this.#container);
	}

	#onTap(index) {
		const skill = this.#player.skillSlots.slots[index];
		if (!skill) {
			this.#skillSelectUI.open(index, this.#player.skillSlots);
		} else {
			this.#skillSystem.activate(index);
		}
	}

	#loop() {
		this.#refresh();
		requestAnimationFrame(() => this.#loop());
	}

	#refresh() {
		const slots = this.#player.skillSlots;

		for (let i = 0; i < 4; i++) {
			const { card, nameEl, costEl, overlay, cdText } = this.#cards[i];
			const skill = slots.slots[i];

			if (!skill) {
				card.className = 'skill-card';
				card.style.removeProperty('--skill-color');
				nameEl.textContent = '';
				costEl.textContent = '';
				overlay.style.height = '0%';
				cdText.textContent = '';

				if (!card.querySelector('.skill-card-empty-label')) {
					const empty = document.createElement('div');
					empty.className = 'skill-card-empty-label';
					empty.textContent = 'EMPTY';
					card.insertBefore(empty, overlay);
				}
				continue;
			}

			const emptyEl = card.querySelector('.skill-card-empty-label');
			if (emptyEl) emptyEl.remove();

			const color = SLOT_COLORS[skill.category] ?? '#fff';
			card.style.setProperty('--skill-color', color);

			const isActive = slots.isActive(i);
			const isChanneling = slots.isChanneling(i);
			const cdFrac = slots.cooldownFraction(i);
			const cdSecs = slots.cooldownOf(i);

			let className = 'skill-card';
			if (isChanneling) className += ' channeling';
			else if (isActive) className += ' active';
			card.className = className;

			nameEl.textContent = skill.name.toUpperCase();
			costEl.textContent = skill.channeling
				? `${skill.drainRate}/s`
				: skill.energyCost > 0
					? `${skill.energyCost}`
					: '';

			if (cdFrac > 0) {
				overlay.style.height = `${Math.round(cdFrac * 100)}%`;
				cdText.textContent =
					cdSecs >= 1 ? Math.ceil(cdSecs) : cdSecs.toFixed(1);
			} else {
				overlay.style.height = '0%';
				cdText.textContent = '';
			}
		}
	}
}
