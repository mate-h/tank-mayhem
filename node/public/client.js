import { Game } from './app.js';
import { render as JoinModal } from './lib/joinmodal.js';
import { render as Nametag } from './lib/nametag.js';

document.body.innerHTML += JoinModal();
document.body.innerHTML += Nametag({ label: 'default'});
const game = new Game();