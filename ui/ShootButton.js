export class ShootButton {
  #input;
  #btn;

  constructor(input) {
    this.#input = input;
    this.#build();
  }

  #build() {
    this.#btn = document.createElement('button');
    this.#btn.id = 'shoot-button';
    this.#btn.textContent = 'SHOOT';

    this.#btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); // prevent tap-to-move on canvas
      this.#input.setShoot();
    });

    document.body.appendChild(this.#btn);
  }
}
