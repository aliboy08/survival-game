import { get_arr_item_class } from '../js/utils.js';

export class DebugPanel {
	#game;
	#player;
	#panel;

	constructor(game, player) {
		this.#game   = game;
		this.#player = player;

		this.enemy_spawner = get_arr_item_class(game.entities, 'EnemySpawner');

		this.#build();
	}

	#build() {
		const toggle = document.createElement('button');
		toggle.id          = 'debug-toggle';
		toggle.textContent = 'DEBUG';
		document.body.appendChild(toggle);

		this.#panel = document.createElement('div');
		this.#panel.id = 'debug-panel';
		this.#panel.classList.add('hidden');

		toggle.addEventListener('click', () => {
			this.#panel.classList.toggle('hidden');
			toggle.classList.toggle('active', !this.#panel.classList.contains('hidden'));
		});

		this.#addButton('Spawn Enemy', () => this.enemy_spawner.spawn());
		this.#addToggle('God Mode',      () => this.#player.godMode,      v => this.#player.godMode      = v);
		this.#addToggle('Infinite Ammo', () => this.#player.infiniteAmmo, v => this.#player.infiniteAmmo = v);

		document.body.appendChild(this.#panel);
	}

	#addButton(label, onClick) {
		const btn = document.createElement('button');
		btn.textContent = label;
		btn.addEventListener('click', onClick);
		this.#panel.appendChild(btn);
		return btn;
	}

	#addToggle(label, get, set) {
		const btn = document.createElement('button');
		const update = () => {
			btn.textContent = `${label}: ${get() ? 'ON' : 'OFF'}`;
			btn.classList.toggle('active', get());
		};
		btn.addEventListener('click', () => { set(!get()); update(); });
		update();
		this.#panel.appendChild(btn);
		return btn;
	}
}
