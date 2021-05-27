import { Bodies, Body, Vector, Events, Composite, IEventCollision, Engine } from "matter-js";
const SAT = require('matter-js').SAT;
import game from './index';

const Color = require("./color");
const Util = require("./util");

var bid = 0;
type Player = any;
class Bullet {
  type = "normal";
  id = bid++;
  body = Body.create({});
  settings = game.settings.bullet;
  color = new Color("#ff00ff");

  has_spawn = false;
  player: Player;
  spawn(position: {x:number,y:number}, angle: number) {
    if (this.has_spawn) return;
    this.has_spawn = true;

    //set up keyboard controls

    var app = this.settings.appearance;
    var phy = this.settings.physics;
    let speed = this.settings.speed;
    let fillStyle = this.player.color.toString();
    let size = this.settings.appearance.size;
    let mask = 1 | 2 | 32 | 64;
    if (this.player.activePowers.bouncy) {
      this.type = "bouncy";
      mask = 0 | 2 | 32 | 64;
      speed = speed * this.player.activePowers.bouncy.multiplier;
      size = this.player.activePowers.bouncy.size;
      fillStyle = this.player.activePowers.bouncy.fillStyle;
    }
    phy.collisionFilter = {
      ...phy.collisionFilter,
      mask
    };
    var parts = {
      parts: [
        Bodies.circle(position.x, position.y, size, {
          render: { fillStyle },
          label: "Bullet " + this.id
        })
      ],
      label: "Bullet " + this.id
    };

    this.body = Body.create(Util.merge([app, phy, parts]));

    let bulletVelocity = {
      x: Math.cos(angle - Math.PI / 2) * speed,
      y: Math.sin(angle - Math.PI / 2) * speed
    };
    let collided = false;
    if (this.player.activePowers.bouncy) {
    } else {
      Composite.allBodies(game.world).forEach(body => {
        if (body.label.includes("Wall")) {
          const collision = SAT.collides(this.body, body);
          if (collision.collided) {
            collided = true;
          }
        }
      });
    }
    if (collided) {
      this.has_spawn = false;
      this.player.die();
      return;
    }

    game.addBody([this.body]);

    // const bulletVelocity = { x: 0, y: 0 };
    // const playerVelocity = this.player.body.velocity;
    // console.log(
    //   Vector.magnitude(bulletVelocity),
    //   playerVelocity,
    //   this.player.body.angle,
    //   {
    //     x: playerVelocity.x / Math.cos(this.player.body.angle - Math.PI / 2),
    //     y: playerVelocity.y / Math.sin(this.player.body.angle - Math.PI / 2)
    //   }
    // );
    // const velocity =
    //   Vector.magnitude(bulletVelocity) > Vector.magnitude(playerVelocity)
    //     ? bulletVelocity
    //     : playerVelocity;
    Body.setVelocity(this.body, bulletVelocity);

    Events.on(
      game.engine,
      "beforeUpdate",
      () => {
        this.update();
      }
    );

    Events.on(
      this.body,
      "collision",
      (e: any) => {
        this.collision(e);
      }
    );
  };
  update() {
    // Body.setVelocity(this.body.velocity);
  };
  collision(e: any) {
    var id1 = e.with.label.split(" ")[1];
    if (collidedWith("Player")) {
      //This is the part when you FUCKING DIE
      this.impact(game.players[id1]);
    } else if (collidedWith("Shard")) {
      Body.setVelocity(e.with, this.body.velocity);
      this.destroy();
    } else if (e.new_collision) {
      // perform a bounce with infinite elasticity
      // R = V - 2*(V dot N)*N
      var new_velocity = Vector.sub(
        this.body.velocity,
        Vector.mult(
          Vector.normalise(e.pair.collision.normal),
          Vector.dot(
            this.body.velocity,
            Vector.normalise(e.pair.collision.normal)
          ) * 2
        )
      );
      let speed = this.settings.speed;
      if (this.type === "bouncy") {
        speed = speed * game.settings.package.powers.bouncy.multiplier;
      }
      new_velocity = Vector.mult(
        Vector.normalise(new_velocity),
        speed // Math.min(Vector.magnitude(new_velocity), this.settings.speed)
      );
      Body.setVelocity(this.body, new_velocity);
    }
    function collidedWith(label: string) {
      return e.with.label.split(" ")[0] == label;
    }
  };
  impact(player: Player) {
    this.destroy();
    this.player.kill(player);
  };
  destroy() {
    //TODO: particle effects
    game.removeBody(this.body);
    this.player.bullet_count--;
  };
}

module.exports = Bullet;
