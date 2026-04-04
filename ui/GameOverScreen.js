export class GameOverScreen {
  #el;
  #game;

  constructor(game) {
    this.#game = game;
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
    this.#game.stop();
    this.#el.classList.add('visible');
  }
}
