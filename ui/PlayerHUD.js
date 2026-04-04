import { GameObject } from '../core/GameObject.js';

export class PlayerHUD extends GameObject {
	#player;
	#levelUpTimer = 0;

	// DOM elements — bars
	#hpFill;   #hpText;   #lvText;
	#shdFill;  #shdText;
	#nrgFill;  #nrgText;
	#xpFill;   #xpText;

	// DOM elements — level-up notification
	#levelupEl;
	#levelupSub;

	constructor(player) {
		super();
		this.layer   = 10;
		this.#player = player;
		this.#buildBars();
		this.#buildLevelUp();

		player.on('levelup', () => {
			this.#levelUpTimer = 2.5;
			this.#levelupSub.textContent = `Level ${player.level}`;
			this.#levelupEl.classList.remove('hidden');
		});
	}

	// ── DOM construction ────────────────────────────────────────────────────

	#buildBars() {
		const container = document.getElementById('hud-top-left');
		const panel = document.createElement('div');
		panel.className = 'hud-panel';

		// Level label
		this.#lvText = document.createElement('div');
		this.#lvText.className = 'hud-lv';
		panel.appendChild(this.#lvText);

		// HP bar
		const hp = this.#makeStat(panel, 'HP', 12, '#2ecc71', '#fff');
		this.#hpFill = hp.fill;
		this.#hpText = hp.value;

		// Shield bar
		const shd = this.#makeStat(panel, 'SHD', 8, '#5dade2', '#5dade2');
		this.#shdFill = shd.fill;
		this.#shdText = shd.value;

		// Energy bar
		const nrg = this.#makeStat(panel, 'NRG', 8, '#00c8ff', '#00c8ff');
		this.#nrgFill = nrg.fill;
		this.#nrgText = nrg.value;

		// XP bar
		const xp = this.#makeStat(panel, 'XP', 6, '#8e44ad', 'rgba(255,255,255,0.35)');
		this.#xpFill = xp.fill;
		this.#xpText = xp.value;

		// Divider
		const div = document.createElement('div');
		div.className = 'hud-divider';
		panel.appendChild(div);

		container.appendChild(panel);
	}

	#makeStat(parent, label, height, barColor, valueColor) {
		const wrap = document.createElement('div');
		wrap.className = 'hud-stat';

		const track = document.createElement('div');
		track.className = 'hud-bar-track';
		track.style.height = height + 'px';

		const fill = document.createElement('div');
		fill.className = 'hud-bar-fill';
		fill.style.backgroundColor = barColor;
		fill.style.width = '100%';
		track.appendChild(fill);
		wrap.appendChild(track);

		const row = document.createElement('div');
		row.className = 'hud-stat-row';

		const labelEl = document.createElement('span');
		labelEl.className = 'hud-stat-label';
		labelEl.textContent = label;

		const valueEl = document.createElement('span');
		valueEl.className = 'hud-stat-value';
		valueEl.style.color = valueColor;

		row.appendChild(labelEl);
		row.appendChild(valueEl);
		wrap.appendChild(row);

		parent.appendChild(wrap);
		return { fill, value: valueEl };
	}

	#buildLevelUp() {
		this.#levelupEl = document.createElement('div');
		this.#levelupEl.id = 'levelup-notification';
		this.#levelupEl.classList.add('hidden');

		const title = document.createElement('div');
		title.id = 'levelup-title';
		title.textContent = 'LEVEL UP!';

		this.#levelupSub = document.createElement('div');
		this.#levelupSub.id = 'levelup-sub';

		this.#levelupEl.appendChild(title);
		this.#levelupEl.appendChild(this.#levelupSub);
		document.body.appendChild(this.#levelupEl);
	}

	// ── Update ───────────────────────────────────────────────────────────────

	update(dt) {
		if (this.#levelUpTimer > 0) {
			this.#levelUpTimer -= dt;
			if (this.#levelUpTimer <= 0) {
				this.#levelupEl.classList.add('hidden');
			}
		}

		const p = this.#player;

		// Level
		this.#lvText.textContent = `LV ${p.level}`;

		// HP — color shifts green → orange → red
		const hpRatio = Math.max(0, p.hp / p.maxHp);
		const hpColor = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
		this.#hpFill.style.width = `${hpRatio * 100}%`;
		this.#hpFill.style.backgroundColor = hpColor;
		this.#hpText.textContent = `${p.hp} / ${p.maxHp}`;

		// Shield
		const shdRatio = Math.max(0, p.shield / p.maxShield);
		this.#shdFill.style.width = `${shdRatio * 100}%`;
		this.#shdText.textContent = `${Math.floor(p.shield)} / ${p.maxShield}`;

		// Energy
		const nrgRatio = Math.max(0, p.energy / p.maxEnergy);
		this.#nrgFill.style.width = `${nrgRatio * 100}%`;
		this.#nrgText.textContent = `${Math.floor(p.energy)} / ${p.maxEnergy}`;

		// XP
		const xpRatio = Math.max(0, p.xp / p.xpToNext);
		this.#xpFill.style.width = `${xpRatio * 100}%`;
		this.#xpText.textContent = `${p.xp} / ${p.xpToNext}`;

		super.update(dt);
	}

	draw(ctx) {
		super.draw(ctx);
	}
}
