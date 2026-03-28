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
      e.stopPropagation();
      this.#input.setShootHeld(true);
    });
    this.#btn.addEventListener('pointerup',     () => this.#input.setShootHeld(false));
    this.#btn.addEventListener('pointercancel', () => this.#input.setShootHeld(false));
    this.#btn.addEventListener('pointerleave',  () => this.#input.setShootHeld(false));

    document.body.appendChild(this.#btn);
  }
}
