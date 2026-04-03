export class Skill {
	constructor({ name, description, category, energyCost, cooldown, duration = 0, channeling = false, drainRate = 0, damage = 0 }) {
		this.name        = name;
		this.description = description;
		this.category    = category;   // 'damage' | 'buff'
		this.energyCost  = energyCost; // upfront cost on activation
		this.cooldown    = cooldown;   // seconds before it can be used again
		this.duration    = duration;   // seconds active (0 = instant)
		this.channeling  = channeling; // drains energy per second while toggled on
		this.drainRate   = drainRate;  // energy/s drained while channeling
		this.damage      = damage;
	}

	/** Called when the skill is activated. */
	activate(player, game) {}

	/** Called when duration expires or channeling is stopped. */
	deactivate(player, game) {}

	/** Called every frame while the skill is active (duration > 0 or channeling). */
	update(dt, player, game) {}
}
