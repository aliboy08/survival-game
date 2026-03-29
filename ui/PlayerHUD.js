import { GameObject } from '../core/GameObject.js';

const BAR_WIDTH  = 160;
const BAR_HEIGHT = 12;
const XP_BAR_H   = 6;
const PADDING    = 16;

const SLOT_COLORS = {
	primary:   '#f39c12',
	secondary: '#00c8ff',
	melee:     '#e74c3c',
};

export class PlayerHUD extends GameObject {
	#player;
	#levelUpTimer = 0;

	constructor(player) {
		super();
		this.layer   = 10;
		this.#player = player;
		player.on('levelup', () => {
			this.#levelUpTimer = 2.5;
		});
	}

	update(dt) {
		if (this.#levelUpTimer > 0) this.#levelUpTimer -= dt;
		super.update(dt);
	}

	draw(ctx) {
		const p   = this.#player;
		const x   = PADDING;
		const hpY = PADDING + 6;

		// ── Backdrop panel ──────────────────────────────────────
		ctx.save();
		ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
		ctx.beginPath();
		ctx.roundRect(x - 10, 6, BAR_WIDTH + 26, 148, 10);
		ctx.fill();
		ctx.restore();

		// ── HP bar ───────────────────────────────────────────────
		const hpRatio = Math.max(0, p.hp / p.maxHp);
		const hpColor = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';

		ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
		ctx.beginPath();
		ctx.roundRect(x, hpY, BAR_WIDTH, BAR_HEIGHT, BAR_HEIGHT / 2);
		ctx.fill();

		const hpFill = Math.max(BAR_HEIGHT, Math.round(BAR_WIDTH * hpRatio));
		ctx.fillStyle = hpColor;
		ctx.beginPath();
		ctx.roundRect(x, hpY, hpFill, BAR_HEIGHT, BAR_HEIGHT / 2);
		ctx.fill();

		// HP labels
		const hpLabelY = hpY + BAR_HEIGHT + 12;
		ctx.font      = '9px monospace';
		ctx.fillStyle = 'rgba(255,255,255,0.4)';
		ctx.textAlign = 'left';
		ctx.fillText('HP', x, hpLabelY);

		ctx.font      = 'bold 10px monospace';
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'right';
		ctx.fillText(`${p.hp} / ${p.maxHp}`, x + BAR_WIDTH, hpLabelY);

		ctx.font      = '9px monospace';
		ctx.fillStyle = 'rgba(255,255,255,0.3)';
		ctx.fillText(`LV ${p.level}`, x + BAR_WIDTH, hpY - 1);

		// ── XP bar ───────────────────────────────────────────────
		const xpRatio = Math.max(0, p.xp / p.xpToNext);
		const xpY     = hpLabelY + 10;

		ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
		ctx.beginPath();
		ctx.roundRect(x, xpY, BAR_WIDTH, XP_BAR_H, XP_BAR_H / 2);
		ctx.fill();

		const xpFill = Math.max(XP_BAR_H, Math.round(BAR_WIDTH * xpRatio));
		ctx.fillStyle = '#8e44ad';
		ctx.beginPath();
		ctx.roundRect(x, xpY, xpFill, XP_BAR_H, XP_BAR_H / 2);
		ctx.fill();

		// XP label
		const xpLabelY = xpY + XP_BAR_H + 11;
		ctx.font      = '9px monospace';
		ctx.fillStyle = 'rgba(255,255,255,0.35)';
		ctx.textAlign = 'left';
		ctx.fillText(`XP  ${p.xp} / ${p.xpToNext}`, x, xpLabelY);

		// ── Divider ───────────────────────────────────────────────
		const divY = xpLabelY + 10;
		ctx.fillStyle = 'rgba(255,255,255,0.07)';
		ctx.fillRect(x, divY, BAR_WIDTH, 1);

		// ── Equipment slots ───────────────────────────────────────
		const eqStartY = divY + 14;
		const eq       = p.equipment;
		const slots    = ['primary', 'secondary', 'melee'];
		const labels   = { primary: 'PRI', secondary: 'SEC', melee: 'MEL' };

		slots.forEach((key, i) => {
			const weapon   = eq[key];
			const isActive = p.activeSlot === key;
			const color    = SLOT_COLORS[key];
			const slotY    = eqStartY + i * 16;

			// Active indicator dot
			if (isActive) {
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(x - 4, slotY - 3, 2.5, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.font      = isActive ? 'bold 10px monospace' : '9px monospace';
			ctx.textAlign = 'left';
			ctx.fillStyle = isActive ? color : 'rgba(255,255,255,0.28)';
			ctx.fillText(labels[key], x + 4, slotY);

			ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.35)';
			ctx.fillText(weapon ? weapon.name : '---', x + 34, slotY);
		});

		// ── Level-up notification ────────────────────────────────
		if (this.#levelUpTimer > 0) {
			const alpha = Math.min(1, this.#levelUpTimer);
			const cw    = ctx.canvas.width;
			const cy    = 72;
			ctx.save();
			ctx.globalAlpha = alpha;

			ctx.font        = 'bold 24px monospace';
			ctx.fillStyle   = '#f1c40f';
			ctx.shadowColor = '#f1c40f';
			ctx.shadowBlur  = 24;
			ctx.textAlign   = 'center';
			ctx.fillText('LEVEL UP!', cw / 2, cy);

			ctx.shadowBlur  = 0;
			ctx.font        = '13px monospace';
			ctx.fillStyle   = 'rgba(255,255,255,0.65)';
			ctx.fillText(`Level ${p.level}`, cw / 2, cy + 22);

			ctx.restore();
		}

		super.draw(ctx);
	}
}
