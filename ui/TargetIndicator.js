import { GameObject } from '../core/GameObject.js';
import { Enemy } from '../enemy/enemy.js';

const BRACKET_LEN = 10;
const BRACKET_GAP = 6;
const COLOR = '#ff4444';
const TARGET_RADIUS = 600;

const DIRECTIONS = [
	'east',
	'south-east',
	'south',
	'south-west',
	'west',
	'north-west',
	'north',
	'north-east',
];

function angleToDirection(dx, dy) {
	const angle = Math.atan2(dy, dx);
	const index = Math.round(angle / (Math.PI / 4) + 8) % 8;
	return DIRECTIONS[index];
}

export class TargetIndicator extends GameObject {
	#game;
	#player;
	#target = null;
	#showDebug = true;

	get target() {
		return this.#target;
	}

	constructor(game, player) {
		super();
		this.layer = 8;
		this.#game = game;
		this.#player = player;
	}

	update(dt) {
		const px = this.#player.x;
		const py = this.#player.y;
		const enemies = this.#game
			.getEntities(Enemy)
			.filter((e) => Math.hypot(e.x - px, e.y - py) <= TARGET_RADIUS);

		if (enemies.length === 0) {
			this.#target = null;
			super.update(dt);
			return;
		}

		this.#target = enemies.reduce((nearest, e) =>
			Math.hypot(e.x - px, e.y - py) <
			Math.hypot(nearest.x - px, nearest.y - py)
				? e
				: nearest,
		);

		this.#player.facing = angleToDirection(
			this.#target.x - px,
			this.#target.y - py,
		);

		super.update(dt);
	}

	draw(ctx) {
		const px = this.#player.x;
		const py = this.#player.y;

		// Debug radius circle
		if (this.#showDebug) {
			ctx.save();
			ctx.strokeStyle = 'rgba(255, 68, 68, 0.2)';
			ctx.lineWidth = 1;
			ctx.setLineDash([6, 6]);
			ctx.beginPath();
			ctx.arc(px, py, TARGET_RADIUS, 0, Math.PI * 2);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.restore();
		}

		if (!this.#target) return;

		const hw = this.#target.width / 2 + BRACKET_GAP;
		const hh = this.#target.height / 2 + BRACKET_GAP;
		const cx = Math.round(this.#target.x);
		const cy = Math.round(this.#target.y);
		const bl = BRACKET_LEN;

		ctx.save();
		ctx.strokeStyle = COLOR;
		ctx.lineWidth = 2;
		ctx.shadowColor = COLOR;
		ctx.shadowBlur = 6;

		ctx.beginPath();
		// Top-left
		ctx.moveTo(cx - hw + bl, cy - hh);
		ctx.lineTo(cx - hw, cy - hh);
		ctx.lineTo(cx - hw, cy - hh + bl);
		// Top-right
		ctx.moveTo(cx + hw - bl, cy - hh);
		ctx.lineTo(cx + hw, cy - hh);
		ctx.lineTo(cx + hw, cy - hh + bl);
		// Bottom-left
		ctx.moveTo(cx - hw + bl, cy + hh);
		ctx.lineTo(cx - hw, cy + hh);
		ctx.lineTo(cx - hw, cy + hh - bl);
		// Bottom-right
		ctx.moveTo(cx + hw - bl, cy + hh);
		ctx.lineTo(cx + hw, cy + hh);
		ctx.lineTo(cx + hw, cy + hh - bl);
		ctx.stroke();

		ctx.restore();
		super.draw(ctx);
	}
}
