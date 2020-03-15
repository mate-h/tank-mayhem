const Matter = require("matter-js");

function Package() {
  const game = global.game;
  this.settings = game.settings.package;
  this.used = false;

  this.id = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);

  this.selectPower = function() {
    // TODO: pick randomly with bias
    const powers = Object.entries(this.settings.powers);
    this.power = powers[Math.floor(Math.random() * powers.length)][1];
    // this.power = this.settings.powers.laser;
  };
  this.spawn = function() {
    this.selectPower();
    var ms = game.settings.level.appearance.mazesize;
    var maxPackages = ms * ms - Object.keys(game.players).length;
    if (Object.keys(game.packages).length >= maxPackages) {
      console.log("max packages reached");
      return;
    }
    function isValidPosition(pos) {
      if (!pos) return false;

      var cellPos = game.getCell(pos);
      var cellOccupied = false;
      Object.entries(game.players).forEach(([socket_id, player]) => {
        var playerPos = player.body.position;
        var playerCellPos = game.getCell(playerPos);
        if (playerCellPos.x === cellPos.x && playerCellPos.y === cellPos.y) {
          cellOccupied = true;
        }
      });
      Object.entries(game.packages).forEach(([id, package]) => {
        var packageCellPos = game.getCell(package.body.position);
        if (packageCellPos.x === cellPos.x && packageCellPos.y === cellPos.y) {
          cellOccupied = true;
        }
      });
      return !cellOccupied;
    }
    var pos;
    while (!isValidPosition(pos)) {
      pos = game.getRandomPosition(0);
    }
    this.body = Matter.Bodies.rectangle(
      pos.x,
      pos.y,
      this.settings.appearance.size,
      this.settings.appearance.size,
      {
        ...this.settings.physics,
        label: `Package ${this.id} ${this.power.name}`,
        render: {
          fillStyle: this.settings.appearance.color
        }
      }
    );

    game.addBody(this.body);

    Matter.Events.on(
      this.body,
      "collision",
      function(e) {
        this.collision(e);
      }.bind(this)
    );

    game.packages[this.id] = this;
  };
  this.collision = function(e) {
    // update player status
    const id1 = e.with.label.split(" ")[1];
    if (collidedWith("Player") && !this.used) {
      const player = game.players[id1];
      player.power(this.power);
      this.used = true;
      this.destroy();
    }
    function collidedWith(label) {
      return e.with.label.split(" ")[0] == label;
    }
    // this.destroy();
  };
  this.destroy = function() {
    game.removeBody(this.body);
    delete game.packages[this.id];
  };
}

module.exports = Package;
