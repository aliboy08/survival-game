export class WeaponSelectUI {
  #selector;
  #buttons = {};

  constructor(selector) {
    this.#selector = selector;
    this.#build();
    selector.on('change', (w) => this.#highlight(w));
  }

  #build() {
    const panel = document.createElement('div');
    panel.id = 'weapon-select-panel';

    const label = document.createElement('span');
    label.id          = 'weapon-select-label';
    label.textContent = 'WEAPON';
    panel.appendChild(label);

    const row = document.createElement('div');
    row.id = 'weapon-select-row';

    for (const weapon of ['bullet', 'laser']) {
      const btn = document.createElement('button');
      btn.className   = 'weapon-btn';
      btn.dataset.weapon = weapon;
      btn.textContent = weapon.toUpperCase();
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.#selector.select(weapon);
      });
      row.appendChild(btn);
      this.#buttons[weapon] = btn;
    }

    panel.appendChild(row);
    document.body.appendChild(panel);

    // Highlight the default weapon
    this.#highlight(this.#selector.activeWeapon);
  }

  #highlight(activeWeapon) {
    for (const [weapon, btn] of Object.entries(this.#buttons)) {
      btn.classList.toggle('active', weapon === activeWeapon);
    }
  }
}
