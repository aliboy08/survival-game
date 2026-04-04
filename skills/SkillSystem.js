import { GameObject } from '../core/GameObject.js';
import { Bindings }    from '../core/Bindings.js';

export class SkillSystem extends GameObject {
	#player;
	#game;

	constructor(game, player) {
		super();
		this.#game   = game;
		this.#player = player;
		this.layer   = 5;

		window.addEventListener('keydown', (e) => {
			const index = ['skill1', 'skill2', 'skill3', 'skill4']
				.findIndex(a => Bindings.get(a) === e.code);
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
