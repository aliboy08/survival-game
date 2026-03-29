export class Mod {
	constructor({ name, description, type = 'generic' }) {
		this.name        = name;
		this.description = description;
		this.type        = type;
	}

	apply(weapon)  {}
	remove(weapon) {}
}
