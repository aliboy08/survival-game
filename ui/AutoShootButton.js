export class AutoShootButton {
	#shootSystem;
	#btn;

	constructor(shootSystem) {
		this.#shootSystem = shootSystem;
		this.#build();
	}

	#build() {
		this.#btn = document.createElement('button');
		this.#btn.id = 'auto-shoot-button';
		this.#btn.textContent = 'AUTO';

		this.#btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			const active = this.#shootSystem.toggleAutoShoot();
			this.#btn.classList.toggle('active', active);
		});

		document.getElementById('hud-br-row-primary').appendChild(this.#btn);
	}
}
