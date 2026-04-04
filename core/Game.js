export class Game {
	#canvas;
	#ctx;
	#lastTime = 0;
	#rafId    = null;
	#stopped  = true;

	constructor(canvasId) {
		this.#canvas = document.getElementById(canvasId);
		this.#ctx = this.#canvas.getContext('2d');
		this.#ctx.imageSmoothingEnabled = false;
		this.entities = new Set();
		window.addEventListener('resize', () => this.#resize());
		this.#resize();
	}

	get canvas() {
		return this.#canvas;
	}
	get ctx() {
		return this.#ctx;
	}

	async add(entity) {
		await entity.init();
		this.entities.add(entity);
		return entity;
	}

	remove(entity) {
		entity.destroy();
		this.entities.delete(entity);
	}

	getEntities(Type) {
		return [...this.entities].filter((e) => e instanceof Type);
	}

	start() {
		this.#stopped = false;
		this.#rafId   = requestAnimationFrame((t) => this.#loop(t));
	}

	stop() {
		this.#stopped = true;
		if (this.#rafId !== null) {
			cancelAnimationFrame(this.#rafId);
			this.#rafId = null;
		}
	}

	#resize() {
		this.#canvas.width = window.innerWidth;
		this.#canvas.height = window.innerHeight;
		this.#ctx.imageSmoothingEnabled = false; // reset after resize
	}

	#loop(timestamp) {
		const dt = Math.min((timestamp - this.#lastTime) / 1000, 0.1); // seconds, capped
		this.#lastTime = timestamp;

		this.#ctx.fillStyle = '#1a1a2e';
		this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

		const sorted = [...this.entities].sort((a, b) => a.layer - b.layer);

		for (const entity of sorted) entity.update(dt);
		for (const entity of sorted) entity.draw(this.#ctx);

		// Auto-remove dead entities
		for (const entity of this.entities) {
			if (entity.dead) this.remove(entity);
		}

		if (!this.#stopped) {
			this.#rafId = requestAnimationFrame((t) => this.#loop(t));
		}
	}
}
