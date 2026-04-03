import { Rifle } from './guns/Rifle.js';
import { Sniper } from './guns/Sniper.js';
import { Pistol } from './guns/Pistol.js';
import { Revolver } from './guns/Revolver.js';
import { HomingGun } from './guns/HomingGun.js';
import { Sword } from './melee/Sword.js';
import { Greatsword } from './melee/Greatsword.js';

const weapons = {
	primary: [Rifle, Sniper],
	secondary: [Pistol, Revolver, HomingGun],
	melee: [Sword, Greatsword],
};

export class Weapons_Manager {
	constructor() {
		this.weapons = weapons;
	}
}
