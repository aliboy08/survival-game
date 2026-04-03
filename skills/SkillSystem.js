import { GameObject } from '../core/GameObject.js';

export class SkillSystem extends GameObject {
	#player;
	#game;

	constructor(game, player) {
		super();
		this.#game   = game;
		this.#player = player;
		this.layer   = 5;

		window.addEventListener('keydown', (e) => {
			const index = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
			if (index !== -1) this.activate(index);
		});
	}

	activate(index) {
		return this.#player.skillSlots.activate(index, this.#player, this.#game);
	}

	update(dt) {
		this.#player.skillSlots.update(dt, this.#player, this.#game);
		super.update(dt);
	}
}
