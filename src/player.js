const {
  Bodies,
  Body,
  Vector,
  Events,
  Constraint,
  World,
  Query
} = require("matter-js");
const Color = require("./color");
const Bullet = require("./bullet");
const Util = require("./util");
const { extractBodyProperties } = require("./util");

function Player() {
  const game = global.game;

  this.id = -1;
  this.color = new Color(Util.getRandomColor());
  this.settings = game.settings.player;
  this.bullet_count = 0;
  this.bullets = [];
  this.streaks = [];
  this.score = 0;
  this.alive = false;
  this.deaths = 0;
  this.kills = 0;
  this.activePowers = {};

  game.playersCount++;

  var shoot_released = true;
  this.spawn = function(params) {
    if (this.alive) return;

    // reset active powers at spawn
    this.activePowers = {};
    this.alive = true;
    game.playersAlive++;

    var x, y;
    if (params == undefined) {
      var pos = game.getRandomPosition();
      x = pos.x;
      y = pos.y;
    } else {
      x = params[0];
      y = params[1];
    }

    //set up keyboard controls
    var app = this.settings.appearance;
    var phy = this.settings.physics;
    app.render = {};
    app.render.fillStyle = this.color.toString();
    var extra = {
      parts: [
        //main body
        Bodies.rectangle(x, y, app.baseWidth, app.baseHeight, {
          render: { fillStyle: this.color.toString() },
          label: "Player " + this.socket_id
        }),
        //center circle
        Bodies.circle(x, y, app.baseRadius, {
          render: { fillStyle: this.color.darker(app.darkenColor).toString() }
        }),
        //shooter
        Bodies.rectangle(
          x,
          y - app.shooterLength + 10,
          app.shooterWidth,
          app.shooterLength,
          {
            render: {
              fillStyle: this.color.darker(app.darkenColor).toString()
            },
            label: "Player " + this.socket_id,
            density: 0
          }
        )
      ],
      label: "Player " + this.socket_id
    };

    this.body = Body.create(Util.merge([app, phy, extra]));
    game.addBody(this.body);

    // temporary
    // setTimeout(() => this.power(game.settings.package.powers.laser), 100);
  };

  Events.on(
    game.engine,
    "beforeUpdate",
    function() {
      this.update();
    }.bind(this)
  );

  this.handleInput = function(down, command) {
    switch (command) {
      case 0:
        this.forwardControl = down;
        break;
      case 1:
        this.backwardControl = down;
        break;
      case 2:
        this.leftTurnControl = down;
        break;
      case 3:
        this.rightTurnControl = down;
        break;
      case 4:
        if (down) this.shoot();
        break;
      case 5:
        game.newSession();
        break;
    }
  };
  this.handleTouch = function(angle, move) {
    this.leftTurnControl = false;
    this.rightTurnControl = false;

    this.forwardControl = move;

    Body.setAngle(this.body, angle);
  };
  this.forwardControl = false;
  this.backwardControl = false;
  this.leftTurnControl = false;
  this.rightTurnControl = false;

  this.shoot = function() {
    if (!this.alive) return;

    if (this.activePowers.laser) {
      game.io.sockets.emit("laser", {
        shotAt: new Date().getTime(),
        body: extractBodyProperties(this.body)
      });
      return;
    }

    let max = game.settings.bullet.maximum;
    let check = this.bullets.length < max;
    if (this.activePowers.bouncy) {
      max = this.activePowers.bouncy.limit;
      check = this.bullets.filter(b => b.type === "bouncy").length < max;
    }
    if (check) {
      this.bullet_count++;
      var bullet = new Bullet();
      bullet.player = this;
      this.bullets.push(bullet);
      var len =
        this.settings.appearance.baseHeight / 2 +
        this.settings.appearance.shooterLength / 2;
      bullet.spawn(
        {
          x:
            this.body.position.x +
            Math.cos(this.body.angle - Math.PI / 2) * len,
          y:
            this.body.position.y + Math.sin(this.body.angle - Math.PI / 2) * len
        },
        this.body.angle
      );
      Body.applyForce(this.body, this.body.position, {
        x:
          -Math.cos(this.body.angle - Math.PI / 2) *
          this.settings.speed.forward,
        y:
          -Math.sin(this.body.angle - Math.PI / 2) * this.settings.speed.forward
      });
      setTimeout(
        function() {
          this.bullet_count--;
          game.removeBody(this.bullets[0].body);
          this.bullets.splice(0, 1);
        }.bind(this),
        game.settings.bullet.disappear
      );
    }
  };
  this.shootLaser = function(streak) {
    // console.log(pathPoints);
    const speed = this.activePowers.laser.speed;
    const streakLength = this.activePowers.laser.streakLength;
    const idx = this.streaks.length;
    this.streaks.push({ ...streak, speed, streakLength });
    setTimeout(() => {
      delete this.streaks[idx];
    }, streak.length * speed);
  };
  this.updateLaser = function({
    pathPoints,
    length,
    firedAt,
    speed,
    streakLength
  }) {
    const players = Object.values(game.players);
    const playerBodies = players.map(p => p.body);
    let currentDistance = (new Date().getTime() - firedAt) * speed;
    // console.log(currentDistance);
    let accDistance = 0;
    pathPoints.forEach((p, i) => {
      const next = pathPoints[i + 1];
      if (next) {
        const delta = Vector.magnitude(Vector.sub(next, p));
        const prevDistance = accDistance;
        accDistance += delta;
        if (accDistance > currentDistance - streakLength) {
          const calcCurrentProgress = offs =>
            (Math.min(
              Math.max(currentDistance + offs, prevDistance),
              accDistance
            ) -
              prevDistance) /
            delta;
          const getPointAlongPath = t =>
            Vector.add(p, Vector.mult(Vector.sub(next, p), t));

          const A = getPointAlongPath(calcCurrentProgress(-streakLength / 2));
          const B = getPointAlongPath(calcCurrentProgress(streakLength / 2));
          const collisions = Query.ray(playerBodies, A, B);

          if (collisions.length) {
            collisions.forEach(c => {
              if (c.collided && c.body.label.includes("Player")) {
                if (c.body.id === this.body.id) {
                  if (currentDistance > streakLength + 10) this.die();
                } else this.kill(players.find(p => p.body.id === c.body.id));
              }
            });
          }
        }
      }
    });
  };
  this.update = function() {
    if (!this.alive) return;

    //check to update velocities
    let turn = this.settings.speed.turn;
    let fw = this.settings.speed.forward;
    const ap = this.activePowers;
    // speed or slow based on which one was activated last
    let attr;
    if (ap.speed && ap.slow) {
      attr = ap.speed.activatedAt > ap.slow.activatedAt ? ap.speed : ap.slow;
    } else if (ap.speed) attr = ap.speed;
    else if (ap.slow) attr = ap.slow;
    if (attr) {
      fw = fw * attr.multiplier;
      turn = turn * attr.turnMultiplier;
    }

    if (this.leftTurnControl) {
      Body.rotate(this.body, -turn);
    } else if (this.rightTurnControl) {
      Body.rotate(this.body, turn);
    }

    if (this.forwardControl) {
      Body.applyForce(this.body, this.body.position, {
        x: Math.cos(this.body.angle - Math.PI / 2) * fw,
        y: Math.sin(this.body.angle - Math.PI / 2) * fw
      });
    }
    if (this.backwardControl) {
      Body.applyForce(this.body, this.body.position, {
        x: -Math.cos(this.body.angle - Math.PI / 2) * fw,
        y: -Math.sin(this.body.angle - Math.PI / 2) * fw
      });
    }

    if (this.streaks.length) {
      this.streaks.forEach(s => {
        this.updateLaser(s);
      });
    }
  };
  this.remove = function() {
    game.removeBody(this.body);
    Object.values(this.activePowers).forEach(p => clearTimeout(p.cancel));
    if (this.activePowers.shield) {
      game.removeBody(this.activePowers.shield.body);
      World.remove(game.world, this.activePowers.shield.constraint);
      Body.set(this.body, {
        collisionFilter: {
          category: 32
          // mask: 1 | 4 | 8 | 16 | 32 | 64
        }
      });
    }
  };
  this.die = function() {
    if (!this.alive) return;
    //TODO: particle effects
    // remove player and shield body
    this.remove();
    game.playersAlive--;
    // reset active powers
    this.activePowers = {};
    this.alive = false;
    this.deaths++;

    //shatter effect
    var shards = [];
    var shardCountTarget = 30;
    var r =
      this.settings.appearance.baseWidth / this.settings.appearance.baseHeight;
    var a = Math.sqrt(shardCountTarget * r);
    var b = Math.sqrt(shardCountTarget / r);
    a = Math.floor(a);
    b = Math.floor(b);
    var sw = this.settings.appearance.baseWidth / a;
    var sh = this.settings.appearance.baseHeight / b;
    var shardCount = a * b;
    var spread = Math.min(sw, sh) / 1.5;
    var points = [[]];
    for (var y = 0; y < b + 1; y++) {
      for (var x = 0; x < a + 1; x++) {
        var pt = { x: x * sw, y: y * sh };
        var rdir = {
          x: spread * (Math.random() * 2 - 1),
          y: spread * (Math.random() * 2 - 1)
        };
        if ((y == 0 || y == b) && x != 0 && x != a) pt.x += rdir.x;
        else if ((x == 0 || x == a) && y != 0 && y != b) pt.y += rdir.y;
        else if (x > 0 && x < a && y > 0 && y < b) {
          pt.x += rdir.x;
          pt.y += rdir.y;
        }
        if (points[x] == undefined) points[x] = [];
        points[x][y] = pt;
      }
    }
    var app = this.settings.appearance;
    var phy = this.settings.physics.shards;
    app.render = {};

    var offs = {
      x: this.body.position.x - this.settings.appearance.baseWidth / 2,
      y: this.body.position.y - this.settings.appearance.baseHeight / 2
    };
    var threshold_l =
      (0.5 *
        (this.settings.appearance.baseWidth *
          this.settings.appearance.baseHeight)) /
      shardCount;
    //var threshold_u = 2 * (this.settings.appearance.baseWidth * this.settings.appearance.baseHeight) / shardCount;
    for (y = 0; y < b; y++) {
      for (x = 0; x < a; x++) {
        var newpos = Vector.rotateAbout(
          {
            x: offs.x + (x + 0.5) * sw,
            y: offs.y + (y + 0.5) * sh
          },
          this.body.angle,
          this.body.position
        );
        this.color.a = Util.getRandom(0.54, 1);
        app.render.fillStyle = this.color.toString();
        app.label = "Shard";
        var shard = Bodies.fromVertices(
          newpos.x,
          newpos.y,
          [
            points[x][y],
            points[x + 1][y],
            points[x + 1][y + 1],
            points[x][y + 1]
          ],
          Util.merge([app, phy])
        );
        if (shard.area > threshold_l) {
          shards.push(shard);
        }
      }
    }
    game.addBody(shards);
    var explode = 0.00035;
    for (var i = 0; i < shards.length; i++) {
      var f = Vector.mult(
        Vector.normalise(Vector.sub(shards[i].position, this.body.position)),
        explode
      );
      Body.applyForce(shards[i], this.body.position, f);
    }
    this.color.a = 1;

    //TODO: score counter

    if (Object.values(game.players).filter(p => p.alive).length <= 1) {
      game.requestNewSession();
    }
  };
  this.kill = function(player) {
    player.die();
  };
  this.power = function(power) {
    // sends downstream message
    const socketEmit = (broadcast = true) => {
      (broadcast ? game.io.sockets : this.socket).emit("power", {
        powers: Object.fromEntries(
          Object.entries(this.activePowers).map(([k, v]) => [
            k,
            {
              ...v,
              cancel: undefined,
              body: undefined,
              constraint: undefined
            }
          ])
        ),
        body: extractBodyProperties(this.body)
      });
    };

    const currentActivePower = this.activePowers[power.name];
    // if power is already active
    if (currentActivePower) {
      // clear timeout for active power
      clearTimeout(currentActivePower.cancel);
    }

    const cancel = setTimeout(() => {
      if (power.name === "shield" && this.activePowers[power.name]) {
        Body.set(this.body, {
          collisionFilter: {
            category: 32,
            mask: 1 | 4 | 8 | 16
          }
        });
        game.removeBody(this.activePowers[power.name].body);
        World.remove(game.world, this.activePowers[power.name].constraint);
      }
      delete this.activePowers[power.name];
      socketEmit();
    }, power.timeout);

    if (currentActivePower && currentActivePower.name === "shield") {
      power.body = currentActivePower.body;
      power.constraint = currentActivePower.constraint;
    } else if (power.name === "shield") {
      Body.set(this.body, {
        collisionFilter: {
          category: 32,
          mask: 0 | 4 | 16 | 32 | 64
        }
      });
      const c = game.settings.package.powers.shield.circle;
      const strokeStyle = this.color.darker(c.lightenColor).toString();
      const options = {
        ...c.options,
        render: {
          fillStyle: "transparent",
          lineWidth: 1,
          strokeStyle
        }
      };
      const body = Bodies.circle(
        this.body.position.x,
        this.body.position.y,
        c.radius,
        options
      );
      game.addBody(body);
      power.body = body;
      power.constraint = Constraint.create({
        bodyA: this.body,
        bodyB: body,
        stiffness: 0.07
      });
      World.add(game.world, power.constraint);
    }

    if (power.name === "teleport") {
      const randomPosition = game.getRandomPosition();
      Body.setPosition(this.body, randomPosition);
      if (this.activePowers.shield) {
        Body.setPosition(this.activePowers.shield.body, randomPosition);
      }
    }

    this.activePowers[power.name] = {
      ...power,
      activatedAt: new Date().getTime(),
      cancel
    };
    socketEmit();
  };
}

module.exports = Player;
