import { GameObject } from '../core/GameObject.js';
import { Enemy } from './enemy.js';
import { MeleeEnemy } from './MeleeEnemy.js';
import { RangedEnemy } from './RangedEnemy.js';

const SPAWN_INTERVAL = 2; // seconds between spawns
const MAX_ENEMIES = 10;

// Probability of spawning a ranged enemy (0.0 – 1.0)
const RANGED_CHANCE = 0.6;

export class EnemySpawner extends GameObject {
	#game;
	#player;
	#timer = 0;

	constructor(game, player, timer = true) {
		super();
		this.#game = game;
		this.#player = player;
		this.timer = timer;
	}

	update(dt) {
		this.#timer += dt;

		if (this.#timer >= SPAWN_INTERVAL && this.timer) {
			this.#timer = 0;
			const current = this.#game.getEntities(Enemy).length;
			if (current < MAX_ENEMIES) this.spawn();
		}

		super.update(dt);
	}

	spawn() {
		const { width, height } = this.#game.canvas;
		const edge = Math.floor(Math.random() * 4);
		let x, y;

		switch (edge) {
			case 0:
				x = Math.random() * width;
				y = 0;
				break; // top
			case 1:
				x = Math.random() * width;
				y = height;
				break; // bottom
			case 2:
				x = 0;
				y = Math.random() * height;
				break; // left
			case 3:
				x = width;
				y = Math.random() * height;
				break; // right
		}

		const enemy = Math.random() < RANGED_CHANCE
			? new RangedEnemy(x, y, this.#player, this.#game)
			: new MeleeEnemy(x, y, this.#player);

		this.#game.add(enemy);
	}
}
