import { Skill }      from '../Skill.js';
import { GameObject } from '../../core/GameObject.js';
import { Gun }        from '../../weapon/guns/Gun.js';

class AdrenalineTrail extends GameObject {
	#player;
	#points      = []; // { x, y, alpha }
	#sampleTimer = 0;
	#active      = true;

	constructor(player) {
		super();
		this.#player = player;
		this.layer   = 0; // draw below player
	}

	stop() {
		this.#active = false;
	}

	update(dt) {
		if (this.#active) {
			this.#sampleTimer += dt;
			if (this.#sampleTimer >= 0.04) {
				this.#sampleTimer = 0;
				this.#points.push({ x: this.#player.x, y: this.#player.y, alpha: 1.0 });
			}
		}

		for (const p of this.#points) p.alpha -= dt * 2.5;
		this.#points = this.#points.filter(p => p.alpha > 0);

		if (!this.#active && this.#points.length === 0) this.dead = true;

		super.update(dt);
	}

	draw(ctx) {
		for (const p of this.#points) {
			ctx.save();
			ctx.globalAlpha = p.alpha * 0.65;
			ctx.shadowColor = '#00eeff';
			ctx.shadowBlur  = 14;
			ctx.fillStyle   = '#00eeff';
			ctx.beginPath();
			ctx.arc(p.x, p.y, 7 * p.alpha, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		super.draw(ctx);
	}
}

export class Adrenaline extends Skill {
	#trail      = null;
	#savedRates = new Map();

	constructor() {
		super({
			name:        'Adrenaline',
			description: 'Greatly increases movement speed and fire rate',
			category:    'buff',
			energyCost:  25,
			cooldown:    8,
			duration:    10,
			strength:    2.0, // speed & fire rate multiplier
		});
	}

	activate(player, game) {
		const str = this.effectiveStrength(player);
		player.speedMultiplier = str;

		this.#savedRates.clear();
		const { primary, secondary, melee } = player.equipment;
		for (const weapon of [primary, secondary, melee]) {
			if (weapon instanceof Gun) {
				this.#savedRates.set(weapon, weapon.fireRate);
				weapon.fireRate = weapon.fireRate / str;
			}
		}

		this.#trail = new AdrenalineTrail(player);
		game.add(this.#trail);
	}

	deactivate(player, game) {
		player.speedMultiplier = 1.0;

		for (const [weapon, rate] of this.#savedRates) weapon.fireRate = rate;
		this.#savedRates.clear();

		this.#trail?.stop();
		this.#trail = null;
	}
}
