const { Game } = require("../src/server");

module.exports = function start() {
  var game = new Game();
  global.game = game;
  game.initialize();
};
