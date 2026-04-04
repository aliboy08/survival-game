const BASE_SPEED = 150; // pixels per second
const ARRIVE_THRESHOLD = 4; // pixels — close enough to target

const ANGLE_TO_DIRECTION = [
	'east',
	'south-east',
	'south',
	'south-west',
	'west',
	'north-west',
	'north',
	'north-east',
];

export function vectorToDirection(x, y) {
	const angle = Math.atan2(y, x);
	const index = Math.round(angle / (Math.PI / 4) + 8) % 8;
	return ANGLE_TO_DIRECTION[index];
}

export class Movement {
	#moveTarget = null;

	// Returns { direction } after applying movement to player position
	update(player, input, dt) {
		// const tap = input.consumeTapTarget();
		// if (tap) this.#moveTarget = tap;

		const { x, y } = input.movement;
		const hasDirectInput = x !== 0 || y !== 0;

		const speed = BASE_SPEED * (player.speedMultiplier ?? 1.0);

		if (hasDirectInput) {
			this.#moveTarget = null;
			const len = Math.hypot(x, y);
			player.x += (x / len) * speed * dt;
			player.y += (y / len) * speed * dt;
			return vectorToDirection(x, y);
		}

		if (this.#moveTarget) {
			const dx = this.#moveTarget.x - player.x;
			const dy = this.#moveTarget.y - player.y;
			const dist = Math.hypot(dx, dy);

			if (dist <= ARRIVE_THRESHOLD) {
				this.#moveTarget = null;
			} else {
				player.x += (dx / dist) * speed * dt;
				player.y += (dy / dist) * speed * dt;
				return vectorToDirection(dx, dy);
			}
		}

		return null; // no movement
	}
}
