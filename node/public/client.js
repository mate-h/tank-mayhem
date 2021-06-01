import { Game } from './app.js';
import { render as JoinModal } from './lib/joinmodal.js';
import { render as Nametag } from './lib/nametag.js';
import { gamepad } from './lib/controllers.js';

document.body.innerHTML += Nametag({ label: 'default'});
document.body.innerHTML += JoinModal();
gamepad();
const game = new Game();