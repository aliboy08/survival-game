import { GameObject } from '../core/GameObject.js';

const BAR_WIDTH = 160;
const BAR_HEIGHT = 14;
const PADDING = 16;
const XP_BAR_H = 8;
const BAR_GAP = 30;

export class PlayerHUD extends GameObject {
	#player;
	#levelUpTimer = 0;

	constructor(player) {
		super();
		this.layer   = 10;
		this.#player = player;
		player.on('levelup', () => {
			this.#levelUpTimer = 2;
		});
	}

	update(dt) {
		if (this.#levelUpTimer > 0) this.#levelUpTimer -= dt;
		super.update(dt);
	}

	draw(ctx) {
		const p = this.#player;
		const x = PADDING;
		const y = PADDING;
		const ratio = Math.max(0, p.hp / p.maxHp);

		// HP bar background
		ctx.fillStyle = '#333';
		ctx.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);

		// HP bar fill — green → yellow → red
		ctx.fillStyle =
			ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c';
		ctx.fillRect(x, y, Math.round(BAR_WIDTH * ratio), BAR_HEIGHT);

		// HP bar border
		ctx.strokeStyle = 'rgba(255,255,255,0.3)';
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, BAR_WIDTH, BAR_HEIGHT);

		// HP label
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 11px monospace';
		ctx.textAlign = 'left';
		ctx.fillText(`HP  ${p.hp} / ${p.maxHp}`, x, y + BAR_HEIGHT + 13);

		// Level label (right-aligned to bar)
		ctx.textAlign = 'right';
		ctx.fillText(`Lv. ${p.level}`, x + BAR_WIDTH, y + BAR_HEIGHT + 13);
		ctx.textAlign = 'left';

		// XP bar
		const xpY = y + BAR_HEIGHT + BAR_GAP;
		const xpRatio = Math.max(0, p.xp / p.xpToNext);

		ctx.fillStyle = '#333';
		ctx.fillRect(x, xpY, BAR_WIDTH, XP_BAR_H);

		ctx.fillStyle = '#9b59b6';
		ctx.fillRect(x, xpY, Math.round(BAR_WIDTH * xpRatio), XP_BAR_H);

		ctx.strokeStyle = 'rgba(255,255,255,0.3)';
		ctx.lineWidth = 1;
		ctx.strokeRect(x, xpY, BAR_WIDTH, XP_BAR_H);

		ctx.fillStyle = 'rgba(255,255,255,0.7)';
		ctx.font = '9px monospace';
		ctx.fillText(`XP  ${p.xp} / ${p.xpToNext}`, x, xpY + XP_BAR_H + 11);

		// Equipment
		const eq = p.equipment;
		const eqSlots = [
			{ label: 'PRI', weapon: eq.primary },
			{ label: 'SEC', weapon: eq.secondary },
			{ label: 'MEL', weapon: eq.melee },
		];
		const eqY = xpY + XP_BAR_H + 40;
		ctx.font = 'bold 10px monospace';
		eqSlots.forEach(({ label, weapon }, i) => {
			const slotY = eqY + i * 14;
			ctx.fillStyle = weapon ? '#fff' : 'rgba(255,255,255,0.3)';
			ctx.textAlign = 'left';
			ctx.fillText(`${label}  ${weapon ? weapon.name : '---'}`, x, slotY);
		});

		// Level-up notification
		if (this.#levelUpTimer > 0) {
			const alpha = Math.min(1, this.#levelUpTimer);
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.font = 'bold 18px monospace';
			ctx.fillStyle = '#f1c40f';
			ctx.textAlign = 'left';
			ctx.fillText(`LEVEL UP!  Lv. ${p.level}`, x, xpY + XP_BAR_H + 26);
			ctx.restore();
		}

		super.draw(ctx);
	}
}
