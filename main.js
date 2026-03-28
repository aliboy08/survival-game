import { Game } from './core/Game.js';
import { Input } from './core/Input.js';
import { Player } from './player/player.js';
import { ShootSystem } from './player/ShootSystem.js';
import { WeaponSelector } from './core/WeaponSelector.js';
import { VirtualJoystick } from './ui/VirtualJoystick.js';
import { ShootButton } from './ui/ShootButton.js';
import { AutoShootButton } from './ui/AutoShootButton.js';
import { WeaponSelectUI } from './ui/WeaponSelectUI.js';
import { EnemySpawner } from './enemy/EnemySpawner.js';
import { PlayerHUD } from './ui/PlayerHUD.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { TargetIndicator } from './ui/TargetIndicator.js';
import { DebugPanel } from './ui/DebugPanel.js';

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
await game.add(new TargetIndicator(game, player));

new ShootButton(input);
new AutoShootButton(shootSystem);
new WeaponSelectUI(selector);
new DebugPanel(game, player);

game.start();
