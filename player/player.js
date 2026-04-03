import { GameObject } from '../core/GameObject.js';
import { loadPlayerSprites } from './sprite.js';
import { Animator } from './animator.js';
import { Movement } from './movement.js';
import { Equipment } from './Equipment.js';
import { Rifle } from '../weapon/guns/Rifle.js';
import { HomingGun } from '../weapon/guns/HomingGun.js';
import { Sword } from '../weapon/melee/Sword.js';
import { SkillSlots } from '../skills/SkillSlots.js';

const SPRITE_SCALE = 2; // 48x48 → 96x96
const SPRITE_SIZE = 48;
const MAX_HP = 100;
const MAX_ENERGY = 100;
const ENERGY_REGEN = 12; // per second
const DAMAGE_COOLDOWN = 1; // seconds of invincibility after a hit

export class Player extends GameObject {
	#animator = null;
	#direction = 'south';
	#input;
	#movement = new Movement();
	#damageCooldown = 0;

	hp = MAX_HP;
	maxHp = MAX_HP;
	energy = MAX_ENERGY;
	maxEnergy = MAX_ENERGY;
	energyRegen = ENERGY_REGEN;
	xp = 0;
	xpToNext = 100;
	level = 1;
	equipment = new Equipment();
	activeSlot = 'primary';
	skillSlots = new SkillSlots();
	godMode = false;
	infiniteAmmo = false;
	shielded = false;
	invisible = false;
	speedMultiplier = 1.0;

	constructor(x, y, input) {
		super();
		this.x = x;
		this.y = y;
		this.width = SPRITE_SIZE * SPRITE_SCALE;
		this.height = SPRITE_SIZE * SPRITE_SCALE;
		this.#input = input;
		this.equipment.primary = new Rifle();
		this.equipment.secondary = new HomingGun();
		this.equipment.melee = new Sword();
	}

	async init() {
		const sprites = await loadPlayerSprites();
		this.#animator = new Animator(sprites);
		super.init();
	}

	get facing() {
		return this.#direction;
	}
	set facing(dir) {
		this.#direction = dir;
	}

	get activeWeapon() {
		return this.equipment[this.activeSlot] ?? null;
	}

	cycleWeapon() {
		const slots = ['primary', 'secondary', 'melee'];
		const next = (slots.indexOf(this.activeSlot) + 1) % slots.length;
		this.activeSlot = slots[next];
		this.emit('weaponswitch', this.activeSlot);
	}

	gainXp(amount) {
		this.xp += amount;
		while (this.xp >= this.xpToNext) {
			this.xp -= this.xpToNext;
			this.level += 1;
			this.xpToNext = this.level * 100;
			this.maxHp += 10;
			this.hp = Math.min(this.hp + 20, this.maxHp);
			this.emit('levelup', this.level);
		}
	}

	takeDamage(amount) {
		if (this.godMode || this.shielded) return;
		if (this.#damageCooldown > 0) return;
		this.hp = Math.max(0, this.hp - amount);
		this.#damageCooldown = DAMAGE_COOLDOWN;
		if (this.hp === 0) this.emit('dead');
	}

	update(dt) {
		if (this.#damageCooldown > 0) this.#damageCooldown -= dt;

		const dir = this.#movement.update(this, this.#input, dt);

		if (dir) {
			this.#direction = dir;
			this.#animator.setState('walk');
		} else {
			this.#animator.setState('breathing-idle');
		}

		this.#animator.update(dt);
		super.update(dt);
	}

	draw(ctx) {
		if (!this.#animator) return;

		if (this.invisible) ctx.globalAlpha = 0.3;
		ctx.drawImage(
			this.#animator.getFrame(this.#direction),
			Math.round(this.x - this.width / 2),
			Math.round(this.y - this.height / 2),
			this.width,
			this.height,
		);
		if (this.invisible) ctx.globalAlpha = 1.0;

		super.draw(ctx);
	}
}
