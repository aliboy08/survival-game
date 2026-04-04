export class AttackButton {
	#input;
	#shootSystem;
	#btn;

	constructor(input, shootSystem) {
		this.#input = input;
		this.#shootSystem = shootSystem;
		this.#build();
		this.#tick();
	}

	#build() {
		this.#btn = document.createElement('button');
		this.#btn.id = 'attack-button';
		this.#btn.textContent = 'ATTACK';

		this.#btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			this.#input.setShootHeld(true);
		});
		this.#btn.addEventListener('pointerup',     () => this.#input.setShootHeld(false));
		this.#btn.addEventListener('pointercancel', () => this.#input.setShootHeld(false));
		this.#btn.addEventListener('pointerleave',  () => this.#input.setShootHeld(false));

		document.getElementById('hud-br-row-primary').appendChild(this.#btn);
	}

	#tick() {
		this.#btn.classList.toggle('reloading', this.#shootSystem?.reloading ?? false);
		requestAnimationFrame(() => this.#tick());
	}
}
