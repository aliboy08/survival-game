import { Skill }        from '../Skill.js';
import { GameObject }  from '../../core/GameObject.js';

class TeleportReticle extends GameObject {
	#cx;
	#cy;
	#range;
	#tx;
	#ty;
	#pulse = 0;

	constructor(originX, originY, range) {
		super();
		this.#cx    = originX;
		this.#cy    = originY;
		this.#range = range;
		this.#tx    = originX;
		this.#ty    = originY;
		this.layer  = 8;
	}

	setTarget(x, y) {
		this.#tx = x;
		this.#ty = y;
	}

	update(dt) {
		this.#pulse += dt * 4;
		super.update(dt);
	}

	draw(ctx) {
		const tx    = this.#tx;
		const ty    = this.#ty;
		const cx    = this.#cx;
		const cy    = this.#cy;
		const pulse = 0.65 + 0.35 * Math.sin(this.#pulse);

		const dist      = Math.hypot(tx - cx, ty - cy);
		const inRange   = dist <= this.#range;
		const aimColor  = inRange ? '#c39bd3' : '#e74c3c';

		ctx.save();

		// ── Range circle at origin ──────────────────────────────
		ctx.globalAlpha    = 0.22 * pulse;
		ctx.strokeStyle    = '#c39bd3';
		ctx.lineWidth      = 1.5;
		ctx.setLineDash([6, 4]);
		ctx.lineDashOffset = -(Date.now() / 55) % 10;
		ctx.beginPath();
		ctx.arc(cx, cy, this.#range, 0, Math.PI * 2);
		ctx.stroke();
		ctx.setLineDash([]);

		// ── Line origin → target ────────────────────────────────
		ctx.globalAlpha = 0.35 * pulse;
		ctx.strokeStyle = aimColor;
		ctx.lineWidth   = 1;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(tx, ty);
		ctx.stroke();
		ctx.setLineDash([]);

		// ── Crosshair at target ─────────────────────────────────
		const r = 16;
		ctx.globalAlpha = 0.85 * pulse;
		ctx.strokeStyle = aimColor;
		ctx.lineWidth   = 2;

		ctx.beginPath();
		ctx.arc(tx, ty, r, 0, Math.PI * 2);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(tx - r - 6, ty); ctx.lineTo(tx + r + 6, ty);
		ctx.moveTo(tx, ty - r - 6); ctx.lineTo(tx, ty + r + 6);
		ctx.stroke();

		// ── Origin dot ─────────────────────────────────────────
		ctx.globalAlpha = 0.5 * pulse;
		ctx.fillStyle   = '#c39bd3';
		ctx.beginPath();
		ctx.arc(cx, cy, 4, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
		super.draw(ctx);
	}
}

export class Teleport extends Skill {
	#activateTime      = 0;
	#originX           = 0;
	#originY           = 0;
	#pointerX          = 0;
	#pointerY          = 0;
	#canvas            = null;
	#reticle           = null;
	#onPointerMove     = null;
	#onCanvasDown      = null;
	#confirmedByCanvas = false;

	constructor() {
		super({
			name:        'Teleport',
			description: 'Target a position and teleport. Double-tap to teleport randomly within range.',
			category:    'buff',
			energyCost:  25,
			cooldown:    12,
			channeling:  true,
			drainRate:   0,
			range:       350,
		});
	}

	activate(player, game) {
		this.#activateTime      = Date.now();
		this.#originX           = player.x;
		this.#originY           = player.y;
		this.#pointerX          = player.x;
		this.#pointerY          = player.y;
		this.#canvas            = game.canvas;
		this.#confirmedByCanvas = false;

		this.#reticle = new TeleportReticle(player.x, player.y, this.range);
		game.add(this.#reticle);

		document.body.style.cursor = 'crosshair';

		this.#onPointerMove = (e) => {
			const rect     = this.#canvas.getBoundingClientRect();
			this.#pointerX = (e.clientX - rect.left) * (this.#canvas.width  / rect.width);
			this.#pointerY = (e.clientY - rect.top)  * (this.#canvas.height / rect.height);
			this.#reticle?.setTarget(this.#pointerX, this.#pointerY);
		};

		// Canvas tap confirms target position
		this.#onCanvasDown = (e) => {
			const rect     = this.#canvas.getBoundingClientRect();
			this.#pointerX = (e.clientX - rect.left) * (this.#canvas.width  / rect.width);
			this.#pointerY = (e.clientY - rect.top)  * (this.#canvas.height / rect.height);
			this.#confirmedByCanvas = true;
			const index = player.skillSlots.slots.indexOf(this);
			if (index !== -1) player.skillSlots.activate(index, player, game);
		};

		window.addEventListener('pointermove', this.#onPointerMove);
		this.#canvas.addEventListener('pointerdown', this.#onCanvasDown);
	}

	deactivate(player, game) {
		const elapsed = Date.now() - this.#activateTime;
		const hw      = player.width  / 2;
		const hh      = player.height / 2;
		const w       = this.#canvas.width;
		const h       = this.#canvas.height;

		if (!this.#confirmedByCanvas && elapsed < 200) {
			// Double-tap: random position within range
			const angle = Math.random() * Math.PI * 2;
			const dist  = (0.3 + Math.random() * 0.7) * this.range;
			player.x = Math.max(hw, Math.min(w - hw, this.#originX + Math.cos(angle) * dist));
			player.y = Math.max(hh, Math.min(h - hh, this.#originY + Math.sin(angle) * dist));
		} else {
			// Targeted teleport to confirmed or last known pointer position
			player.x = Math.max(hw, Math.min(w - hw, this.#pointerX));
			player.y = Math.max(hh, Math.min(h - hh, this.#pointerY));
		}

		this.#cleanup();
	}

	#cleanup() {
		if (this.#onPointerMove) {
			window.removeEventListener('pointermove', this.#onPointerMove);
			this.#onPointerMove = null;
		}
		if (this.#onCanvasDown) {
			this.#canvas?.removeEventListener('pointerdown', this.#onCanvasDown);
			this.#onCanvasDown = null;
		}
		if (this.#reticle) {
			this.#reticle.dead = true;
			this.#reticle = null;
		}
		document.body.style.cursor = '';
		this.#canvas = null;
	}
}
