const SLOT_COLORS = {
	damage: '#e74c3c',
	buff:   '#3498db',
	cc:     '#00c8ff',
};

function injectStyles() {
	if (document.getElementById('skill-hud-styles')) return;
	const style = document.createElement('style');
	style.id = 'skill-hud-styles';
	style.textContent = `
		#skill-hud {
			display: flex;
			gap: 10px;
			pointer-events: none;
		}
		.skill-card {
			position: relative;
			width: 68px;
			height: 68px;
			border-radius: 10px;
			background: rgba(0,0,0,0.65);
			border: 2px solid rgba(255,255,255,0.12);
			overflow: hidden;
			pointer-events: all;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 2px;
			user-select: none;
			-webkit-user-select: none;
			touch-action: manipulation;
			transition: border-color 0.15s;
		}
		.skill-card.active {
			border-color: var(--skill-color, #fff);
			box-shadow: 0 0 12px var(--skill-color, #fff);
		}
		.skill-card.channeling {
			animation: skill-pulse 0.6s ease-in-out infinite alternate;
		}
		@keyframes skill-pulse {
			from { box-shadow: 0 0 8px  var(--skill-color, #fff); }
			to   { box-shadow: 0 0 22px var(--skill-color, #fff); }
		}
		.skill-card-name {
			font: bold 9px monospace;
			color: #fff;
			text-align: center;
			padding: 0 4px;
			z-index: 2;
			pointer-events: none;
		}
		.skill-card-cost {
			font: 8px monospace;
			color: #00c8ff;
			z-index: 2;
			pointer-events: none;
		}
		.skill-card-empty-label {
			font: 9px monospace;
			color: rgba(255,255,255,0.25);
			z-index: 2;
		}
		.skill-card-index {
			position: absolute;
			top: 3px;
			left: 5px;
			font: 8px monospace;
			color: rgba(255,255,255,0.3);
			z-index: 2;
		}
		.skill-cooldown-overlay {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0,0,0,0.72);
			transition: height 0.05s linear;
			z-index: 3;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.skill-cooldown-text {
			font: bold 13px monospace;
			color: rgba(255,255,255,0.9);
		}
	`;
	document.head.appendChild(style);
}

export class SkillHUD {
	#player;
	#skillSystem;
	#skillSelectUI;
	#cards = [];
	#overlays = [];
	#container;

	constructor(player, skillSystem, skillSelectUI) {
		this.#player        = player;
		this.#skillSystem   = skillSystem;
		this.#skillSelectUI = skillSelectUI;
		injectStyles();
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

			const isActive     = slots.isActive(i);
			const isChanneling = slots.isChanneling(i);
			const cdFrac       = slots.cooldownFraction(i);
			const cdSecs       = slots.cooldownOf(i);

			let className = 'skill-card';
			if (isChanneling) className += ' channeling';
			else if (isActive) className += ' active';
			card.className = className;

			nameEl.textContent = skill.name.toUpperCase();
			costEl.textContent = skill.channeling
				? `${skill.drainRate}/s`
				: skill.energyCost > 0 ? `${skill.energyCost}` : '';

			if (cdFrac > 0) {
				overlay.style.height = `${Math.round(cdFrac * 100)}%`;
				cdText.textContent = cdSecs >= 1 ? Math.ceil(cdSecs) : cdSecs.toFixed(1);
			} else {
				overlay.style.height = '0%';
				cdText.textContent = '';
			}
		}
	}
}
