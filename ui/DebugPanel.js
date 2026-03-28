import { get_arr_item_class } from '../js/utils.js';

export class DebugPanel {
	#game;
	#player;
	#panel;

	constructor(game, player) {
		this.#game = game;
		this.#player = player;

		this.enemy_spawner = get_arr_item_class(game.entities, 'EnemySpawner');

		this.#build();
	}

	#build() {
		this.#panel = document.createElement('div');
		this.#panel.id = 'debug-panel';

		this.#addButton('Spawn Enemy', () => this.enemy_spawner.spawn());

		document.body.appendChild(this.#panel);
	}

	#addButton(label, onClick) {
		const btn = document.createElement('button');
		btn.textContent = label;
		btn.addEventListener('click', onClick);
		this.#panel.appendChild(btn);
		return btn;
	}
}
