import { Skill }      from '../Skill.js';
import { GameObject } from '../../core/GameObject.js';
import { Enemy }      from '../../enemy/enemy.js';

const DOME_DURATION     = 8;    // seconds the dome lasts
const FREEZE_DELAY      = 2;    // seconds inside before enemy freezes
const FREEZE_MULTIPLIER = 0.02;

class FrostDomeEffect extends GameObject {
	#cx;
	#cy;
	#range;
	#slowMultiplier;
	#timeLeft;
	#maxTime;
	#game;
	#affected = new Map(); // enemy → timeInside

	constructor(x, y, range, slowMultiplier, game) {
		super();
		this.#cx             = x;
		this.#cy             = y;
		this.#range          = range;
		this.#slowMultiplier = slowMultiplier;
		this.#timeLeft       = DOME_DURATION;
		this.#maxTime        = DOME_DURATION;
		this.#game           = game;
		this.layer           = 1;
	}

	update(dt) {
		this.#timeLeft -= dt;
		if (this.#timeLeft <= 0) {
			this.#restoreAll();
			this.dead = true;
			super.update(dt);
			return;
		}

		const enemies  = this.#game.getEntities(Enemy);
		const inDome   = new Set();

		for (const enemy of enemies) {
			if (enemy.dead || enemy.isDead) continue;
			const dist = Math.hypot(enemy.x - this.#cx, enemy.y - this.#cy);
			if (dist > this.#range) continue;

			inDome.add(enemy);
			const timeInside = (this.#affected.get(enemy) ?? 0) + dt;
			this.#affected.set(enemy, timeInside);

			if (timeInside >= FREEZE_DELAY) {
				enemy.speedMultiplier = FREEZE_MULTIPLIER;
				enemy.frozen          = true;
			} else {
				enemy.speedMultiplier = this.#slowMultiplier;
				enemy.frozen          = false;
			}
		}

		// Restore enemies that left the dome
		for (const [enemy] of this.#affected) {
			if (!inDome.has(enemy)) {
				enemy.speedMultiplier = 1.0;
				enemy.frozen          = false;
				this.#affected.delete(enemy);
			}
		}

		super.update(dt);
	}

	draw(ctx) {
		const pulse   = 0.12 + 0.06 * Math.sin(Date.now() / 250);
		const lifeFrac = this.#timeLeft / this.#maxTime;

		ctx.save();

		// Fill
		ctx.globalAlpha = pulse;
		ctx.fillStyle   = '#00c8ff';
		ctx.beginPath();
		ctx.arc(this.#cx, this.#cy, this.#range, 0, Math.PI * 2);
		ctx.fill();

		// Border
		ctx.globalAlpha  = 0.5 + 0.2 * Math.sin(Date.now() / 200);
		ctx.strokeStyle  = '#00eeff';
		ctx.lineWidth    = 2.5;
		ctx.setLineDash([8, 5]);
		ctx.lineDashOffset = -(Date.now() / 40) % 13;
		ctx.beginPath();
		ctx.arc(this.#cx, this.#cy, this.#range, 0, Math.PI * 2);
		ctx.stroke();
		ctx.setLineDash([]);

		// Duration arc (shrinking outer ring)
		ctx.globalAlpha = 0.7;
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth   = 2;
		ctx.beginPath();
		ctx.arc(this.#cx, this.#cy, this.#range + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeFrac);
		ctx.stroke();

		ctx.restore();

		super.draw(ctx);
	}

	#restoreAll() {
		for (const [enemy] of this.#affected) {
			enemy.speedMultiplier = 1.0;
			enemy.frozen          = false;
		}
		this.#affected.clear();
	}
}

export class FrostDome extends Skill {
	constructor() {
		super({
			name:        'Frost Dome',
			description: 'Creates a stationary dome. Enemies inside are slowed, then frozen.',
			category:    'cc',
			energyCost:  45,
			cooldown:    18,
			duration:    DOME_DURATION,
			range:       120,
			strength:    0.3, // slow multiplier (0 = stopped, 1 = full speed)
		});
	}

	activate(player, game) {
		game.add(new FrostDomeEffect(player.x, player.y, this.range, this.strength, game));
	}
}
