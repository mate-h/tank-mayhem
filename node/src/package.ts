import { Body, Bodies, Events } from "matter-js";
import { game } from "./index";

class Package {
  settings = game.settings.package;
  used = false;
  power: any;
  id = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);
  body = Body.create({});

  selectPower() {
    // TODO: pick randomly with bias
    const powers = Object.entries(this.settings.powers);
    this.power = powers[Math.floor(Math.random() * powers.length)][1];
    // this.power = this.settings.powers.laser;
  };
  spawn() {
    this.selectPower();
    const ms = game.settings.level.appearance.mazesize;
    const absoluteMax = ms * ms - Object.keys(game.players).length;
    const maxPackages = Math.min(this.settings.max, absoluteMax);
    if (Object.keys(game.packages).length >= maxPackages) {
      console.log("max packages reached");
      return;
    }
    function isValidPosition(pos: {x:number,y:number}) {
      if (!pos) return false;

      const cellPos = game.getCell(pos);
      let cellOccupied = false;
      Object.entries(game.players).forEach(([socket_id, player]) => {
        const playerPos = player.body.position;
        const playerCellPos = game.getCell(playerPos);
        if (playerCellPos.x === cellPos.x && playerCellPos.y === cellPos.y) {
          cellOccupied = true;
        }
      });
      Object.entries(game.packages).forEach(([id, pkg]) => {
        const packageCellPos = game.getCell(pkg.body.position);
        if (packageCellPos.x === cellPos.x && packageCellPos.y === cellPos.y) {
          cellOccupied = true;
        }
      });
      return !cellOccupied;
    }
    let pos: {x:number,y:number} = game.getRandomPosition(0);;
    while (!isValidPosition(pos)) {
      pos = game.getRandomPosition(0);
    }
    this.body = Bodies.rectangle(
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
      } as any
    );

    game.addBody([this.body]);

    Events.on(
      this.body,
      "collision",
      (e: any) => {
        this.collision(e);
      }
    );

    game.packages[this.id] = this;
  };
  collision(e: any) {
    // update player status
    const id1 = e.with.label.split(" ")[1];
    if (collidedWith("Player") && !this.used) {
      const player = game.players[id1];
      player.power(this.power);
      this.used = true;
      this.destroy();
    }
    function collidedWith(label: string) {
      return e.with.label.split(" ")[0] == label;
    }
    // this.destroy();
  };
  destroy() {
    game.removeBody(this.body);
    delete game.packages[this.id];
  };
}

export default Package;
module.exports = Package;
