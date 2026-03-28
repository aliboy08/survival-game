export class GameOverScreen {
  #el;

  constructor() {
    this.#el = document.createElement('div');
    this.#el.id = 'game-over-screen';
    this.#el.innerHTML = `
      <h1>GAME OVER</h1>
      <button id="restart-button">RESTART</button>
    `;
    this.#el.querySelector('#restart-button')
      .addEventListener('pointerdown', () => location.reload());
    document.body.appendChild(this.#el);
  }

  show() {
    this.#el.classList.add('visible');
  }
}
