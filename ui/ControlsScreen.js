export class ControlsScreen {
	#overlay;

	constructor() {
		this.#build();
	}

	#build() {
		this.#overlay = document.createElement('div');
		this.#overlay.id = 'controls-overlay';

		const panel = document.createElement('div');
		panel.id = 'controls-panel';

		const title = document.createElement('div');
		title.id = 'controls-title';
		title.textContent = 'CONTROLS';
		panel.appendChild(title);

		const rows = [
			['Move Up',        'W / ↑'],
			['Move Down',      'S / ↓'],
			['Move Left',      'A / ←'],
			['Move Right',     'D / →'],
			['Shoot',          'Space / Tap'],
			['Skill 1',        '1'],
			['Skill 2',        '2'],
			['Skill 3',        '3'],
			['Skill 4',        '4'],
			['Reload',         'R'],
			['Switch Weapon',  'Tab'],
			['Pause / Menu',   'ESC'],
		];

		const table = document.createElement('table');
		table.id = 'controls-table';

		for (const [action, binding] of rows) {
			const tr = document.createElement('tr');

			const tdAction = document.createElement('td');
			tdAction.className = 'ctrl-action';
			tdAction.textContent = action;

			const tdBinding = document.createElement('td');
			tdBinding.className = 'ctrl-binding';
			tdBinding.textContent = binding;

			tr.appendChild(tdAction);
			tr.appendChild(tdBinding);
			table.appendChild(tr);
		}

		panel.appendChild(table);

		const closeBtn = document.createElement('button');
		closeBtn.id = 'controls-close-btn';
		closeBtn.className = 'pause-menu-btn';
		closeBtn.textContent = 'BACK';
		closeBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.close();
		});
		panel.appendChild(closeBtn);

		this.#overlay.appendChild(panel);
		document.body.appendChild(this.#overlay);
	}

	open() {
		this.#overlay.classList.add('visible');
	}

	close() {
		this.#overlay.classList.remove('visible');
	}
}
