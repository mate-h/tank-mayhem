//DEPENDENCIES
var io = require("./server").socketio;
var Matter = require("matter-js");
var extend = require("extend");
var settings = require("./settings");
var Package = require("./package");
var Player = require("./player");
var Level = require("./level");
var { extractBodyProperties } = require("./util");

global.window = {
  decomp: require("poly-decomp")
};

var handleConnect = function(socket) {
  var player = new Player();
  player.id = game.id_cnt++;
  player.socket_id = socket.id;
  player.socket = socket;
  game.players[socket.id] = player;
  player.spawn();
  io.to(socket.id).emit("init", {
    player: {
      id: player.id,
      socket_id: socket.id,
      body_id: player.body.id,
      color: player.color,
      name: player.name,
      position: {
        x: player.body.position.x,
        y: player.body.position.y
      },
      angle: player.body.angle,
      score: 0
    },
    level: game.getBodies()
  });
  log("user connected with ID " + player.id);

  socket.on("disconnect", function() {
    log("user disconnected with ID " + game.players[socket.id].id);
    var alive = game.players[socket.id].alive;
    game.players[socket.id].remove();
    delete game.players[socket.id];

    game.playersCount--;
    if (alive) game.playersAlive--;
  });
  socket.on("key down", function(msg) {
    game.players[socket.id].handleInput(true, parseInt(msg));
  });
  socket.on("key up", function(msg) {
    game.players[socket.id].handleInput(false, parseInt(msg));
  });
  socket.on("touch move", function(msg) {
    game.players[socket.id].handleTouch(parseFloat(msg), true);
  });
  socket.on("touch end", function(msg) {
    game.players[socket.id].handleTouch(parseFloat(msg), false);
  });
  socket.on("touch shoot", function(msg) {
    game.players[socket.id].handleTouch(parseFloat(msg), false);
    game.players[socket.id].shoot();
  });

  socket.on("laserpath", function(msg) {
    game.players[socket.id].shootLaser(msg);
  });
};

io.on("connection", function(socket) {
  handleConnect(socket);
});

