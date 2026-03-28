import { GameObject } from '../core/GameObject.js';
import { Enemy } from '../enemy/enemy.js';

const DPS = 80; // damage per second to each enemy hit

export class Laser extends GameObject {
	#game;
	#player;
	#dx = 0;
	#dy = 0;
	#size;
	#beamEndT = null; // projection distance to first hit enemy, null if none

	constructor(player, game, { size = 6 } = {}) {
		super();
		this.layer = 5;
		this.#game = game;
		this.#player = player;
		this.#size = size;
	}

	update(dt) {
		this.#dx = 0;
		this.#dy = 0;

		const enemies = this.#game.getEntities(Enemy);

		// Track nearest enemy
		let nearest = null,
			nearestDist = Infinity;
		for (const e of enemies) {
			const d = Math.hypot(e.x - this.#player.x, e.y - this.#player.y);
			if (d < nearestDist) {
				nearestDist = d;
				nearest = e;
			}
		}

		if (nearest) {
			const rawDx = nearest.x - this.#player.x;
			const rawDy = nearest.y - this.#player.y;
			const dist = Math.hypot(rawDx, rawDy) || 1;
			this.#dx = rawDx / dist;
			this.#dy = rawDy / dist;

			// Find the first enemy along the ray (smallest t) and damage only that one
			let firstEnemy = null,
				firstT = Infinity;
			for (const enemy of enemies) {
				const t = this.#rayT(enemy);
				if (t !== null && t < firstT) {
					firstT = t;
					firstEnemy = enemy;
				}
			}
			this.#beamEndT = firstEnemy ? firstT : null;
			if (firstEnemy) firstEnemy.takeDamage(DPS * dt);
		}

		super.update(dt);
	}

	// Returns projection distance t if enemy is hit, otherwise null
	#rayT(enemy) {
		const ex = enemy.x - this.#player.x;
		const ey = enemy.y - this.#player.y;
		const t = ex * this.#dx + ey * this.#dy;
		if (t < 0) return null;
		const perpX = ex - t * this.#dx;
		const perpY = ey - t * this.#dy;
		return Math.hypot(perpX, perpY) < enemy.width / 2 + this.#size / 2
			? t
			: null;
	}

	draw(ctx) {
		if (this.#dx === 0 && this.#dy === 0) return;

		const { width, height } = this.#game.canvas;
		const ox = this.#player.x;
		const oy = this.#player.y;
		const tMax = this.#beamEndT ?? Math.max(width, height) * 2;
		const ex = ox + this.#dx * tMax;
		const ey = oy + this.#dy * tMax;

		ctx.save();
		ctx.lineCap = 'round';

		// Outer glow
		ctx.globalAlpha = 0.25;
		ctx.beginPath();
		ctx.moveTo(ox, oy);
		ctx.lineTo(ex, ey);
		ctx.strokeStyle = '#00ffff';
		ctx.lineWidth = this.#size * 3;
		ctx.shadowColor = '#00ffff';
		ctx.shadowBlur = 30;
		ctx.stroke();

		// Mid glow
		ctx.globalAlpha = 0.6;
		ctx.beginPath();
		ctx.moveTo(ox, oy);
		ctx.lineTo(ex, ey);
		ctx.strokeStyle = '#66ffff';
		ctx.lineWidth = this.#size;
		ctx.shadowBlur = 12;
		ctx.stroke();

		// Bright core
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.moveTo(ox, oy);
		ctx.lineTo(ex, ey);
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = Math.max(2, this.#size / 4);
		ctx.shadowColor = '#00ffff';
		ctx.shadowBlur = 6;
		ctx.stroke();

		ctx.restore();
		super.draw(ctx);
	}
}
