import { Enemy } from '../enemy/enemy.js';

export class DebugPanel {
  #game;
  #panel;

  constructor(game) {
    this.#game = game;
    this.#build();
  }

  #build() {
    this.#panel = document.createElement('div');
    this.#panel.id = 'debug-panel';

    this.#addButton('Spawn Enemy', () => this.#spawnEnemy());

    document.body.appendChild(this.#panel);
  }

  #addButton(label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    this.#panel.appendChild(btn);
    return btn;
  }

  #spawnEnemy() {
    const padding = 60;
    const x = padding + Math.random() * (this.#game.canvas.width  - padding * 2);
    const y = padding + Math.random() * (this.#game.canvas.height - padding * 2);
    this.#game.add(new Enemy(x, y));
  }
}
