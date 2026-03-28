export class FireButton {
  #input;
  #btn;

  constructor(input) {
    this.#input = input;
    this.#build();
  }

  #build() {
    this.#btn = document.createElement('button');
    this.#btn.id = 'fire-button';
    this.#btn.textContent = '🔥';

    this.#btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); // prevent tap-to-move on canvas
      this.#input.setFire();
    });

    document.body.appendChild(this.#btn);
  }
}
