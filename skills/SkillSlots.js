export const MAX_SKILL_SLOTS = 4;

export class SkillSlots {
	#slots;
	#cooldowns;
	#cooldownDurations;
	#activeTimers;
	#channeling;

	noCooldown = false;

	constructor() {
		this.#slots             = new Array(MAX_SKILL_SLOTS).fill(null);
		this.#cooldowns         = new Array(MAX_SKILL_SLOTS).fill(0);
		this.#cooldownDurations = new Array(MAX_SKILL_SLOTS).fill(0);
		this.#activeTimers      = new Array(MAX_SKILL_SLOTS).fill(0);
		this.#channeling        = new Array(MAX_SKILL_SLOTS).fill(false);
	}

	equip(skill, index) {
		if (index < 0 || index >= MAX_SKILL_SLOTS) return false;
		this.#slots[index]        = skill;
		this.#cooldowns[index]    = 0;
		this.#activeTimers[index] = 0;
		this.#channeling[index]   = false;
		return true;
	}

	unequip(index) {
		if (index < 0 || index >= MAX_SKILL_SLOTS) return;
		this.#slots[index]        = null;
		this.#cooldowns[index]    = 0;
		this.#activeTimers[index] = 0;
		this.#channeling[index]   = false;
	}

	/** Try to activate the skill at index. Returns true if activated. */
	activate(index, player, game) {
		const skill = this.#slots[index];
		if (!skill) return false;
		if (this.#cooldowns[index] > 0) return false;

		// Toggle channeling off
		if (skill.channeling && this.#channeling[index]) {
			this.#stopActive(index, player, game);
			if (!this.noCooldown) this.#setCooldown(index, skill, player);
			return true;
		}

		const cost = Math.max(0, skill.energyCost * (player.skillCostMult ?? 1));
		if (player.energy < cost) return false;
		player.energy -= cost;

		skill.activate(player, game);

		if (skill.channeling) {
			this.#channeling[index]   = true;
			this.#activeTimers[index] = -1; // indefinite until toggled or energy runs out
		} else if (skill.duration > 0) {
			this.#activeTimers[index] = skill.duration * (player.skillDurationMult ?? 1);
		} else {
			// instant — cooldown starts immediately
			if (!this.noCooldown) this.#setCooldown(index, skill, player);
		}

		return true;
	}

	update(dt, player, game) {
		for (let i = 0; i < MAX_SKILL_SLOTS; i++) {
			const skill = this.#slots[i];
			if (!skill) continue;

			// Tick cooldown
			if (this.#cooldowns[i] > 0) {
				this.#cooldowns[i] = Math.max(0, this.#cooldowns[i] - dt);
			}

			// Channeling: drain energy each frame
			if (this.#channeling[i]) {
				const drain = skill.drainRate * (player.skillCostMult ?? 1) * dt;
				if (player.energy < drain) {
					this.#stopActive(i, player, game);
					if (!this.noCooldown) this.#setCooldown(i, skill, player);
				} else {
					player.energy -= drain;
					skill.update(dt, player, game);
				}
			// Duration: tick down and call update
			} else if (this.#activeTimers[i] > 0) {
				this.#activeTimers[i] -= dt;
				skill.update(dt, player, game);
				if (this.#activeTimers[i] <= 0) {
					this.#stopActive(i, player, game);
					if (!this.noCooldown) this.#setCooldown(i, skill, player);
				}
			}
		}

		// Energy regen
		player.energy = Math.min(player.maxEnergy, player.energy + player.energyRegen * dt);
	}

	#setCooldown(index, skill, player) {
		const cd = Math.max(0.5, skill.cooldown * (player.skillCooldownMult ?? 1));
		this.#cooldowns[index]         = cd;
		this.#cooldownDurations[index] = cd;
	}

	#stopActive(index, player, game) {
		const skill = this.#slots[index];
		if (skill) skill.deactivate(player, game);
		this.#activeTimers[index] = 0;
		this.#channeling[index]   = false;
	}

	get isTargeting() {
		for (let i = 0; i < MAX_SKILL_SLOTS; i++) {
			if (this.#channeling[i] && this.#slots[i]?.targeting) return true;
		}
		return false;
	}

	get slots()             { return [...this.#slots]; }
	cooldownOf(i)           { return this.#cooldowns[i] ?? 0; }
	isActive(i)             { return this.#activeTimers[i] > 0 || this.#channeling[i]; }
	isChanneling(i)         { return this.#channeling[i]; }
	activeTimeOf(i)         { return this.#activeTimers[i]; }
	cooldownFraction(i) {
		const dur = this.#cooldownDurations[i];
		if (!dur) return 0;
		return Math.min(1, this.#cooldowns[i] / dur);
	}
}