function Game() {
  //Matter.js module aliases
  var Engine = Matter.Engine,
    Events = Matter.Events,
    Composite = Matter.Composite,
    World = Matter.World,
    Bodies = Matter.Bodies;

  this.settings = settings;
  this.players = {};
  this.packages = {};
  this.playersAlive = 0;
  this.playersCount = 0;
  this.dynamicBodies = {};
  this.io = io;

  this.id_cnt = 1;
  this.initialize = function() {
    //create an engine
    this.engine = Engine.create(this.settings.engine);
    this.engine.world = World.create(this.settings.world);
    this.world = this.engine.world;

    //set up level
    new Level().generate();

    //run the engine
    Engine.run(this.engine);

    //check for collisions
    Events.on(this.engine, "collisionStart", function(event) {
      var i,
        pair,
        length = event.pairs.length;

      var db = {};
      for (i = 0; i < length; i++) {
        pair = event.pairs[i];
        Events.trigger(pair.bodyA.parent, "collision", {
          with: pair.bodyB,
          pair: pair,
          new_collision: !db[pair.bodyB.label]
        });
        Events.trigger(pair.bodyB.parent, "collision", {
          with: pair.bodyA,
          pair: pair,
          new_collision: !db[pair.bodyA.label]
        });

        if (db[pair.bodyA.label] == undefined) db[pair.bodyA.label] = true;
        if (db[pair.bodyB.label] == undefined) db[pair.bodyB.label] = true;
      }
    });

    var old_fr = "";
    Events.on(
      this.engine,
      "afterUpdate",
      function() {
        //broadcast positions
        var frame = this.getFrame();
        var fr = JSON.stringify(frame);
        if (old_fr !== fr) {
          io.emit("frame", frame);
          old_fr = fr;

          if (process.stdout.clearLine !== undefined)
            process.stdout.clearLine();
          if (process.stdout.cursorTo !== undefined) process.stdout.cursorTo(0);

          process.stdout.write(
            "frame:    slices " +
              (Object.keys(this.dynamicBodies).length - discarded) +
              "/" +
              Object.keys(this.dynamicBodies).length +
              "    length " +
              fr.length +
              " "
          );
        }
      }.bind(this)
    );

    // var package = new Package();
    // package.spawn();
    var packageSpawnTimeout = setInterval(function() {
      var package = new Package();
      package.spawn();
    }, this.settings.package.spawnRate);
  };

  this.sessionTimeout = this.settings.sessionTimeout; // ms
  this.requestNewSession = function() {
    if (this.cancelNewSession) this.cancelNewSession();
    const timeout = setTimeout(() => {
      this.newSession();
    }, this.sessionTimeout);
    this.cancelNewSession = function() {
      clearTimeout(timeout);
    };
  };
  var old_frame = {};
  var discarded = 0;
  this.getFrame = function() {
    var frame = {};
    discarded = 0;
    var sparseKeys = Object.keys(this.dynamicBodies);
    for (var i = 0; i < sparseKeys.length; i++) {
      var index = sparseKeys[i];
      var body = this.dynamicBodies[index];
      var res_pos = 100;
      var res_ang = 1000;
      // var res_vel = 100;

      var slice = [
        Math.round(body.position.x * res_pos) / res_pos,
        Math.round(body.position.y * res_pos) / res_pos,
        Math.round(body.angle * res_ang) / res_ang //,
        // Math.round(body.velocity.x * res_vel) / res_vel,
        // Math.round(body.velocity.y * res_vel) / res_vel
      ];
      if (
        old_frame[index] == undefined ||
        slice[0] != old_frame[index][0] ||
        slice[1] != old_frame[index][1] ||
        slice[2] != old_frame[index][2] // ||
        // slice[3] != old_frame[index][3] ||
        // slice[4] != old_frame[index][4]
      )
        frame[index] = slice;
      else discarded++;
    }
    extend(old_frame, frame, {});
    return frame;
  };

  this.getBodies = function() {
    var bodies = Composite.allBodies(this.world);
    var frame = [];

    for (var i = 0; i < bodies.length; i++) {
      frame.push(extractBodyProperties(bodies[i]));
    }

    return frame;
  };

  this.newSession = function() {
    this.cancelNewSession = null;
    World.clear(this.world);
    this.playersAlive = 0;
    this.packages = [];
    new Level().generate();

    var sparseKeys = Object.keys(this.players);
    for (var i = 0; i < sparseKeys.length; i++) {
      var player = this.players[sparseKeys[i]];
      if (player === undefined) {
        delete this.players[sparseKeys[i]];
        continue;
      }
      if (player.alive) {
        player.score++;
      }
      player.alive = false;
      player.spawn();
      player.socket.emit("new session", {
        player: {
          id: player.id,
          socket_id: player.socket_id,
          body_id: player.body.id,
          color: player.color,
          name: player.name,
          position: {
            x: player.body.position.x,
            y: player.body.position.y
          },
          angle: player.body.angle,
          score: player.score
        },
        level: this.getBodies()
      });
    }
  };

  this.addBody = function(bodies) {
    if (!Array.isArray(bodies)) bodies = [bodies];
    var emitBodies = [];
    for (var i = 0; i < bodies.length; i++) {
      emitBodies.push(extractBodyProperties(bodies[i]));
      this.dynamicBodies[bodies[i].id] = bodies[i];
    }
    io.emit("spawn", emitBodies);
    World.add(this.world, bodies);
  };
  this.removeBody = function(body) {
    io.emit("remove", {
      id: body.id
    });
    delete this.dynamicBodies[body.id];
    World.remove(this.world, body);
  };

  this.getRandomPosition = function(clip = 2) {
    var x, y;
    var r = Math.random();
    var w = 1920;
    var h = 1080;
    var goffs = {
      x:
        w / 2 -
        (game.settings.level.appearance.cellsize *
          game.settings.level.appearance.mazesize) /
          2,
      y:
        h / 2 -
        (game.settings.level.appearance.cellsize *
          game.settings.level.appearance.mazesize) /
          2
    };
    x =
      goffs.x +
      (clip +
        Math.floor(
          Math.random() * (game.settings.level.appearance.mazesize - 2 * clip)
        ) +
        0.5) *
        game.settings.level.appearance.cellsize;
    y =
      goffs.y +
      (clip +
        Math.floor(
          Math.random() * (game.settings.level.appearance.mazesize - 2 * clip)
        ) +
        0.5) *
        game.settings.level.appearance.cellsize;

    return { x, y };
  };

  this.getCell = function(pos) {
    var clip = 2;
    var w = 1920;
    var h = 1080;
    var goffs = {
      x:
        w / 2 -
        (game.settings.level.appearance.cellsize *
          game.settings.level.appearance.mazesize) /
          2,
      y:
        h / 2 -
        (game.settings.level.appearance.cellsize *
          game.settings.level.appearance.mazesize) /
          2
    };
    var cs = game.settings.level.appearance.cellsize;
    var x = Math.abs(Math.round((pos.x - goffs.x) / cs - 0.5));
    var y = Math.abs(Math.round((pos.y - goffs.y) / cs - 0.5));
    return { x, y };
  };
}

var game = new Game();
global.game = game;
game.initialize();

module.exports.Game = Game;

var log = function(str) {
  if (process.stdout.clearLine !== undefined) process.stdout.clearLine();
  if (process.stdout.cursorTo !== undefined) process.stdout.cursorTo(0);

  process.stdout.write(str + "\n");
}.bind(this);
