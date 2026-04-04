import { Bindings } from '../core/Bindings.js';

const ROWS = [
	{ action: 'moveUp',       label: 'Move Up'       },
	{ action: 'moveDown',     label: 'Move Down'      },
	{ action: 'moveLeft',     label: 'Move Left'      },
	{ action: 'moveRight',    label: 'Move Right'     },
	{ action: 'shoot',        label: 'Shoot'          },
	{ action: 'skill1',       label: 'Skill 1'        },
	{ action: 'skill2',       label: 'Skill 2'        },
	{ action: 'skill3',       label: 'Skill 3'        },
	{ action: 'skill4',       label: 'Skill 4'        },
	{ action: 'reload',       label: 'Reload'         },
	{ action: 'switchWeapon', label: 'Switch Weapon'  },
];

// Keys that should not be assignable
const BLOCKED = new Set(['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);

export class ControlsScreen {
	#overlay;
	#bindingCells = {}; // action → td element
	#listening    = null; // action currently being rebound
	#abortListener = null;

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

		const hint = document.createElement('div');
		hint.id = 'controls-hint';
		hint.textContent = 'Click a binding to reassign it';
		panel.appendChild(hint);

		const table = document.createElement('table');
		table.id = 'controls-table';

		for (const { action, label } of ROWS) {
			const tr = document.createElement('tr');

			const tdAction = document.createElement('td');
			tdAction.className = 'ctrl-action';
			tdAction.textContent = label;

			const tdBinding = document.createElement('td');
			tdBinding.className = 'ctrl-binding';
			tdBinding.textContent = Bindings.label(action);
			tdBinding.title = 'Click to rebind';
			tdBinding.addEventListener('pointerdown', (e) => {
				e.stopPropagation();
				this.#startListening(action, tdBinding);
			});

			this.#bindingCells[action] = tdBinding;

			tr.appendChild(tdAction);
			tr.appendChild(tdBinding);
			table.appendChild(tr);
		}

		panel.appendChild(table);

		const btnRow = document.createElement('div');
		btnRow.id = 'controls-btn-row';

		const resetBtn = document.createElement('button');
		resetBtn.className = 'pause-menu-btn';
		resetBtn.textContent = 'RESET DEFAULTS';
		resetBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#cancelListening();
			Bindings.reset();
			this.#refreshAll();
		});

		const closeBtn = document.createElement('button');
		closeBtn.id = 'controls-close-btn';
		closeBtn.className = 'pause-menu-btn';
		closeBtn.textContent = 'BACK';
		closeBtn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.close();
		});

		btnRow.appendChild(resetBtn);
		btnRow.appendChild(closeBtn);
		panel.appendChild(btnRow);

		this.#overlay.appendChild(panel);
		document.body.appendChild(this.#overlay);
	}

	#startListening(action, cell) {
		this.#cancelListening(); // cancel any prior

		this.#listening = action;
		cell.textContent = '…';
		cell.classList.add('ctrl-listening');

		const handler = (e) => {
			e.preventDefault();
			e.stopPropagation();

			if (BLOCKED.has(e.code)) {
				this.#cancelListening();
				return;
			}

			Bindings.set(action, e.code);
			this.#stopListening();
			this.#refreshAll();
		};

		window.addEventListener('keydown', handler, { capture: true });
		this.#abortListener = () => window.removeEventListener('keydown', handler, { capture: true });
	}

	#stopListening() {
		if (this.#abortListener) {
			this.#abortListener();
			this.#abortListener = null;
		}
		if (this.#listening) {
			const cell = this.#bindingCells[this.#listening];
			cell?.classList.remove('ctrl-listening');
			this.#listening = null;
		}
	}

	#cancelListening() {
		if (this.#listening) {
			this.#bindingCells[this.#listening].textContent = Bindings.label(this.#listening);
		}
		this.#stopListening();
	}

	#refreshAll() {
		for (const { action } of ROWS) {
			this.#bindingCells[action].textContent = Bindings.label(action);
		}
	}

	open() {
		this.#refreshAll();
		this.#overlay.classList.add('visible');
	}

	close() {
		this.#cancelListening();
		this.#overlay.classList.remove('visible');
	}
}
