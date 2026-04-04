export class PauseMenu {
	#game;
	#player;
	#overlay;
	#equipUI;
	#modUI;
	#skillSelectUI;
	#isOpen   = false;
	#disabled = false;

	constructor(game, player, equipUI, modUI, skillSelectUI) {
		this.#game          = game;
		this.#player        = player;
		this.#equipUI       = equipUI;
		this.#modUI         = modUI;
		this.#skillSelectUI = skillSelectUI;
		this.#build();
		this.#setupKeys();
	}

	#build() {
		// ── HUD button ────────────────────────────────────────────────
		const btn = document.createElement('button');
		btn.id = 'menu-btn';
		btn.textContent = 'MENU';
		btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.toggle();
		});
		document.getElementById('hud-top-left').appendChild(btn);

		// ── Pause overlay ─────────────────────────────────────────────
		this.#overlay = document.createElement('div');
		this.#overlay.id = 'pause-overlay';

		const panel = document.createElement('div');
		panel.id = 'pause-panel';

		const title = document.createElement('div');
		title.id = 'pause-title';
		title.textContent = 'PAUSED';
		panel.appendChild(title);

		this.#makeBtn(panel, 'RESUME',    'resume', () => this.close());
		this.#makeBtn(panel, 'SKILLS',    '',       () => this.#openSub(() =>
			this.#skillSelectUI.open(0, this.#player.skillSlots)
		));
		this.#makeBtn(panel, 'EQUIPMENT', '',       () => this.#openSub(() =>
			this.#equipUI.open()
		));
		this.#makeBtn(panel, 'MODS',      '',       () => this.#openSub(() =>
			this.#modUI.open()
		));

		this.#overlay.appendChild(panel);
		document.body.appendChild(this.#overlay);
	}

	#makeBtn(parent, label, extraClass, onClick) {
		const btn = document.createElement('button');
		btn.className = 'pause-menu-btn' + (extraClass ? ` ${extraClass}` : '');
		btn.textContent = label;
		btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			onClick();
		});
		parent.appendChild(btn);
	}

	/** Hide the pause panel and open a sub-screen. */
	#openSub(openFn) {
		this.#overlay.classList.remove('visible');
		openFn();
	}

	/** Re-show the pause panel after a sub-screen closes (game stays paused). */
	#returnToPause() {
		this.#overlay.classList.add('visible');
	}

	#setupKeys() {
		window.addEventListener('keydown', (e) => {
			if (e.code !== 'Escape') return;
			e.preventDefault();

			// Close sub-screens in reverse depth order and return to pause menu.
			// mod-overlay is nested inside equip, so check it first.
			const layers = [
				{ id: 'mod-overlay',           returnTo: null    }, // stays in equip
				{ id: 'equip-overlay',          returnTo: 'pause' },
				{ id: 'player-mod-overlay',     returnTo: 'pause' },
				{ id: 'skill-select-overlay',   returnTo: 'pause' },
			];

			for (const { id, returnTo } of layers) {
				const el = document.getElementById(id);
				if (!el?.classList.contains('visible')) continue;
				el.classList.remove('visible');
				if (returnTo === 'pause') this.#returnToPause();
				return;
			}

			// No sub-screen open — toggle pause menu itself
			this.toggle();
		});
	}

	toggle() {
		this.#isOpen ? this.close() : this.open();
	}

	open() {
		if (this.#isOpen || this.#disabled) return;
		this.#isOpen = true;
		this.#game.stop();
		this.#overlay.classList.add('visible');
	}

	close() {
		if (!this.#isOpen) return;
		this.#isOpen = false;
		this.#game.start();
		this.#overlay.classList.remove('visible');
	}

	disable() {
		this.#disabled = true;
		this.#isOpen   = false;
		this.#overlay.classList.remove('visible');
	}
}
