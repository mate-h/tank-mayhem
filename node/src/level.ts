import { World, Bodies, Body } from "matter-js";
import { game } from './index';

class Level {

  walls: Body[] = [];
  settings = game.settings.level;
  generate() {
    //remove old stuff
    if (this.walls.length > 0) {
      World.remove(game.world, this.walls as any);
      this.walls = [];
    }

    var x = this.settings.appearance.mazesize;
    var y = this.settings.appearance.mazesize;
    var n = x * y - 1;
    if (n < 0) {
      alert("illegal maze dimensions");
      return;
    }
    var horiz: any[][] = [];
    for (var j = 0; j < x + 1; j++) horiz[j] = [];
    var verti: any[][] = [];
    for (var j = 0; j < y + 1; j++) verti[j] = [];
    var here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)];
    var path = [here];
    var unvisited: any[][] = [];
    for (var j = 0; j < x + 2; j++) {
      unvisited[j] = [];
      for (var k = 0; k < y + 1; k++)
        unvisited[j].push(
          j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1)
        );
    }
    while (0 < n) {
      var potential = [
        [here[0] + 1, here[1]],
        [here[0], here[1] + 1],
        [here[0] - 1, here[1]],
        [here[0], here[1] - 1]
      ];
      var neighbors = [];
      for (var j = 0; j < 4; j++)
        if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
          neighbors.push(potential[j]);
      if (neighbors.length) {
        n = n - 1;
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        unvisited[next[0] + 1][next[1] + 1] = false;
        if (next[0] == here[0])
          horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
        else verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
        path.push((here = next));
      } else {
        const n = path.pop();
        if (n) here = n;
      }
    }

    //lighten up this shit
    var light = true;
    if (light) {
      for (var j = 1; j < y - 1; j++) {
        for (var i = 1; i < x - 1; i++) {
          //is there a wall on the right?
          var cnt = 0;
          var places = [];
          //top 0
          places.push(verti[j - 1][i]);
          //right 1
          places.push(horiz[j][i]);
          //bottom 2
          places.push(verti[j][i]);
          //left 3
          places.push(horiz[j][i - 1]);

          for (var f = 0; f < places.length; f++) if (!places[f]) cnt++;

          if (cnt > 2) {
            var done = false;
            var tried = [];
            let which = 0;
            while (!done) {
              which = Math.floor(Math.random() * 4);
              if (tried.indexOf(which) == -1) tried.push(which);
              //Does the wall I'm trying to remove have more than 1 connection?
              const bubble = countConnections(i, j, which) < 2;
              //if the blocks surrounding me have a wall of 0 connections, continue searching
              var dont_remove = false;
              if (!places[which] && tried.length < 4) {
                removeWall(i, j, which);
                for (var h = 0; h < 4; h++) {
                  dont_remove =
                    dont_remove || countConnections(i - 1, j - 1, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i - 1, j, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i - 1, j + 1, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i, j - 1, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i, j + 1, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i + 1, j - 1, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i + 1, j, h) < 2;
                  dont_remove =
                    dont_remove || countConnections(i + 1, j + 1, h) < 2;
                }
                placeWall(i, j, which);
              } else dont_remove = false;

              done = !places[which] && !bubble && !dont_remove;
            }
            removeWall(i, j, which);
          }
        }
      }
    }
    function countConnections(x: number, y: number, wall_index: number) {
      var j = y,
        i = x,
        which = wall_index;
      switch (which) {
        case 0:
          var pl = [];
          pl.push(j != 0 ? horiz[j - 1][i - 1] : false);
          pl.push(j != 0 ? verti[j - 1][i - 1] : false);
          pl.push(horiz[j][i - 1]);
          var pl2 = [];
          pl2.push(j != 0 ? horiz[j - 1][i] : false);
          pl2.push(j != 0 ? verti[j - 1][i + 1] : false);
          pl2.push(horiz[j][i]);
          return countThem(pl, pl2);
          break;
        case 1:
          var pl = [];
          pl.push(j != 0 ? verti[j - 1][i] : false);
          pl.push(j != 0 ? horiz[j - 1][i] : false);
          pl.push(j != 0 ? verti[j - 1][i + 1] : false);
          var pl2 = [];
          pl2.push(verti[j][i]);
          pl2.push(horiz[j + 1] != undefined ? horiz[j + 1][i] : false);
          pl2.push(verti[j][i + 1]);
          return countThem(pl, pl2);
          break;
        case 2:
          var pl = [];
          pl.push(horiz[j][i - 1]);
          pl.push(verti[j][i - 1]);
          pl.push(horiz[j + 1] != undefined ? horiz[j + 1][i - 1] : false);
          var pl2 = [];
          pl2.push(horiz[j][i]);
          pl2.push(verti[j][i + 1]);
          pl2.push(horiz[j + 1] != undefined ? horiz[j + 1][i] : false);
          return countThem(pl, pl2);
          break;
        case 3:
          //shift to left by one
          var pl = [];
          pl.push(j != 0 ? verti[j - 1][i - 1] : false);
          pl.push(j != 0 ? horiz[j - 1][i - 1] : false);
          pl.push(j != 0 ? verti[j - 1][i + 1 - 1] : false);
          var pl2 = [];
          pl2.push(verti[j][i - 1]);
          pl2.push(horiz[j + 1] != undefined ? horiz[j + 1][i - 1] : false);
          pl2.push(verti[j][i + 1 - 1]);
          return countThem(pl, pl2);
          break;
        default:
          return 0;
      }
      function countThem(pl: any[], pl2: any[]) {
        //number of connections
        var conn = 0;
        var cnta = 0;
        for (var f = 0; f < pl.length; f++) if (!pl[f]) cnta++;
        if (cnta > 0) conn++;
        cnta = 0;
        for (var f = 0; f < pl2.length; f++) if (!pl2[f]) cnta++;
        if (cnta > 0) conn++;
        return conn;
      }
    }

    function removeWall(x: number, y: number, wall_index: number) {
      var j = y,
        i = x,
        which = wall_index;
      switch (which) {
        case 0:
          verti[j - 1][i] = "del";
          break;
        case 1:
          horiz[j][i] = "del";
          break;
        case 2:
          verti[j][i] = "del";
          break;
        case 3:
          horiz[j][i - 1] = "del";
          break;
      }
    }

    function placeWall(x: number, y: number, wall_index: number) {
      var j = y,
        i = x,
        which = wall_index;
      switch (which) {
        case 0:
          verti[j - 1][i] = undefined;
          break;
        case 1:
          horiz[j][i] = undefined;
          break;
        case 2:
          verti[j][i] = undefined;
          break;
        case 3:
          horiz[j][i - 1] = undefined;
          break;
      }
    }

    this.spawn(x, y, horiz, verti);
  };
  spawn(x: number, y: number, horiz: any[][], verti: any[][]) {
    //spawn bodies
    var w = 1920;
    var h = 1080;
    var settings_vert = {
      render: { fillStyle: this.settings.appearance.color },
      isStatic: true,
      shadow: this.settings.appearance.shadow,
      label: "Wall vertical"
    };
    var settings_horiz = {
      render: { fillStyle: this.settings.appearance.color },
      isStatic: true,
      shadow: this.settings.appearance.shadow,
      label: "Wall horizontal"
    };
    var settings_del = {
      render: { fillStyle: "#ff0000" },
      isStatic: true,
      shadow: this.settings.appearance.shadow
    };
    var th = this.settings.appearance.thickness;
    var ch = this.settings.appearance.cellsize;
    var offs = { x: ch / 2, y: ch / 2 };
    var goffs = { x: w / 2 - (ch * x) / 2, y: h / 2 - (ch * y) / 2 };
    for (var i = 0; i < x; i++) {
      for (var j = 0; j < y; j++) {
        if ((!horiz[j][i] || horiz[j][i] == "dell") && i != x - 1) {
          this.walls.push(
            Bodies.rectangle(
              goffs.x + offs.x + ch * (i + 0.5),
              goffs.y + offs.y + ch * j,
              th,
              ch + th,
              horiz[j][i] == "del" ? settings_del : settings_vert
            )
          );
        }
        if ((!verti[j][i] || verti[j][i] == "dell") && j != y - 1) {
          this.walls.push(
            Bodies.rectangle(
              goffs.x + offs.x + ch * i,
              goffs.y + offs.y + ch * (j + 0.5),
              ch + th,
              th,
              verti[j][i] == "del" ? settings_del : settings_horiz
            )
          );
        }
      }
    }

    //add bounds
    const collisionFilter = game.settings.world.collisionFilter;
    this.walls.push(
      Bodies.rectangle(goffs.x + (ch * x) / 2, goffs.y + -1000, 4000, 2000, {
        ...settings_horiz,
        collisionFilter
      })
    );
    this.walls.push(
      Bodies.rectangle(
        goffs.x + (ch * x) / 2,
        goffs.y + ch * x + 1000,
        4000,
        2000,
        { ...settings_horiz, collisionFilter }
      )
    );
    this.walls.push(
      Bodies.rectangle(goffs.x + -1000, goffs.y + (ch * x) / 2, 2000, ch * x, {
        ...settings_vert,
        collisionFilter
      })
    );
    this.walls.push(
      Bodies.rectangle(
        goffs.x + ch * x + 1000,
        goffs.y + (ch * x) / 2,
        2000,
        ch * x,
        { ...settings_vert, collisionFilter }
      )
    );

    World.add(game.world, this.walls);
  };
}

export default Level;
module.exports = Level;
