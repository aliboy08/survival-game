import { Game } from './core/Game.js';
import { Input } from './core/Input.js';
import { Player } from './player/player.js';
import { ShootSystem } from './player/ShootSystem.js';
import { WeaponSelector } from './core/WeaponSelector.js';
import { VirtualJoystick } from './ui/VirtualJoystick.js';
import { AttackButton } from './ui/AttackButton.js';
import { AutoShootButton } from './ui/AutoShootButton.js';
import { EnemySpawner } from './enemy/EnemySpawner.js';
import { PlayerHUD } from './ui/PlayerHUD.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { TargetIndicator } from './ui/TargetIndicator.js';
import { DebugPanel } from './ui/DebugPanel.js';
import { PlayerModSelectUI } from './ui/PlayerModSelectUI.js';
import { WeaponSwitchButton } from './ui/WeaponSwitchButton.js';
import { ReloadButton } from './ui/ReloadButton.js';
import { EquipmentSelectUI } from './ui/EquipmentSelectUI.js';
import { Weapons_Manager } from './weapon/weapons_manager.js';
import { SkillSystem } from './skills/SkillSystem.js';
import { SkillHUD } from './ui/SkillHUD.js';
import { SkillSelectUI } from './ui/SkillSelectUI.js';

const game = new Game('gameCanvas');
const input = new Input(game.canvas);
const gameOver = new GameOverScreen();

const player = new Player(game.canvas.width / 2, game.canvas.height / 2, input);
const selector = new WeaponSelector();
const shootSystem = new ShootSystem(game, player, input, selector);
const joystick = new VirtualJoystick(game.canvas, input);

player.on('dead', () => {
	game.stop();
	gameOver.show();
});

await game.add(player);
await game.add(shootSystem);
await game.add(joystick);
await game.add(new EnemySpawner(game, player, false));
await game.add(new PlayerHUD(player));
const targetIndicator = new TargetIndicator(game, player);
await game.add(targetIndicator);
shootSystem.targetIndicator = targetIndicator;

const weapons_manager = new Weapons_Manager();
const skillSystem     = new SkillSystem(game, player);
await game.add(skillSystem);

const skillSelectUI = new SkillSelectUI();
new SkillHUD(player, skillSystem, skillSelectUI);

new AttackButton(input, shootSystem);
new ReloadButton(shootSystem);
new WeaponSwitchButton(player, shootSystem);
new AutoShootButton(shootSystem);
new EquipmentSelectUI(player, weapons_manager);
new PlayerModSelectUI(player);
new DebugPanel(game, player);

game.start();
