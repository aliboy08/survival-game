const DEFAULTS = {
	moveUp:       'KeyW',
	moveDown:     'KeyS',
	moveLeft:     'KeyA',
	moveRight:    'KeyD',
	shoot:        'Space',
	skill1:       'Digit1',
	skill2:       'Digit2',
	skill3:       'Digit3',
	skill4:       'Digit4',
	reload:       'KeyR',
	switchWeapon: 'Tab',
};

const STORAGE_KEY = 'sg_bindings';

function load() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
		return { ...DEFAULTS, ...saved };
	} catch {
		return { ...DEFAULTS };
	}
}

function codeToLabel(code) {
	if (code.startsWith('Key'))   return code.slice(3);
	if (code.startsWith('Digit')) return code.slice(5);
	const NAMED = {
		Space:       'Space',
		Tab:         'Tab',
		ArrowUp:     '↑',
		ArrowDown:   '↓',
		ArrowLeft:   '←',
		ArrowRight:  '→',
		ShiftLeft:   'L‑Shift',
		ShiftRight:  'R‑Shift',
		ControlLeft: 'L‑Ctrl',
		ControlRight:'R‑Ctrl',
		AltLeft:     'L‑Alt',
		AltRight:    'R‑Alt',
		Enter:       'Enter',
		Backspace:   'Backspace',
	};
	return NAMED[code] ?? code;
}

export const Bindings = {
	_map: load(),

	get(action)       { return this._map[action]; },
	label(action)     { return codeToLabel(this._map[action]); },
	codeToLabel,

	set(action, code) {
		this._map[action] = code;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this._map));
	},

	reset() {
		this._map = { ...DEFAULTS };
		localStorage.removeItem(STORAGE_KEY);
	},

	defaults: DEFAULTS,
};
