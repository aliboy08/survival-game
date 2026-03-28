export class ReloadButton {
	#btn;

	constructor(shootSystem) {
		this.#btn = document.createElement('button');
		this.#btn.id = 'reload-button';
		this.#btn.textContent = 'RELOAD';
		this.#btn.addEventListener('pointerdown', (e) => {
			e.stopPropagation();
			shootSystem.reload();
		});
		document.body.appendChild(this.#btn);
	}
}
