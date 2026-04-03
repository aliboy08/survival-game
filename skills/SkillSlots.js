export const MAX_SKILL_SLOTS = 4;

export class SkillSlots {
	#slots;
	#cooldowns;
	#activeTimers;
	#channeling;

	noCooldown = false;

	constructor() {
		this.#slots        = new Array(MAX_SKILL_SLOTS).fill(null);
		this.#cooldowns    = new Array(MAX_SKILL_SLOTS).fill(0);
		this.#activeTimers = new Array(MAX_SKILL_SLOTS).fill(0);
		this.#channeling   = new Array(MAX_SKILL_SLOTS).fill(false);
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
			if (!this.noCooldown) this.#cooldowns[index] = skill.cooldown;
			return true;
		}

		if (player.energy < skill.energyCost) return false;
		player.energy -= skill.energyCost;

		skill.activate(player, game);

		if (skill.channeling) {
			this.#channeling[index]   = true;
			this.#activeTimers[index] = -1; // indefinite until toggled or energy runs out
		} else if (skill.duration > 0) {
			this.#activeTimers[index] = skill.duration;
		} else {
			// instant — cooldown starts immediately
			if (!this.noCooldown) this.#cooldowns[index] = skill.cooldown;
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
				const drain = skill.drainRate * dt;
				if (player.energy < drain) {
					this.#stopActive(i, player, game);
					if (!this.noCooldown) this.#cooldowns[i] = skill.cooldown;
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
					if (!this.noCooldown) this.#cooldowns[i] = skill.cooldown;
				}
			}
		}

		// Energy regen
		player.energy = Math.min(player.maxEnergy, player.energy + player.energyRegen * dt);
	}

	#stopActive(index, player, game) {
		const skill = this.#slots[index];
		if (skill) skill.deactivate(player, game);
		this.#activeTimers[index] = 0;
		this.#channeling[index]   = false;
	}

	get slots()             { return [...this.#slots]; }
	cooldownOf(i)           { return this.#cooldowns[i] ?? 0; }
	isActive(i)             { return this.#activeTimers[i] > 0 || this.#channeling[i]; }
	isChanneling(i)         { return this.#channeling[i]; }
	activeTimeOf(i)         { return this.#activeTimers[i]; }
	cooldownFraction(i)     {
		const skill = this.#slots[i];
		if (!skill || skill.cooldown === 0) return 0;
		return Math.min(1, this.#cooldowns[i] / skill.cooldown);
	}
}
