export const MAX_MOD_SLOTS = 6;

export class ModSlots {
	#slots;
	#weapon;

	constructor(weapon) {
		this.#weapon = weapon;
		this.#slots  = new Array(MAX_MOD_SLOTS).fill(null);
	}

	/** Equip a mod into a slot index (0–5). Replaces any existing mod. */
	equip(mod, index) {
		if (index < 0 || index >= MAX_MOD_SLOTS) return false;
		if (this.#slots[index]) this.#slots[index].remove(this.#weapon);
		this.#slots[index] = mod;
		mod.apply(this.#weapon);
		return true;
	}

	/** Remove the mod at a slot index. Returns the removed mod or null. */
	unequip(index) {
		if (index < 0 || index >= MAX_MOD_SLOTS) return null;
		const mod = this.#slots[index];
		if (mod) {
			mod.remove(this.#weapon);
			this.#slots[index] = null;
		}
		return mod;
	}

	/** Equip into the first empty slot. Returns the index used, or -1 if full. */
	equipNext(mod) {
		const index = this.#slots.findIndex(s => s === null);
		if (index === -1) return -1;
		this.equip(mod, index);
		return index;
	}

	get slots()  { return [...this.#slots]; }
	get count()  { return this.#slots.filter(Boolean).length; }
	get isFull() { return this.count >= MAX_MOD_SLOTS; }
}
