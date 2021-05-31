import type { Socket } from "socket.io";
import {
  Engine,
  Events,
  Composite,
  World,
  Body,
  Runner
} from "matter-js";
import settings from "./settings";
import { socketio as io } from "./server";
import decomp from 'poly-decomp';
import Util from "./util";
import Level from "./level";
import Package from "./package";
import Player from "./player";
import Color from "./color";

// TODO: remove this global variable and use ES6 imports instead
(global.window as any) = {
  decomp
}
const extend = require("extend");


function serializePlayer(player: Player) {
  return {
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
  }
}
const handleConnect = function(socket: Socket) {
  const player = new Player(socket);
  player.id = game.id_cnt++;
  player.socket = socket;
  game.players[socket.id] = player;
  player.spawn();
  socket.emit("init", {
    player: serializePlayer(player),
    players: Object.values(game.players).map(p => serializePlayer(p)),
    level: game.getBodies()
  });
  log("user connected with ID " + player.id);

  socket.broadcast.emit("join", Object.values(game.players).map(p => serializePlayer(p)));

  socket.on("disconnect", function() {
    log("user disconnected with ID " + game.players[socket.id].id);
    const alive = game.players[socket.id].alive;
    game.players[socket.id].remove();
    delete game.players[socket.id];

    socket.broadcast.emit("leave", Object.values(game.players).map(p => serializePlayer(p)));

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
  socket.on("player-data", function(msg) {
    if (msg.name) game.players[socket.id].name = msg.name;
    if (typeof msg.color === "string") {
      game.players[socket.id].setColor(new Color(msg.color));
    }
    io.emit("player-data", {
      player: serializePlayer(game.players[socket.id]),
      body: Util.extractBodyProperties(game.players[socket.id].body)
    });
  });
  socket.on("controller-input", function(msg) {
    game.players[socket.id].handleController(msg);
  });

  socket.on("laserpath", function(msg) {
    game.players[socket.id].shootLaser(msg);
  });
};

io.on("connection", function(socket: Socket) {
  handleConnect(socket);
});

type Slice = any;
class Game {
  settings = settings;
  players: Record<string, Player> = {};
  packages: Record<string, Package> = {};
  playersAlive = 0;
  playersCount = 0;
  dynamicBodies: Record<string, Body> = {};
  io = io;
  engine = Engine.create({...this.settings.engine, ...this.settings.world});
  world = this.engine.world;

  id_cnt = 1;
  initialize = () => {
    //set up level
    new Level().generate();

    // create runner
    const runner = Runner.create();

    //run the engine
    Runner.run(runner, this.engine);

    //check for collisions
    Events.on(this.engine, "collisionStart", function(event) {
      let i,
        pair,
        length = event.pairs.length;

      const db: Record<string, unknown> = {};
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

    let old_fr = "";
    Events.on(
      this.engine,
      "afterUpdate",
      () => {
        //broadcast positions
        const frame = this.getFrame();
        const fr = JSON.stringify(frame);
        if (old_fr !== fr) {
          io.emit("frame", frame);
          old_fr = fr;

          if (process.stdout.clearLine !== undefined)
            process.stdout.clearLine(0);
          if (process.stdout.cursorTo !== undefined) process.stdout.cursorTo(0);

          process.stdout.write(
            "frame:    slices " +
              (Object.keys(this.dynamicBodies).length - this.discarded) +
              "/" +
              Object.keys(this.dynamicBodies).length +
              "    length " +
              fr.length +
              " "
          );
        }
      }
    );

    // const package = new Package();
    // package.spawn();
    const packageSpawnTimeout = setInterval(function() {
      const pkg = new Package();
      pkg.spawn();
    }, this.settings.package.spawnRate);
  };

  sessionTimeout = this.settings.sessionTimeout; // ms
  cancelNewSession?: () => void;
  requestNewSession() {
    if (this.cancelNewSession) this.cancelNewSession();
    const timeout = setTimeout(() => {
      this.newSession();
    }, this.sessionTimeout);
    this.cancelNewSession = () => {
      clearTimeout(timeout);
    };
  };
  old_frame: { [key: string]: Record<string, unknown> } = {};
  discarded = 0;
  
  getFrame() {
    const frame: Record<string, Slice> = {};
    this.discarded = 0;
    const sparseKeys = Object.keys(this.dynamicBodies);
    for (let i = 0; i < sparseKeys.length; i++) {
      const index = sparseKeys[i];
      const body = this.dynamicBodies[index];
      const res_pos = 100;
      const res_ang = 1000;
      // const res_vel = 100;

      const slice = [
        Math.round(body.position.x * res_pos) / res_pos,
        Math.round(body.position.y * res_pos) / res_pos,
        Math.round(body.angle * res_ang) / res_ang //,
        // Math.round(body.velocity.x * res_vel) / res_vel,
        // Math.round(body.velocity.y * res_vel) / res_vel
      ];
      if (
        this.old_frame[index] == undefined ||
        slice[0] != this.old_frame[index][0] ||
        slice[1] != this.old_frame[index][1] ||
        slice[2] != this.old_frame[index][2] // ||
        // slice[3] != old_frame[index][3] ||
        // slice[4] != old_frame[index][4]
      )
        frame[index] = slice;
      else this.discarded++;
    }
    extend(this.old_frame, frame, {});
    return frame;
  };

  getBodies() {
    const bodies = Composite.allBodies(this.world);
    const frame = [];

    for (let i = 0; i < bodies.length; i++) {
      frame.push(Util.extractBodyProperties(bodies[i]));
    }

    return frame;
  };

  newSession() {
    this.cancelNewSession = undefined;
    World.clear(this.world, false);
    this.playersAlive = 0;
    this.packages = {};
    new Level().generate();

    const sparseKeys = Object.keys(this.players);
    for (let i = 0; i < sparseKeys.length; i++) {
      const player = this.players[sparseKeys[i]];
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
        player: serializePlayer(player),
        players: Object.values(game.players).map(p => serializePlayer(p)),
        level: this.getBodies()
      });
    }
  };

  addBody(bodies: Body[]) {
    if (!Array.isArray(bodies)) bodies = [bodies];
    const emitBodies = [];
    for (let i = 0; i < bodies.length; i++) {
      emitBodies.push(Util.extractBodyProperties(bodies[i]));
      this.dynamicBodies[bodies[i].id] = bodies[i];
    }
    io.emit("spawn", emitBodies);
    World.add(this.world, bodies);
  };
  removeBody(body: Body) {
    io.emit("remove", {
      id: body.id
    });
    delete this.dynamicBodies[body.id];
    World.remove(this.world, body);
  };

  getRandomPosition(clip = 2): {x:number,y:number} {
    let x: number, y: number;
    const r = Math.random();
    const w = 1920;
    const h = 1080;
    const goffs = {
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

  getCell(pos: {x: number, y: number}) {
    const clip = 2;
    const w = 1920;
    const h = 1080;
    const goffs = {
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
    const cs = game.settings.level.appearance.cellsize;
    const x = Math.abs(Math.round((pos.x - goffs.x) / cs - 0.5));
    const y = Math.abs(Math.round((pos.y - goffs.y) / cs - 0.5));
    return { x, y };
  };
}

export let game = new Game();
(global as any).game = game;
game.initialize();

const log = function(str: string) {
  if (process.stdout.clearLine !== undefined) process.stdout.clearLine(0);
  if (process.stdout.cursorTo !== undefined) process.stdout.cursorTo(0);

  process.stdout.write(str + "\n");
}.bind(this);