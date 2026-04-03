export const MAX_PLAYER_MOD_SLOTS = 6;

export class PlayerModSlots {
	#slots;
	#player;

	constructor(player) {
		this.#player = player;
		this.#slots  = new Array(MAX_PLAYER_MOD_SLOTS).fill(null);
	}

	equip(mod, index) {
		if (index < 0 || index >= MAX_PLAYER_MOD_SLOTS) return false;
		if (this.#slots[index]) this.#slots[index].remove(this.#player);
		this.#slots[index] = mod;
		mod.apply(this.#player);
		return true;
	}

	unequip(index) {
		if (index < 0 || index >= MAX_PLAYER_MOD_SLOTS) return null;
		const mod = this.#slots[index];
		if (mod) {
			mod.remove(this.#player);
			this.#slots[index] = null;
		}
		return mod;
	}

	equipNext(mod) {
		const index = this.#slots.findIndex(s => s === null);
		if (index === -1) return -1;
		this.equip(mod, index);
		return index;
	}

	get slots()  { return [...this.#slots]; }
	get count()  { return this.#slots.filter(Boolean).length; }
	get isFull() { return this.count >= MAX_PLAYER_MOD_SLOTS; }
}
