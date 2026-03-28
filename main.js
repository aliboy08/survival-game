import { Game }            from './core/Game.js';
import { Input }           from './core/Input.js';
import { Player }          from './player/player.js';
import { VirtualJoystick } from './ui/VirtualJoystick.js';
import { DebugPanel }      from './ui/DebugPanel.js';

const game  = new Game('gameCanvas');
const input = new Input(game.canvas);

const player   = new Player(game.canvas.width / 2, game.canvas.height / 2, input);
const joystick = new VirtualJoystick(game.canvas, input);

await game.add(player);
await game.add(joystick);

new DebugPanel(game);

game.start();
