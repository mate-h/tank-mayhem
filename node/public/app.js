const dark = false;
import C2S from './lib/canvas2svg.js';
import { writable } from './lib/store.js';
export const playerPosition = writable({ x: 0, y: 0});

export class Game {
  constructor() {
  var isMobile = (function() {
    var check = false;
    (function(a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  })();
  //Matter.js module aliases
  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Events = Matter.Events,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bounds = Matter.Bounds,
    Vector = Matter.Vector,
    Bodies = Matter.Bodies,
    Query = Matter.Query;

  var PLAYER_ME = null;
  var otherPowers = {};
  var player_abs = {};

  var debug = false;
  var dppx = window.devicePixelRatio;
  this.settings = {
    FPS: 60,
    keys: {
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      shift: 16,
      w: 87,
      s: 83,
      a: 65,
      d: 68,
      q: 81,
      num0: 32,
      n: 78
    },
    render: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      // pixelRatio: dppx,
      background: dark ? "#000000" : "#e0e0e0",
      wireframeBackground: "#222",
      hasBounds: true,
      enabled: true,
      wireframes: debug,
      showSleeping: debug,
      showDebug: debug,
      showBroadphase: debug,
      showBounds: debug,
      showVelocity: debug,
      showCollisions: debug,
      showSeparations: false,
      showAxes: false,
      showPositions: debug,
      showAngleIndicator: debug,
      showIds: false,
      showShadows: false,
      showVertexNumbers: false,
      showConvexHulls: false,
      showInternalEdges: debug,
      showMousePosition: false
    }
  };
  this.render = Render.create({
    element: document.body,
    options: this.settings.render
  });
  window.c2s = new C2S(1240, 1240);
  window.context = this.render.context;
  window.render = this.render;
  this.dynamicBodies = {};
  this.staticBodies = [];
  this.width = document.body.clientWidth;
  this.height = document.body.clientHeight;
  var scrollThreshold =
    (this.width > this.height ? this.width : this.height) * (50 / 1440);
  var viewportCenter = {
    x: this.width * 0.5,
    y: this.height * 0.5
  };

  this.keyEventHandler = function(code, down) {
    var opcode = -1;
    switch (code) {
      case this.settings.keys.up:
        opcode = 0;
        break;
      case this.settings.keys.down:
        opcode = 1;
        break;
      case this.settings.keys.left:
        opcode = 2;
        break;
      case this.settings.keys.right:
        opcode = 3;
        break;
      case this.settings.keys.num0:
        opcode = 4;
        break;
      case this.settings.keys.n:
        //opcode = down ? -1 : 5;
        break;
    }

    if (opcode !== -1)
      socket.emit("key " + (down ? "down" : "up"), "" + opcode);
  };
  var downAt = 0;
  var deltaTouch = 0;
  var deltaThreshold = 200;
  var touchPrev = null;
  var startDispatch = false;
  this.touchEventHandler = function(touch, type) {
    var name = "";
    if (type === 0 && !startDispatch) {
      downAt = new Date().getTime();
      name = "move";
      startDispatch = true;
    }
    if (type === 1 || startDispatch) {
      name = "move";
    }
    if (type === 2) {
      deltaTouch = new Date().getTime() - downAt;
      name = "end";
      startDispatch = false;
    }
    if (type === 3) {
      name = "end";
    }

    // if (deltaTouch >= deltaThreshold) name = "shoot";

    if (touch !== null) touchPrev = touch;

    socket.emit(
      "touch " + name,
      Math.atan2(
        player_abs.y - touchPrev.pageY,
        player_abs.x - touchPrev.pageX
      ) -
        Math.PI / 2
    );
  };
  this.initialize = function() {
    if (isMobile) {
      document.addEventListener(
        "touchstart",
        function(evt) {
          if (evt.touches.length === 1) {
            var touch = evt.touches[0];
            this.touchEventHandler(touch, 0);
          }
        }.bind(this)
      );
      document.addEventListener(
        "touchmove",
        function(evt) {
          evt.preventDefault();
          if (evt.touches.length === 1) {
            var touch = evt.touches[0];
            var num = 1;
            //if (Vector.magnitude(Vector.sub({x:touch.pageX, y:touch.pageY}, player_abs)) > 200) num = 3;
            this.touchEventHandler(touch, num);
          }
        }.bind(this)
      );
      document.addEventListener(
        "touchend",
        function(evt) {
          this.touchEventHandler(null, 2);
        }.bind(this)
      );
    } else {
      document.addEventListener(
        "keydown",
        function(evt) {
          this.keyEventHandler(evt.keyCode, true);
        }.bind(this)
      );
      document.addEventListener(
        "keyup",
        function(evt) {
          this.keyEventHandler(evt.keyCode, false);
        }.bind(this)
      );
    }

    var render = this.render;
    var canvas = this.render.canvas;
    canvas.style.background = this.settings.render.background;
    canvas.style.backgroundSize = "contain";
    canvas.scaledWidth = canvas.width + 0;
    canvas.scaledHeight = canvas.height + 0;
    if (dppx !== 1) {
      canvas.style.width = canvas.width + "px";
      canvas.style.height = canvas.height + "px";
      canvas.width = canvas.width * dppx;
      canvas.height = canvas.height * dppx;
      this.render.context.scale(dppx, dppx);
    }

    var dynamic_prev = [];
    socket.on(
      "frame",
      (obj) => {
        var sparseKeys = Object.keys(obj);
        for (var i = 0; i < sparseKeys.length; i++) {
          var index = sparseKeys[i];
          this.dynamicBodies[index].positionPrev = this.dynamicBodies[
            index
          ].position;
          this.dynamicBodies[index].anglePrev = this.dynamicBodies[index].angle;
          Body.setPosition(this.dynamicBodies[index], {
            x: obj[index][0],
            y: obj[index][1]
          });
          Body.setAngle(this.dynamicBodies[index], obj[index][2]);
          this.dynamicBodies[index].position = {
            x: obj[index][0],
            y: obj[index][1]
          };
          this.dynamicBodies[index].angle = obj[index][2];
          if (obj[index][3] !== undefined && obj[index][4] !== undefined) {
            const velocity = {
              x: obj[index][3],
              y: obj[index][4]
            };
            Body.setVelocity(this.dynamicBodies[index], velocity);
            this.dynamicBodies[index].velocity = velocity;
          }

          //update camera
          if (this.dynamicBodies[index].id == PLAYER_ME.body_id) {
            PLAYER_ME.position = {
              x: obj[index][0],
              y: obj[index][1]
            };
          }
        }
      }
    );

    setInterval(
      () => {
        this.renderGame();
      },
      1000 / this.settings.FPS
    );

    //control our view
    var boundsScaleTarget = 1,
      boundsScale = {
        x: 1,
        y: 1
      };
    //create mouse
    var mouse = Mouse.create(this.render.canvas);
    this.render.mouse = mouse;
    window.setInterval(
      function() {
        var translate;

        // mouse wheel controls zoom
        var scaleFactor = mouse.wheelDelta * -0.1; //mouseConstraint.mouse.wheelDelta * -0.1;
        if (scaleFactor !== 0) {
          if (
            (scaleFactor < 0 && boundsScale.x >= 0.6) ||
            (scaleFactor > 0 && boundsScale.x <= 1.4)
          ) {
            boundsScaleTarget += scaleFactor;
          }
        }

        // if scale has changed
        if (Math.abs(boundsScale.x - boundsScaleTarget) > 0.01) {
          // smoothly tween scale factor
          scaleFactor = (boundsScaleTarget - boundsScale.x) * 0.2;
          boundsScale.x += scaleFactor;
          boundsScale.y += scaleFactor;

          // scale the render bounds
          game.render.bounds.max.x =
            game.render.bounds.min.x +
            game.render.options.width * boundsScale.x;
          game.render.bounds.max.y =
            game.render.bounds.min.y +
            game.render.options.height * boundsScale.y;

          // translate so zoom is from center of view
          translate = {
            x: game.render.options.width * scaleFactor * -0.5,
            y: game.render.options.height * scaleFactor * -0.5
          };

          Bounds.translate(game.render.bounds, translate);

          // update mouse
          Mouse.setScale(mouse, boundsScale);
          Mouse.setOffset(mouse, game.render.bounds.min);
        }

        // get vector from player relative to center of viewport
        player_abs.x =
          (PLAYER_ME.position.x - game.render.bounds.min.x) / boundsScale.x;
        player_abs.y =
          (PLAYER_ME.position.y - game.render.bounds.min.y) / boundsScale.y;

        var deltaCenter = Vector.sub(player_abs, viewportCenter),
          centerDist = Vector.magnitude(deltaCenter);

        // translate the view if player has moved over 50px from the center of viewport
        if (centerDist > scrollThreshold) {
          // create a vector to translate the view, allowing the user to control view speed
          var direction = Vector.normalise(deltaCenter),
            speed = Math.min(10, Math.pow(centerDist - 50, 2) * 0.0002);

          translate = Vector.mult(direction, speed);

          // move the view
          Bounds.translate(game.render.bounds, translate);


          // we must update the mouse too
          Mouse.setOffset(mouse, game.render.bounds.min);
        }
      }.bind(this),
      1000 / this.settings.FPS
    );
  };

  this.centerCamera = function(player) {
    Bounds.shift(
      this.render.bounds,
      Vector.sub(player.position, viewportCenter)
    );
  };

  this.getBody = id => Object.values(this.dynamicBodies).find(b => b.id === id);
  this.getAllBodies = () => {
    return this.staticBodies.concat(Object.values(this.dynamicBodies));
  };
  this.renderGame = () => {
    const cx = (game.render.bounds.max.x + game.render.bounds.min.x) / 2;
    const cy = (game.render.bounds.max.y + game.render.bounds.min.y) / 2;
    const w2 = window.innerWidth / 2;
    const h2 = window.innerHeight / 2;
    playerPosition.set({
      x: PLAYER_ME.position.x - game.render.bounds.min.x - w2,
      y: PLAYER_ME.position.y - game.render.bounds.min.y - h2,
    });
    
    var bodies = this.getAllBodies(),
      context = this.render.context,
      options = this.render.options;

    // clear the canvas with a transparent fill, to allow the canvas background to show
    context.fillStyle = game.settings.render.background;
    context.fillRect(0, 0, this.render.canvas.width, this.render.canvas.height);

    // handle bounds
    if (options.hasBounds) {
      // transform the view
      Render.startViewTransform(this.render);

      // update mouse
      if (this.render.mouse) {
        Mouse.setScale(this.render.mouse, {
          x: (this.render.bounds.max.x - this.render.bounds.min.x) / this.render.canvas.width,
          y: (this.render.bounds.max.y - this.render.bounds.min.y) / this.render.canvas.height
        });

        Mouse.setOffset(this.render.mouse, this.render.bounds.min);
      }
    }

    if (PLAYER_ME.activePowers && PLAYER_ME.activePowers.laser) {
      this.renderLaser(
        bodies,
        bodies.find(b => b.id === PLAYER_ME.body_id)
      );
    }

    Render.bodies(this.render, bodies, context);
    this.renderLabels();
    if (options.hasBounds) {
      // revert view transforms
      Render.endViewTransform(this.render);
    }

    this.renderScore();
  };
  window.renderGame = this.renderGame;

  this.renderLabels = () => {
    const context = this.render.context;
    var dppx = window.devicePixelRatio;
    this.getAllBodies().forEach(body => {
      if (body.label.includes("Package")) {
        context.font = `${8}px sans-serif`;
        context.fillStyle = "#fff";
        var name = body.label.split(" ")[2];
        if (game.icons[name]) {
          context.globalAlpha = 0.54;
          context.drawImage(
            game.icons[name],
            body.position.x - 12,
            body.position.y - 12,
            24,
            24
          );
          context.globalAlpha = 1;
        }

        // context.fillText(
        //   char,
        //   body.position.x - context.measureText(char).width / 2,
        //   body.position.y + 3
        // );
      }
      if (body.label.includes("Player")) {
        context.font = `${12}px monospace`;
        context.fillStyle = "#000";
        const padding = 40;
        const lineHeight = 12;
        if (body.id === PLAYER_ME.body_id) {
          Object.entries(PLAYER_ME.activePowers || {}).forEach(
            ([name, power], i) => {
              const t =
                (new Date().getTime() - power.activatedAt) / power.timeout;
              let w = 24 * dppx;
              let h = 8;
              context.lineWidth = 2;
              context.strokeStyle = "rgba(255, 255, 255, 1)";
              context.strokeRect(
                body.position.x - w / 2,
                body.position.y - padding - i * lineHeight,
                w,
                h
              );
              context.fillStyle = "rgba(255,255,255,1)";
              context.fillRect(
                body.position.x - w / 2,
                body.position.y - padding - i * lineHeight,
                w * (1 - t),
                h
              );
            }
          );
        }
        if (body.streaks) {
          body.streaks.forEach(s =>
            this.renderStreak(s.pathPoints, s.currentDistance)
          );
        }
      }
    });
  };

  this.renderLaser = () => {
    const context = this.render.context;
    const playerBody = this.getBody(PLAYER_ME.body_id);
    if (!playerBody) return;

    const pathPoints = this.runLaser(playerBody);
    let totalDistance = 0;
    pathPoints.forEach((p, i) => {
      const next = pathPoints[i + 1];
      if (next) {
        context.beginPath();
        context.moveTo(p.x, p.y);
        context.lineTo(next.x, next.y);
        context.strokeStyle = "#f00";
        context.lineWidth = 1.5;
        context.globalAlpha = 1 / (totalDistance * 0.01 + 1);
        context.stroke();
        context.strokeStyle = "#fff";
        context.lineWidth = 1;
        context.globalAlpha = 1 / (totalDistance * 0.005 + 1);
        context.stroke();
        totalDistance += Vector.magnitude(Vector.sub(next, p));
      }
    });
  };
  this.runLaser = (body) => {
    const bodies = this.getAllBodies();
    const rayLength = Math.max(this.width, this.height);

    let wallCollision;
    let prevPoint;
    let currentPoint = Vector.add(
      body.position,
      Vector.rotate({ x: 0, y: -20 }, body.angle)
    );
    let currentDirection = Vector.rotate({ x: 0, y: -1 }, body.angle);
    const limit = 40;
    let cnt = 0;

    let pathPoints = [currentPoint];
    do {
      const rayVector = Vector.mult(currentDirection, rayLength);
      const filtered = bodies
        .filter(b => (wallCollision ? b.id !== wallCollision.body.id : true))
        .filter(b => b.label.includes("Wall"));

      const collisions = raycast(
        filtered, // bodies
        currentPoint, // start
        Vector.add(currentPoint, rayVector), // end
        true // sort
      );

      // exclude current point from collisions
      const filteredCollisions = collisions.filter(c => {
        if (
          currentPoint &&
          compareNum(currentPoint.x, c.point.x) &&
          compareNum(currentPoint.y, c.point.y)
        ) {
          return false;
        }
        return true;
      });

      wallCollision = filteredCollisions[0];

      if (!wallCollision) {
        break;
      }

      prevPoint = { ...currentPoint };
      currentPoint = wallCollision.point;
      pathPoints.push(currentPoint);
      currentDirection = Vector.normalise(
        Vector.sub(
          rayVector,
          Vector.mult(
            Vector.normalise(wallCollision.normal),
            Vector.dot(rayVector, Vector.normalise(wallCollision.normal)) * 2
          )
        )
      );
    } while (wallCollision && cnt++ < limit);

    return pathPoints;
  };

  this.renderStreak = (pathPoints, currentDistance) => {
    const context = this.render.context;
    const streakLen = 200;
    let accDistance = 0;
    pathPoints.forEach((p, i) => {
      const next = pathPoints[i + 1];
      if (next) {
        const delta = Vector.magnitude(Vector.sub(next, p));
        const prevDistance = accDistance;
        accDistance += delta;
        if (accDistance > currentDistance - streakLen) {
          const calcCurrentProgress = offs =>
            (Math.min(
              Math.max(currentDistance + offs, prevDistance),
              accDistance
            ) -
              prevDistance) /
            delta;
          const getPointAlongPath = t =>
            Vector.add(p, Vector.mult(Vector.sub(next, p), t));

          const A = getPointAlongPath(calcCurrentProgress(-streakLen / 2));
          const B = getPointAlongPath(calcCurrentProgress(streakLen / 2));

          context.beginPath();
          context.moveTo(A.x, A.y);
          context.lineTo(B.x, B.y);
          context.strokeStyle = "#f00";
          context.lineWidth = 1;
          context.globalAlpha = 1;
          context.stroke();
        }
      }
    });
  };

  var animationFrame = null;
  this.animate = (cb, { duration = 250, end = () => {} }) => {
    const start = new Date().getTime();
    const step = () => {
      const curr = new Date().getTime();
      if (duration) {
        const t = (curr - start) / duration;
        cb(t);
        if (curr - start < duration) {
          animationFrame = window.requestAnimationFrame(step);
        } else {
          end();
        }
      } else {
        cb(curr - start);
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    animationFrame = window.requestAnimationFrame(step);
    return function cancel() {
      window.cancelAnimationFrame(animationFrame);
    };
  };

  var prevScore = null;
  var scoreOffset = 0;
  var animating = false;
  this.renderScore = () => {
    var dppx = window.devicePixelRatio;
    var context = this.render.context;
    context.scale(dppx, dppx);
    if (prevScore !== PLAYER_ME.score && !animating && prevScore !== null) {
      animating = true;
      this.animate(
        t => {
          scoreOffset = t;
        },
        {
          end: () => {
            prevScore = PLAYER_ME.score;
            scoreOffset = 0;
            animating = false;
          }
        }
      );
    }
    //render buttons and text
    context.fillStyle = dark ? "#fff" : "#000";
    context.globalAlpha = 0.87;
    var padding = 80;
    const fontSize = 72;
    context.font = `${fontSize}px sans-serif`;
    context.save();
    const scoreTextY = game.height - padding;
    context.beginPath();
    context.rect(0, 0, game.width, scoreTextY + 15);
    context.clip();
    const fillText = (text, offset, alpha) => {
      context.globalAlpha = alpha;
      context.fillText(
        text,
        game.width / 2 - context.measureText(PLAYER_ME.score + "").width / 2,
        game.height - padding + offset
      );
    };
    if (animating) {
      const quadOut = t => -t * (t - 2.0);
      fillText(prevScore, -fontSize * quadOut(scoreOffset), 1 - scoreOffset);
      fillText(
        PLAYER_ME.score,
        -fontSize * (quadOut(scoreOffset) - 1),
        scoreOffset
      );
    } else {
      fillText(PLAYER_ME.score, 0);
    }
    context.restore();

    context.font = `${13}px sans-serif`;
    context.fillText(
      "S C O R E",
      game.width / 2 - context.measureText("S C O R E").width / 2,
      scoreTextY + 30
    );

    if (!animating) {
      prevScore = PLAYER_ME.score;
    }
  };

  var socket = io();
  var init = (obj, retry) => {
    console.log("init");
    PLAYER_ME = obj.player;
    for (var i = 0; i < obj.level.length; i++) {
      var body = obj.level[i];
      if (body.isStatic) game.staticBodies.push(body);
      else {
        game.dynamicBodies[body.id] = body;
      }
    }
    game.centerCamera(obj.player);
    if (!retry) game.initialize();
  };
  socket.once("init", (msg) => {
    init(msg, false);
  });
  socket.on(
    "spawn",
    (obj) => {
      console.log("spawn");
      for (var i = 0; i < obj.length; i++) {
        this.dynamicBodies[obj[i].id] = obj[i];
      }
    }
  );
  socket.on(
    "remove",
    (obj) => {
      console.log("remove", obj.id);
      delete this.dynamicBodies[obj.id];
    }
  );
  socket.on(
    "disconnect",
    () => {
      console.log("disconnect");
      this.dynamicBodies = {};
      this.staticBodies = [];
      socket.once("init", function(msg) {
        init(msg, true);
      });
    }
  );
  socket.on(
    "new session",
    (msg) => {
      console.log("new session");
      this.dynamicBodies = {};
      this.staticBodies = [];
      // clear active powers
      PLAYER_ME.activePowers = {};
      init(msg, true);
    }
  );
  // socket.on(
  //   "score",
  //   function(msg) {
  //     console.log("score");
  //     PLAYER_ME.score = parseInt(msg);
  //   }.bind(this)
  // );
  socket.on("power", msg => {
    // set active powers
    console.log("power", msg);
    const body = this.getBody(msg.body.id);
    if (PLAYER_ME && PLAYER_ME.body_id === msg.body.id) {
      PLAYER_ME.activePowers = msg.powers;

      if (msg.powers.invisibility) {
        Body.set(body, { render: { ...body.render, opacity: 0.54 } });
      } else {
        Body.set(body, { render: { ...body.render, opacity: 1 } });
      }
    } else {
      if (msg.powers.invisibility) {
        Body.set(body, { render: { ...body.render, visible: false } });
      } else {
        Body.set(body, { render: { ...body.render, visible: true } });
      }
    }

    // if (msg.bodies) {
    //   console.log(msg.bodies);
    //   msg.bodies.forEach(b => {
    //     this.dynamicBodies[b.id] = b;
    //   });
    // }
  });
  socket.on("laser", msg => {
    const pathPoints = this.runLaser(msg.body);
    const length = pathPoints.reduce((p, c, i) => {
      const next = pathPoints[i + 1];
      if (next) return p + Vector.magnitude(Vector.sub(next, c));
      return p;
    }, 200);

    if (msg.body.id === PLAYER_ME.body_id) {
      socket.emit("laserpath", {
        pathPoints,
        length,
        firedAt: new Date().getTime()
      });
    }
    const body = this.getBody(msg.body.id);
    if (!body.streaks) body.streaks = [];

    const idx = body.streaks.length;
    body.streaks.push({
      pathPoints,
      currentDistance: 0
    });
    const cancel = this.animate(
      t => {
        body.streaks[idx].currentDistance = t * length;
      },
      {
        duration: length,
        end: () => {
          delete body.streaks[idx];
        }
      }
    );
  });

  const icons = {
    teleport:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogbm9uZTsKICAgICAgICBzdHJva2U6ICMwMDA7CiAgICAgICAgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOwogICAgICAgIHN0cm9rZS13aWR0aDogMnB4OwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8dGl0bGU+dHQtdGVsZXBvcnQ8L3RpdGxlPgogIDxnIGlkPSJMYXllcl8zIiBkYXRhLW5hbWU9IkxheWVyIDMiPgogICAgPGVsbGlwc2UgY2xhc3M9ImNscy0xIiBjeD0iMjMuNDIiIGN5PSI0Mi4wMiIgcng9IjE2LjExIiByeT0iNC44Ii8+CiAgICA8bGluZSBjbGFzcz0iY2xzLTEiIHgxPSI3LjMxIiB5MT0iMzcuMjMiIHgyPSI3LjMxIiB5Mj0iMTIuOCIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMjkuMDciIHkxPSIyMS42NSIgeDI9IjI5LjA3IiB5Mj0iMS44OCIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMzQuMDQiIHkxPSIzMy44NiIgeDI9IjM0LjA0IiB5Mj0iOS40MyIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMzkuNTMiIHkxPSIzNy4yMyIgeDI9IjM5LjUzIiB5Mj0iMTIuOCIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMTMuMjIiIHkxPSIxNy4xOCIgeDI9IjEzLjIyIiB5Mj0iMi4wOSIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMTkuMTgiIHkxPSIzMy41OSIgeDI9IjE5LjE4IiB5Mj0iNy4xMiIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMjQuMTIiIHkxPSIzNC4xOSIgeDI9IjI0LjEyIiB5Mj0iMTMuODEiLz4KICAgIDxjaXJjbGUgY3g9IjcuMzEiIGN5PSI5LjcyIiByPSIyLjA0Ii8+CiAgICA8Y2lyY2xlIGN4PSIxMy4yMiIgY3k9IjIwLjM2IiByPSIyLjA0Ii8+CiAgICA8Y2lyY2xlIGN4PSIxOS4xOCIgY3k9IjMuNDkiIHI9IjIuMDQiLz4KICAgIDxjaXJjbGUgY3g9IjI0LjEyIiBjeT0iMTAuMjMiIHI9IjIuMDQiLz4KICAgIDxjaXJjbGUgY3g9IjI5LjAyIiBjeT0iMjUuMDEiIHI9IjIuMDQiLz4KICAgIDxjaXJjbGUgY3g9IjM0LjA0IiBjeT0iNi4xNSIgcj0iMi4wNCIvPgogICAgPGNpcmNsZSBjeD0iMzkuNTMiIGN5PSI5LjcyIiByPSIyLjA0Ii8+CiAgPC9nPgo8L3N2Zz4K",
    invisibility:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgc3Ryb2tlOiAjMDAwOwogICAgICAgIHN0cm9rZS1taXRlcmxpbWl0OiAxMDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHRpdGxlPnR0LXRlbGVwb3J0PC90aXRsZT4KICA8ZyBpZD0iTGF5ZXJfMyIgZGF0YS1uYW1lPSJMYXllciAzIj4KICAgIDxnPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00Ny4wOCwyNi4zMWMtLjA4LS4xNC04LTE0LjgxLTIyLjM1LTE1LjE5QTI2LjE2LDI2LjE2LDAsMCwwLDkuNjQsMTUuOSwyNi44OSwyNi44OSwwLDAsMCwuOTQsMjYuMTRsLS44LS4zOWEyNy43NCwyNy43NCwwLDAsMSw5LTEwLjU3LDI3LDI3LDAsMCwxLDE1LjYyLTQuOTRjMTQuODQuMzksMjIuNzgsMTUsMjMuMTEsMTUuNjZaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIzLjg1LDQxLjY0aC0uNkM4LjQxLDQxLjI0LjQ4LDI2LjU5LjE0LDI2bC43OS0uNDFDMSwyNS43LDksNDAuMzYsMjMuMjgsNDAuNzRBMjYuMjMsMjYuMjMsMCwwLDAsMzguMzcsMzZhMjYuOTEsMjYuOTEsMCwwLDAsOC42OS0xMC4yM2wuOC4zOGEyNy43OSwyNy43OSwwLDAsMS05LDEwLjU3QTI3LjI3LDI3LjI3LDAsMCwxLDIzLjg1LDQxLjY0WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yNCw0MC4zQTE0LjU1LDE0LjU1LDAsMSwxLDM4LjU1LDI1Ljc2LDE0LjU2LDE0LjU2LDAsMCwxLDI0LDQwLjNabTAtMjguMkExMy42NiwxMy42NiwwLDEsMCwzNy42NiwyNS43NiwxMy42NywxMy42NywwLDAsMCwyNCwxMi4xWiIvPgogICAgICA8cmVjdCBjbGFzcz0iY2xzLTEiIHg9Ii00IiB5PSIyMy41NiIgd2lkdGg9IjUwLjc4IiBoZWlnaHQ9IjAuODkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMC43MSAyMi4xNSkgcm90YXRlKC00NSkiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=",
    bouncy:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPHRpdGxlPnR0LWJvdW5jeTwvdGl0bGU+CiAgPGcgaWQ9IkxheWVyXzMiIGRhdGEtbmFtZT0iTGF5ZXIgMyI+CiAgICA8Zz4KICAgICAgPHBhdGggZD0iTTUuNzIsMTUuMzRhNy4yMyw3LjIzLDAsMSwxLDkuNDMtMy45M0E3LjI1LDcuMjUsMCwwLDEsNS43MiwxNS4zNFptNS4zNy0xM2E2Ljg1LDYuODUsMCwxLDAsMy43Miw5QTYuODYsNi44NiwwLDAsMCwxMS4wOSwyLjMyWiIvPgogICAgICA8cGF0aCBkPSJNOC40NywxNi44OGE4LjEzLDguMTMsMCwwLDEtMy4xMy0uNjJoMGE4LjIzLDguMjMsMCwxLDEsMy4xMy42MlptMC0xNC4wOGE1LjgzLDUuODMsMCwxLDAsMi4yMy40NGgwQTYsNiwwLDAsMCw4LjQ4LDIuOFoiLz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8bGluZSB4MT0iOS43MSIgeTE9IjE3LjkzIiB4Mj0iMTEuOTciIHkyPSIyMi41MiIvPgogICAgICA8cmVjdCB4PSI5Ljg0IiB5PSIxNy42NiIgd2lkdGg9IjIiIGhlaWdodD0iNS4xMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTcuODMgNi44OCkgcm90YXRlKC0yNi4yNikiLz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8bGluZSB4MT0iMTIuODMiIHkxPSIxNy4wNyIgeDI9IjE2LjMxIiB5Mj0iMjMuMzgiLz4KICAgICAgPHJlY3QgeD0iMTMuNTciIHk9IjE2LjYyIiB3aWR0aD0iMiIgaGVpZ2h0PSI3LjIxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNy45NSA5LjU0KSByb3RhdGUoLTI4Ljg2KSIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxsaW5lIHgxPSIxNS4zMyIgeTE9IjE0LjgyIiB4Mj0iMTcuNzkiIHkyPSIxOS4zMSIvPgogICAgICA8cmVjdCB4PSIxNS41NiIgeT0iMTQuNSIgd2lkdGg9IjIiIGhlaWdodD0iNS4xMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYuMTYgMTAuMDUpIHJvdGF0ZSgtMjguNzEpIi8+CiAgICA8L2c+CiAgICA8cG9seWdvbiBwb2ludHM9IjI4Ljc2IDQ4LjA1IDE2LjA5IDI1LjAyIDE3Ljg0IDI0LjA1IDI4LjQ5IDQzLjQxIDQ1LjkyIDAuNDcgNDcuNzggMS4yMiAyOC43NiA0OC4wNSIvPgogIDwvZz4KPC9zdmc+Cg==",
    laser:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPHRpdGxlPnR0LWxhc2VyPC90aXRsZT4KICA8ZyBpZD0iTGF5ZXJfNCIgZGF0YS1uYW1lPSJMYXllciA0Ij4KICAgIDxnPgogICAgICA8Zz4KICAgICAgICA8cmVjdCB4PSIyMy43NSIgeT0iMS45MyIgd2lkdGg9IjAuNSIgaGVpZ2h0PSIzNy42MiIvPgogICAgICAgIDxnPgogICAgICAgICAgPHJlY3QgeD0iMjMuMjMiIHk9IjEuOTMiIHdpZHRoPSIxLjU1IiBoZWlnaHQ9IjM3LjYyIi8+CiAgICAgICAgICA8cGF0aCBkPSJNMjUsMzkuOEgyM1YxLjY4aDJabS0xLjU0LS41aDFWMi4xOGgtMVoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8bGluZSB4MT0iMzMuMzUiIHkxPSIyNC4yOSIgeDI9IjI2LjkyIiB5Mj0iMzkuOTciLz4KICAgICAgICAgIDxyZWN0IHg9IjIxLjY2IiB5PSIzMS44OCIgd2lkdGg9IjE2Ljk1IiBoZWlnaHQ9IjAuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExLjAxIDQ3Ljg1KSByb3RhdGUoLTY3Ljc0KSIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgIDxyZWN0IHg9IjIxLjY2IiB5PSIzMS4zNiIgd2lkdGg9IjE2Ljk1IiBoZWlnaHQ9IjEuNTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMS4wMyA0Ny44Mikgcm90YXRlKC02Ny43MSkiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0yNy43Nyw0MC41OWwtMS44OS0uNzhMMzIuNSwyMy42N2wxLjg5Ljc4Wm0tMS4yNC0xLjA1LDEsLjQsNi4yNC0xNS4yMi0xLS40WiIvPgogICAgICAgIDwvZz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8Zz4KICAgICAgICAgIDxsaW5lIHgxPSI0MS4wNSIgeTE9IjI5LjE4IiB4Mj0iMjguODEiIHkyPSI0MC45Ii8+CiAgICAgICAgICA8cmVjdCB4PSIyNi40NSIgeT0iMzQuNzkiIHdpZHRoPSIxNi45NSIgaGVpZ2h0PSIwLjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xNC41MyAzMy44Nykgcm90YXRlKC00My43MykiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICA8cmVjdCB4PSIyNi40NSIgeT0iMzQuMjciIHdpZHRoPSIxNi45NSIgaGVpZ2h0PSIxLjU1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTQuNTMgMzMuODcpIHJvdGF0ZSgtNDMuNzMpIi8+CiAgICAgICAgICA8cGF0aCBkPSJNMjkuMzMsNDEuODFsLTEuNDEtMS40OEw0MC41MywyOC4yN2wxLjQxLDEuNDhabS0uNzEtMS40Ni43My43NUw0MS4yMywyOS43Myw0MC41MSwyOVoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8bGluZSB4MT0iNDUuNjciIHkxPSIzNS44OCIgeDI9IjMwLjEzIiB5Mj0iNDIuNjQiLz4KICAgICAgICAgIDxyZWN0IHg9IjI5LjQzIiB5PSIzOS4wMSIgd2lkdGg9IjE2Ljk1IiBoZWlnaHQ9IjAuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEyLjUxIDE4LjM4KSByb3RhdGUoLTIzLjUxKSIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgIDxyZWN0IHg9IjI5LjQzIiB5PSIzOC40OSIgd2lkdGg9IjE2Ljk1IiBoZWlnaHQ9IjEuNTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMi41MiAxOC4zOCkgcm90YXRlKC0yMy41MSkiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0zMC4zMSw0My42OGwtLjgxLTEuODcsMTYtNywuODEsMS44OFptLS4xNS0xLjYyLjQxLDEsMTUuMDgtNi41Ni0uNDEtMVoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8bGluZSB4MT0iNDcuNTMiIHkxPSI0NC42MyIgeDI9IjMwLjU5IiB5Mj0iNDQuOTUiLz4KICAgICAgICAgIDxyZWN0IHg9IjMwLjU5IiB5PSI0NC41NCIgd2lkdGg9IjE2Ljk1IiBoZWlnaHQ9IjAuNSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwgLTAuMDIsIDAuMDIsIDEsIC0wLjg3LCAwLjc3KSIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgIDxyZWN0IHg9IjMwLjU5IiB5PSI0NC4wMiIgd2lkdGg9IjE2Ljk1IiBoZWlnaHQ9IjEuNTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjg1IDAuNzUpIHJvdGF0ZSgtMS4wOSkiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0zMC4zNiw0NmwwLTIsMTcuNDQtLjMzLDAsMlptLjQ3LTEuNTYsMCwxLDE2LjQ0LS4zMiwwLTFaIi8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPGxpbmUgeDE9IjE0LjY1IiB5MT0iMjQuMjkiIHgyPSIyMS4wOCIgeTI9IjM5Ljk3Ii8+CiAgICAgICAgICA8cmVjdCB4PSIxNy42MiIgeT0iMjMuNjUiIHdpZHRoPSIwLjUiIGhlaWdodD0iMTYuOTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMC44NSA5LjE4KSByb3RhdGUoLTIyLjMpIi8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgPHJlY3QgeD0iMTcuMDkiIHk9IjIzLjY2IiB3aWR0aD0iMS41NSIgaGVpZ2h0PSIxNi45NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwLjg1IDkuMTgpIHJvdGF0ZSgtMjIuMykiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0yMC4yMyw0MC41OSwxMy42MSwyNC40NWwxLjg5LS43OCw2LjYyLDE2LjE0Wm0tNi0xNS44N0wyMC41LDM5Ljk0bDEtLjRMMTUuMjMsMjQuMzJaIi8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPGxpbmUgeDE9IjYuOTUiIHkxPSIyOS4xOCIgeDI9IjE5LjIiIHkyPSI0MC45Ii8+CiAgICAgICAgICA8cmVjdCB4PSIxMi44MiIgeT0iMjYuNTciIHdpZHRoPSIwLjUiIGhlaWdodD0iMTYuOTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMS4yOCAyMC4yNikgcm90YXRlKC00Ni4yNykiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICA8cmVjdCB4PSIxMi4zIiB5PSIyNi41NyIgd2lkdGg9IjEuNTUiIGhlaWdodD0iMTYuOTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMS4yOCAyMC4yNikgcm90YXRlKC00Ni4yNykiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0xOC42Nyw0MS44MSw2LjA2LDI5Ljc1bDEuNDEtMS40OEwyMC4wOCw0MC4zM1pNNi43NywyOS43MywxOC42NSw0MS4xbC43My0uNzVMNy40OSwyOVoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8bGluZSB4MT0iMi4zMyIgeTE9IjM1Ljg4IiB4Mj0iMTcuODciIHkyPSI0Mi42NCIvPgogICAgICAgICAgPHJlY3QgeD0iOS44NSIgeT0iMzAuNzkiIHdpZHRoPSIwLjUiIGhlaWdodD0iMTYuOTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yOS45MyAzMi44NSkgcm90YXRlKC02Ni40OCkiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICA8cmVjdCB4PSI5LjMyIiB5PSIzMC43OSIgd2lkdGg9IjEuNTUiIGhlaWdodD0iMTYuOTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yOS45MyAzMi44NSkgcm90YXRlKC02Ni40OCkiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0xNy42OSw0My42OGwtMTYtNywuODEtMS44OCwxNiw3Wk0yLjM1LDM2LjQ2LDE3LjQzLDQzbC40MS0xTDIuNzYsMzUuNVoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8bGluZSB4MT0iMC40NyIgeTE9IjQ0LjYzIiB4Mj0iMTcuNDEiIHkyPSI0NC45NSIvPgogICAgICAgICAgPHJlY3QgeD0iOC42OSIgeT0iMzYuMzEiIHdpZHRoPSIwLjUiIGhlaWdodD0iMTYuOTUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zNi4wMSA1Mi44Nykgcm90YXRlKC04OC45KSIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgIDxyZWN0IHg9IjguMTciIHk9IjM2LjMxIiB3aWR0aD0iMS41NSIgaGVpZ2h0PSIxNi45NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM2LjAxIDUyLjg3KSByb3RhdGUoLTg4LjkpIi8+CiAgICAgICAgICA8cGF0aCBkPSJNMTcuNjQsNDYsLjIsNDUuNjRsMC0yLDE3LjQ0LjMzWk0uNzEsNDUuMTVsMTYuNDQuMzIsMC0xTC43Myw0NC4xMVoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8Y2lyY2xlIGN4PSIxMy4wNyIgY3k9IjE5LjMiIHI9IjEuMTkiLz4KICAgICAgICAgIDxwYXRoIGQ9Ik0xMy4wNywyMC43NGExLjQ0LDEuNDQsMCwxLDEsMS40NC0xLjQ0QTEuNDQsMS40NCwwLDAsMSwxMy4wNywyMC43NFptMC0yLjM4YS45NC45NCwwLDEsMCwuOTQuOTRBLjk1Ljk1LDAsMCwwLDEzLjA3LDE4LjM2WiIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgIDxwYXRoIGQ9Ik0xMy4wNywyMS4yN2EyLDIsMCwxLDEsMi0yQTIsMiwwLDAsMSwxMy4wNywyMS4yN1ptMC0yLjM4YS40MS40MSwwLDAsMC0uNDIuNDEuNDIuNDIsMCwwLDAsLjg0LDBBLjQxLjQxLDAsMCwwLDEzLjA3LDE4Ljg5WiIvPgogICAgICAgICAgPHBhdGggZD0iTTEzLjA3LDIxLjUyYTIuMjIsMi4yMiwwLDEsMSwyLjIxLTIuMjJBMi4yMiwyLjIyLDAsMCwxLDEzLjA3LDIxLjUyWm0wLTMuOTNhMS43MiwxLjcyLDAsMSwwLDEuNzEsMS43MUExLjcyLDEuNzIsMCwwLDAsMTMuMDcsMTcuNTlabTAsMi4zOGEuNjcuNjcsMCwxLDEsLjY3LS42N0EuNjcuNjcsMCwwLDEsMTMuMDcsMjBabTAtLjgzYS4xNy4xNywwLDAsMC0uMTcuMTZjMCwuMTkuMzQuMTkuMzQsMEEuMTcuMTcsMCwwLDAsMTMuMDcsMTkuMTRaIi8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPGNpcmNsZSBjeD0iNDMuNDMiIGN5PSIyNi42NyIgcj0iMS4xOSIvPgogICAgICAgICAgPHBhdGggZD0iTTQzLjQzLDI4LjExYTEuNDQsMS40NCwwLDEsMSwxLjQ0LTEuNDRBMS40NSwxLjQ1LDAsMCwxLDQzLjQzLDI4LjExWm0wLTIuMzhhLjk0Ljk0LDAsMSwwLC45NC45NEEuOTQuOTQsMCwwLDAsNDMuNDMsMjUuNzNaIi8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgPHBhdGggZD0iTTQzLjQzLDI4LjYzYTIsMiwwLDEsMSwyLTJBMiwyLDAsMCwxLDQzLjQzLDI4LjYzWm0wLTIuMzhhLjQyLjQyLDAsMSwwLC40Mi40MkEuNDIuNDIsMCwwLDAsNDMuNDMsMjYuMjVaIi8+CiAgICAgICAgICA8cGF0aCBkPSJNNDMuNDMsMjguODhhMi4yMSwyLjIxLDAsMSwxLDIuMjEtMi4yMUEyLjIxLDIuMjEsMCwwLDEsNDMuNDMsMjguODhabTAtMy45MmExLjcxLDEuNzEsMCwxLDAsMS43MSwxLjcxQTEuNzEsMS43MSwwLDAsMCw0My40MywyNVptMCwyLjM4YS42Ny42NywwLDEsMSwuNjctLjY3QS42Ny42NywwLDAsMSw0My40MywyNy4zNFptMC0uODRhLjE4LjE4LDAsMCwwLS4xNy4xN2MwLC4xOC4zNC4xOC4zNCwwQS4xOC4xOCwwLDAsMCw0My40MywyNi41WiIvPgogICAgICAgIDwvZz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8Zz4KICAgICAgICAgIDxjaXJjbGUgY3g9IjI0IiBjeT0iNDQuMSIgcj0iMS4xOSIvPgogICAgICAgICAgPHBhdGggZD0iTTI0LDQ1LjU1YTEuNDUsMS40NSwwLDEsMSwxLjQ0LTEuNDVBMS40NSwxLjQ1LDAsMCwxLDI0LDQ1LjU1Wm0wLTIuMzlhLjk1Ljk1LDAsMSwwLC45NC45NEEuOTUuOTUsMCwwLDAsMjQsNDMuMTZaIi8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgPHBhdGggZD0iTTI0LDQ2LjA3YTIsMiwwLDEsMSwyLTJBMiwyLDAsMCwxLDI0LDQ2LjA3Wm0wLTIuMzhhLjQyLjQyLDAsMSwwLC40Mi40MUEuNDEuNDEsMCwwLDAsMjQsNDMuNjlaIi8+CiAgICAgICAgICA8cGF0aCBkPSJNMjQsNDYuMzJhMi4yMiwyLjIyLDAsMSwxLDIuMjEtMi4yMkEyLjIxLDIuMjEsMCwwLDEsMjQsNDYuMzJabTAtMy45M2ExLjcyLDEuNzIsMCwxLDAsMS43MSwxLjcxQTEuNzIsMS43MiwwLDAsMCwyNCw0Mi4zOVptMCwyLjM4YS42Ny42NywwLDEsMSwuNjctLjY3QS42Ny42NywwLDAsMSwyNCw0NC43N1ptMC0uODNhLjE3LjE3LDAsMCwwLS4xNy4xNmMwLC4xOS4zNC4xOS4zNCwwQS4xNy4xNywwLDAsMCwyNCw0My45NFoiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=",
    shield:
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPHRpdGxlPnR0LVNoaWVsZDwvdGl0bGU+CiAgPGc+CiAgICA8cGF0aCBkPSJNMjUuOTQsNDhsLS40NS0uNTVxLS4zNy0uNDUtLjc1LS44N2MtLjE3LS4yLS4zNi0uNC0uNTQtLjU5bC0uMzEtLjMtLjI4LS4yM2E1OC44Niw1OC44NiwwLDAsMS0xMi4xOS0xMi42LDM1LDM1LDAsMCwxLTIuNDYtNCwxNS43LDE1LjcsMCwwLDEtLjcyLTEuNTZoMEM1LjQ5LDE5LjMzLDcuMTIsOS41LDgsOC4zQS43Mi43MiwwLDAsMSw4LjUyLDhhLjU1LjU1LDAsMCwxLC4yNSwwbC4wNiwwYTE1LjU5LDE1LjU5LDAsMCwwLDkuMjItLjc5LDEzLjE2LDEzLjE2LDAsMCwwLDQuODMtMy4xOCwxMS4wOCwxMS4wOCwwLDAsMCwyLTMuMTJjLjI2LS41Ny40OC0xLjA3LDEtMXMuNzYuNDcsMSwxYTEwLjk0LDEwLjk0LDAsMCwwLDIsMy4xMiwxMy4wNywxMy4wNywwLDAsMCw0LjgyLDMuMThBMTUuNjIsMTUuNjIsMCwwLDAsNDMsOGwuMDUsMGEuNTkuNTksMCwwLDEsLjI2LDAsLjcxLjcxLDAsMCwxLC41NS4zM2MuODQsMS4yLDIuNDcsMTEtLjI3LDE5LTEuNSw0LjMzLTQuNDYsOC42NS04LjgyLDEyLjg0YTQ5LjY2LDQ5LjY2LDAsMCwxLTYuNjgsNS40M2MtLjA2LjA2LS4xMy4xMi0uMTkuMTlhMjEuMjIsMjEuMjIsMCwwLDAtMS41NiwxLjcyWk05LjMyLDI2LjkxYy4xLjI2LDMuNDYsOC42NiwxNSwxNy42OWwuMzMuMjhhNC4zMSw0LjMxLDAsMCwxLC4zNy4zNmMuMi4yLjQuNDEuNTguNjJsLjMyLjM3Yy4zOC0uNDQuNzgtLjg3LDEuMi0xLjI4bC4yMi0uMjIuMTMtLjFBNDkuNDIsNDkuNDIsMCwwLDAsMzQsMzkuMzNjNC4yMi00LjA3LDcuMS04LjI0LDguNTMtMTIuNDFoMEEzMS45MywzMS45MywwLDAsMCw0NCwxNS4zNGEyNC43MSwyNC43MSwwLDAsMC0uODktNi4xNiwxNy4yMSwxNy4yMSwwLDAsMS05LjctLjkyQTE0LjQsMTQuNCwwLDAsMSwyOC4xNCw0LjhhMTEuNywxMS43LDAsMCwxLTIuMjEtMy4zNSwxMS44MywxMS44MywwLDAsMS0yLjIsMy4zNSwxNC40MSwxNC40MSwwLDAsMS01LjI0LDMuNDYsMTcuMTcsMTcuMTcsMCwwLDEtOS42OS45MiwyNC41MiwyNC41MiwwLDAsMC0uOSw2LjE2QTMyLjEsMzIuMSwwLDAsMCw5LjMyLDI2LjkxWiIvPgogICAgPGcgaWQ9Il9Hcm91cF8iIGRhdGEtbmFtZT0iJmx0O0dyb3VwJmd0OyI+CiAgICAgIDxwYXRoIGQ9Ik0yNS45My40NVYyNS4xMUw4LjA5LDI0LjY2YTE2LjEsMTYuMSwwLDAsMS0uOC00LjJjMC0uNCwwLS45MywwLTIsMC0yLC4wOS0zLjQ5LjEyLTQsLjE0LTMuMDUuMjgtMy44OC42Mi00LjgxYTEwLjA2LDEwLjA2LDAsMCwxLC41Mi0xLjE2LDE1LjczLDE1LjczLDAsMCwwLDkuNzItLjc3LDE2LjE3LDE2LjE3LDAsMCwwLDcuNS03WiIvPgogICAgPC9nPgogICAgPHBhdGggZD0iTTQzLjY2LDI1LjExYTI5LjMsMjkuMywwLDAsMS0yLjUyLDYuM0EyOS43MSwyOS43MSwwLDAsMSwzNC4wNSw0MGMtMSwxLTEuOTQsMS43Ny0yLjYzLDIuMzItLjUzLjQ0LTEsLjc1LTIuMjksMS43Ny0uOTQuNzQtMS4xOSwxLTEuNDIsMS4xNmExNy43NSwxNy43NSwwLDAsMC0xLjc4LDEuODN2LTIyWiIvPgogIDwvZz4KPC9zdmc+Cg==",
    slow:
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPHRpdGxlPnR0LVNsb3c8L3RpdGxlPgogIDxnPgogICAgPHBhdGggZD0iTTEyLjQ1LDM2LjMzYTExLjg0LDExLjg0LDAsMCwxLTQuMjctLjgsMTEuODIsMTEuODIsMCwwLDEtNS41LTQuNzUsMTQuMjEsMTQuMjEsMCwwLDEtMi4zLTcuODVBMTUuNjMsMTUuNjMsMCwwLDEsOC43Miw5Ljg3YzMuODgtMi4xMiw4LjM3LTIuNDcsMTMuMzMtMSw1LjU4LDEuNjIsMTAuMjcsNS43LDExLjY5LDEwLjE0QTkuODMsOS44MywwLDAsMSwzNCwyNS4xYTcuNDMsNy40MywwLDAsMS0xLjY4LDNBMTIuNSwxMi41LDAsMCwxLDI5LDMwLjMxbC0uMTcuMDgtNC43MS4wNVYyOC42OWw0LjMzLS4wNUExMC4yOCwxMC4yOCwwLDAsMCwzMSwyNi44NWE1LjU3LDUuNTcsMCwwLDAsMS4yNy0yLjI5LDguMTUsOC4xNSwwLDAsMC0uMjEtNWMtMS4yNS0zLjkyLTUuNDctNy41My0xMC41MS05LTQuNS0xLjMxLTguNTQtMS0xMiwuODhTMi4yMiwxNy4zOCwyLjEzLDIzYTEyLjQxLDEyLjQxLDAsMCwwLDIsNi44NiwxMC4yMywxMC4yMywwLDAsMCw0LjcsNC4wOSw5Ljc1LDkuNzUsMCwwLDAsNy4yOC0uMDksNy44Niw3Ljg2LDAsMCwwLDQuMTItMy43LDcuMzMsNy4zMywwLDAsMCwuNTItNC42MSw2LjU5LDYuNTksMCwwLDAtMi44Ni00LjQsNS40Myw1LjQzLDAsMCwwLTQuNjctLjc1LDQuMTgsNC4xOCwwLDAsMC0yLjUxLDIuMjIsNC4xLDQuMSwwLDAsMC0uMDksM0EzLDMsMCwwLDAsMTIsMjcuMzVhMi43OCwyLjc4LDAsMCwwLDIsLjE5LDEuNCwxLjQsMCwwLDAsLjg3LS41M0ExLjI4LDEuMjgsMCwwLDAsMTUsMjYuMWExLjYsMS42LDAsMCwwLS4yMi0uNTQsMS41MSwxLjUxLDAsMCwwLS40MS0uNDZsMS4wOC0xLjM5YTMuNTEsMy41MSwwLDAsMSwuODMuOTMsMy4yOSwzLjI5LDAsMCwxLC40NCwxLjE0LDMsMywwLDAsMS0uMzMsMi4xNCwzLjA2LDMuMDYsMCwwLDEtMS44MywxLjI5LDQuNTksNC41OSwwLDAsMS0zLjM5LS4zMkE0Ljc3LDQuNzcsMCwwLDEsOSwyNi4xMmE1Ljg1LDUuODUsMCwwLDEsLjEzLTQuMjYsNiw2LDAsMCwxLDMuNTMtMy4xNyw3LjE4LDcuMTgsMCwwLDEsNi4yLjkzLDguMjksOC4yOSwwLDAsMSwzLjYzLDUuNTEsOSw5LDAsMCwxLS42NSw1Ljc0LDkuNDIsOS40MiwwLDAsMS01LDQuNTRBMTAuNzQsMTAuNzQsMCwwLDEsMTIuNDUsMzYuMzNaIi8+CiAgICA8ZWxsaXBzZSBjeD0iMTQuODIiIGN5PSIyNC4zOCIgcng9IjEuMDYiIHJ5PSIwLjgyIi8+CiAgICA8cGF0aCBkPSJNMzYuMjIsNDIuNkgxLjg3bC0uMTgtLjFBMywzLDAsMCwxLC4wNywzOS4xOGE0LjI4LDQuMjgsMCwwLDEsMS40NC0yLjI1QTguNTcsOC41NywwLDAsMSwzLjI3LDM1LjZsLjg3LDEuNTJhNi4zMSw2LjMxLDAsMCwwLTEuMzksMS4wNmMtLjU4LjU3LS44Ny44Ny0uOTUsMS4zM2ExLjE4LDEuMTgsMCwwLDAsLjA2LjgxbDAsMGExLjI0LDEuMjQsMCwwLDAsLjQzLjQ3SDM0LjU2YzAtLjQxLDAtLjU5LDAtLjY1LS4wNi0uMjktLjMtLjU0LTEtMS4xOWE3LjU0LDcuNTQsMCwwLDAtMS4yLTEsMi4zNSwyLjM1LDAsMCwxLTEtMS4xNSwzLjc5LDMuNzksMCwwLDEsLjQ1LTMuMiw0LjUxLDQuNTEsMCwwLDEsMS40OS0xLjQ3bC4yLS4xNWEyMi45MywyMi45MywwLDAsMCwyLjY5LTIuNTZjLjU3LS41OS43OS0xLjEsMy41MS03LjU3bC4xNS0uMzVBNC45Myw0LjkzLDAsMCwxLDQyLDE4Ljc0YTMuNzksMy43OSwwLDAsMSwxLjQtLjM3LDMuMjQsMy4yNCwwLDAsMCwxLjI0LS4zMkEyLjU5LDIuNTksMCwwLDAsNDYsMTdhMiwyLDAsMCwwLC4yNC0xLjMzQTIuNTYsMi41NiwwLDAsMCw0NC45LDE0LjJhNi42LDYuNiwwLDAsMC02Ljg0LS4yLDkuMjgsOS4yOCwwLDAsMC0xLjcyLDEuNjUsMTMuNDQsMTMuNDQsMCwwLDAtMS44NywyLjU0bC0xLjU1LS44MkExNS42LDE1LjYsMCwwLDEsMzUsMTQuNDhhMTAuNjUsMTAuNjUsMCwwLDEsMi4wNi0xLjk0LDguMzIsOC4zMiwwLDAsMSw4Ljc2LjE5LDQuMjEsNC4yMSwwLDAsMSwyLjA4LDIuNTksMy42OSwzLjY5LDAsMCwxLS40NCwyLjU1LDQuMzQsNC4zNCwwLDAsMS0yLjA4LDEuNzcsNS4xNiw1LjE2LDAsMCwxLTEuODEuNDgsMS45MSwxLjkxLDAsMCwwLS43OC4xOGMtLjYyLjMyLS45Mi45NC0xLjM0LDEuOTRsLS4xNS4zNWMtMi44OCw2Ljg1LTMsNy4yNi0zLjg1LDguMWEyNi4wNSwyNi4wNSwwLDAsMS0yLjkzLDIuNzhsLS4yMy4xNWEzLDMsMCwwLDAtMSwuOTRBMi4wNiwyLjA2LDAsMCwwLDMzLDM2LjJjMCwuMTIuMDUuMTMuMzguMzZhOS41NSw5LjU1LDAsMCwxLDEuNDYsMS4xOSw0LjEyLDQuMTIsMCwwLDEsMS40NSwyLjE2LDguODgsOC44OCwwLDAsMSwwLDEuODZaIi8+CiAgICA8cmVjdCB4PSIzMi40NCIgeT0iMTcuMiIgd2lkdGg9IjIuMjciIGhlaWdodD0iMS43NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS42NyAzOC45Nykgcm90YXRlKC02MS41MikiLz4KICAgIDxwYXRoIGQ9Ik0zOS4yMSwxMi42bC0xLjc1LS4xMmE5LDksMCwwLDEsLjQ0LTIuMjcsMTAuNTIsMTAuNTIsMCwwLDEsMS42My0zLDE0LjA2LDE0LjA2LDAsMCwxLDEuMTItMS4zMWwxLjI2LDEuMjJhMTAuNjEsMTAuNjEsMCwwLDAtMSwxLjE0LDguNCw4LjQsMCwwLDAtMS4zNywyLjQ4QTcuMDYsNy4wNiwwLDAsMCwzOS4yMSwxMi42WiIvPgogICAgPGVsbGlwc2UgY3g9IjQxLjY5IiBjeT0iNi4zMSIgcng9IjEuMTUiIHJ5PSIwLjkxIi8+CiAgICA8cGF0aCBkPSJNNDQuMTgsMTIuNmwtMS43NS0uMTJhOSw5LDAsMCwxLC40NC0yLjI3LDEwLjUyLDEwLjUyLDAsMCwxLDEuNjMtMywxNCwxNCwwLDAsMSwxLjEyLTEuMzJsMS4yNiwxLjIzYTEwLjYxLDEwLjYxLDAsMCwwLTEsMS4xNCw4LjM5LDguMzksMCwwLDAtMS4zOCwyLjQ4QTcuNCw3LjQsMCwwLDAsNDQuMTgsMTIuNloiLz4KICAgIDxlbGxpcHNlIGN4PSI0Ni42NiIgY3k9IjYuMzEiIHJ4PSIxLjE1IiByeT0iMC45MSIvPgogIDwvZz4KPC9zdmc+Cg==",
    speed:
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogI2ZmZjsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHRpdGxlPnR0LXNwZWVkPC90aXRsZT4KICA8Zz4KICAgIDxnPgogICAgICA8cGF0aCBkPSJNMTEuNDMsMTguMjNhMTguODcsMTguODcsMCwwLDAtMS4yMyw0LjY4bDEuMDYsMGExNy4zOCwxNy4zOCwwLDAsMSwxLjMtNC42N1ptLS4zLDguMjEtMS4wNSwwYTE4LDE4LDAsMCwwLC41MiwzLjQ1bDEuMDksMEExOC41NCwxOC41NCwwLDAsMSwxMS4xMywyNi40NFpNNDEuMiwxMS4xNWMtLjI3LS4yMy0uNTQtLjQ2LS44Mi0uNjhhMTguNzYsMTguNzYsMCwwLDAtMTEtNEgyOC4zMmExOC44LDE4LjgsMCwwLDAtMTUsOC4yNGwxLjI3LDBhMTcuNzUsMTcuNzUsMCwxLDEtMS41LDE4LjY1bC0xLjE5LDBBMTguOCwxOC44LDAsMSwwLDQxLjIsMTEuMTVaTTEyLjI3LDMxLjY2bC0xLjE0LDBoMGwxLjE0LDBabS0yLjIyLTcsMS4wNiwwaDBaIi8+CiAgICAgIDxwYXRoIGQ9Ik0yOC44NSw0NC40N2ExOS4xNywxOS4xNywwLDAsMS0xNy4yOS0xMC45bC0uMjQtLjUxLDIsMCwuMDkuMThBMTcuNDEsMTcuNDEsMCwxLDAsMTQuODUsMTVsLS4xMS4xNS0yLjA5LS4wNS4zNi0uNTNhMTkuMjEsMTkuMjEsMCwwLDEsMTUuMy04LjM4aDEuMDdhMTksMTksMCwwLDEsMTEuMjEsNGMuMjcuMjEuNTUuNDUuODQuNjloMEExOS4xNCwxOS4xNCwwLDAsMSwyOC44NSw0NC40N1pNMTIuNDQsMzMuNzhhMTguNjMsMTguNjMsMCwwLDAsNi40NCw3LjA3QTE4LjQ1LDE4LjQ1LDAsMCwwLDQxLDExLjQxYy0uMjctLjIzLS41NC0uNDYtLjgxLS42NmExOC4yOCwxOC4yOCwwLDAsMC0xMC44LTMuODhoLTFBMTguNTEsMTguNTEsMCwwLDAsMTQsMTQuNDNoLjQ0YTE4LjA5LDE4LjA5LDAsMSwxLTEuNTUsMTkuMzRaTTEzLjEsMzIsMTAuNzksMzJ2LS43bDEuODIsMHYuMjFabS0uOTUtMS43OC0xLjgyLDBMMTAuMjYsMzBhMTksMTksMCwwLDEtLjUzLTMuNTFsMC0uMzcsMS43NSwwLDAsLjMyQTE2Ljc5LDE2Ljc5LDAsMCwwLDEyLDI5LjhabS0xLjI4LS43MmguMzdhMTguNDIsMTguNDIsMCwwLDEtLjQzLTIuNzZoLS4zNkExOC40NiwxOC40NiwwLDAsMCwxMC44NywyOS41M1pNMTEuNDUsMjUsMTAsMjVsMC0uNjksMS4zOSwwWm0uMTEtMS43Ni0xLjc2LDAsMC0uMzlhMTksMTksMCwwLDEsMS4yNi00Ljc2bC4wOS0uMjIsMS44OSwwLS4yMS40OEExNywxNywwLDAsMCwxMS42LDIzWm0tMS0uNzFIMTFhMTcuNzMsMTcuNzMsMCwwLDEsMS4wOS00aC0uMzlBMTguOCwxOC44LDAsMCwwLDEwLjU5LDIyLjU3WiIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxyZWN0IHg9IjIxLjE3IiB5PSIyMy4wNCIgd2lkdGg9IjIwLjYzIiBoZWlnaHQ9IjEuMDUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC03LjM3IDI5LjYzKSByb3RhdGUoLTQ1LjY5KSIvPgogICAgICA8cGF0aCBkPSJNMjQuNjYsMzEuOGwtMS4yNS0xLjIyLDE0LjktMTUuMjYsMS4yNSwxLjIyWm0tLjI3LTEuMjMuMjYuMjVMMzguNTgsMTYuNTZsLS4yNi0uMjZaIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPGNpcmNsZSBjbGFzcz0iY2xzLTEiIGN4PSIyOS4wMiIgY3k9IjI2LjIiIHI9IjIuOTkiLz4KICAgICAgICA8cGF0aCBkPSJNMjksMjkuNTNhMy4zMywzLjMzLDAsMSwxLDMuMzQtMy4zM0EzLjMzLDMuMzMsMCwwLDEsMjksMjkuNTNabTAtNmEyLjY0LDIuNjQsMCwxLDAsMi42NCwyLjY0QTIuNjQsMi42NCwwLDAsMCwyOSwyMy41NloiLz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBkPSJNMjksMjkuNzFhMy41MiwzLjUyLDAsMSwxLDMuNTItMy41MUEzLjUxLDMuNTEsMCwwLDEsMjksMjkuNzFabTAtNmEyLjQ2LDIuNDYsMCwxLDAsMi40NiwyLjQ2QTIuNDYsMi40NiwwLDAsMCwyOSwyMy43NFoiLz4KICAgICAgICA8cGF0aCBkPSJNMjksMzAuMDZhMy44NiwzLjg2LDAsMSwxLDMuODYtMy44NkEzLjg2LDMuODYsMCwwLDEsMjksMzAuMDZabTAtN2EzLjE3LDMuMTcsMCwxLDAsMy4xNywzLjE3QTMuMTgsMy4xOCwwLDAsMCwyOSwyM1ptMCw2YTIuODEsMi44MSwwLDEsMSwyLjgxLTIuODFBMi44LDIuOCwwLDAsMSwyOSwyOVptMC00LjkyYTIuMTEsMi4xMSwwLDEsMCwyLjEyLDIuMTFBMi4xMSwyLjExLDAsMCwwLDI5LDI0LjA5WiIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHJlY3QgeD0iMjYuMDMiIHk9IjMiIHdpZHRoPSI1LjQ1IiBoZWlnaHQ9IjEuMDUiLz4KICAgICAgPHBhdGggZD0iTTMxLjgzLDQuNEgyNS42OVYyLjY1aDYuMTRabS01LjQ1LS42OWg0Ljc2VjMuMzVIMjYuMzhaIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHJlY3QgeD0iMjguMzIiIHk9IjMuNTMiIHdpZHRoPSIxLjA1IiBoZWlnaHQ9IjMuNTIiLz4KICAgICAgPHBhdGggZD0iTTI5LjcyLDcuMzlIMjhWMy4xOGgxLjc1Wm0tMS0uNjlIMjlWMy44N2gtLjM2WiIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iNDAuNzcgMTEuNTUgNDAuMDUgMTAuNzggNDIuNDggOC40OCA0MC44MSA3LjEgNDEuNDkgNi4yOSA0NS43MSA5LjggNDUuMDMgMTAuNjEgNDMuMjkgOS4xNiA0Mi45MyA5LjUyIDQwLjc3IDExLjU1Ii8+CiAgICAgIDxwYXRoIGQ9Ik00MC43NiwxMmwtMS4yLTEuMjdMNDIsOC41LDQwLjMyLDcuMTQsNDEuNDQsNS44bDQuNzUsNEw0NS4wNywxMS4xLDQzLjMxLDkuNjNsLS4xNC4xNFptLS4yMi0xLjI0LjI1LjI2LDEuOS0xLjc5LjU4LS41OEw0NSwxMC4xMmwuMjMtLjI3TDQxLjUzLDYuNzdsLS4yMy4yOEw0Myw4LjQ3WiIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMjEuODQgMTQuOTUgMjEuOCAxNi43MSAxMy40NCAxNi41MiAxMi4yNSAxNi40OSA2LjM3IDE2LjM2IDYuMzMgMTYuMzYgNi4zNyAxNC42IDEzLjMgMTQuNzYgMTQuNTcgMTQuNzkgMjEuODQgMTQuOTUiLz4KICAgICAgICA8cGF0aCBkPSJNMjIuMTQsMTcuMDYsNiwxNi42OWwwLTIuNDQsMTYuMTYuMzZaTTYuNjksMTZsMTQuNzcuMzMsMC0xLjA2TDYuNzEsMTVaIi8+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPHBvbHlnb24gcG9pbnRzPSIyMS44IDE2LjcxIDIxLjggMTYuNzEgMTMuNDQgMTYuNTIgMjEuOCAxNi43MSIvPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMjIuMTQgMTcuMDYgMTMuNDMgMTYuODcgMTMuNDQgMTYuMTcgMjIuMTQgMTYuMzcgMjIuMTQgMTcuMDYiLz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMTUuODYgMjMuMDQgMTUuODIgMjQuNzkgMTEuMTEgMjQuNjggMTAuMDUgMjQuNjYgMC40IDI0LjQ0IDAuMzUgMjQuNDQgMC40IDIyLjY4IDEwLjIgMjIuOTEgMTEuMjYgMjIuOTMgMTUuODYgMjMuMDQiLz4KICAgICAgICA8cGF0aCBkPSJNMTYuMTYsMjUuMTUsMCwyNC43OGwuMDYtMi40NSwxNi4xNS4zN1pNLjcxLDI0LjFsMTQuNzcuMzQsMC0xLjA2TC43MywyM1oiLz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8cG9seWdvbiBwb2ludHM9IjE1LjgyIDI0Ljc5IDE1LjgyIDI0Ljc5IDExLjExIDI0LjY5IDEwLjA1IDI0LjY2IDExLjExIDI0LjY4IDE1LjgyIDI0Ljc5Ii8+CiAgICAgICAgPHBvbHlnb24gcG9pbnRzPSIxNi4xNyAyNS4xNSAxMC4wNCAyNS4wMSAxMC4wNiAyNC4zMiAxNi4xNyAyNC40NSAxNi4xNyAyNS4xNSIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIxOS4zOCAzMC4wNyAxOS4zNCAzMS44MiAxMi4yNyAzMS42NiAxMS4xMyAzMS42NCAzLjg3IDMxLjQ3IDMuOTEgMjkuNzEgMTAuNiAyOS44NyAxMS42OSAyOS44OSAxOS4zOCAzMC4wNyIvPgogICAgICA8cGF0aCBkPSJNMTkuNjgsMzIuMTgsMy41MiwzMS44MWwwLTIuNDUsMTYuMTYuMzdaTTQuMjIsMzEuMTMsMTksMzEuNDdsMC0xLjA2TDQuMjUsMzAuMDdaIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K"
  };
  this.icons = {};
  Object.entries(icons).forEach(([name, data]) => {
    const image = new Image();
    image.src = data;
    image.onload = function() {
      game.icons[name] = image;
    };
  });
  var game = this;
}
}

//
//				code by Isaiah Smith
//		technostalgic.itch.io  |  @technostalgicGM
//
//raycast functionality integrated with matter.js since there
//is no built-in method for raycasting that returns the ray's
//intersection points

//function 'raycast' - returns an array of 'raycol' objects
//param 'bodies' - bodies to check collision with; passed
//	through 'Matter.Query.ray()'
//param 'start' - start point of raycast
//param 'end' - end point of raycast
//param 'sort' - whether or not the ray collisions should be
//	sorted based on distance from the origin
function raycast(bodies, start, end, sort = true) {
  //convert the start & end parameters to my custom
  //'vec2' object type
  start = vec2.fromOther(start);
  end = vec2.fromOther(end);

  //The bodies that the raycast will be tested against
  //are queried and stored in the variable 'query'.
  //This uses the built-in raycast method which takes
  //advantage of the broad-phase collision optomizations
  //instead of iterating through each body in the list
  var query = Matter.Query.ray(bodies, start, end);

  //'cols': the array that will contain the ray
  //collision information
  var cols = [];
  //'raytest': the ray object that will be tested for
  //collision against the bodies
  var raytest = new ray(start, end);

  //Next, since all the bodies that the ray collides with
  //have already been queried, we iterate through each
  //one to see where the ray intersects with the body
  //and gather other information
  for (var i = query.length - 1; i >= 0; i--) {
    var bcols = ray.bodyCollisions(raytest, query[i].body);
    for (var k = bcols.length - 1; k >= 0; k--) {
      cols.push(bcols[k]);
    }
  }

  //if desired, we then sort the collisions based on the
  //disance from the ray's start
  if (sort)
    cols = cols.sort(function(a, b) {
      return a.point.distance(start) - b.point.distance(start);
    });

  return cols;
}

//data type that contains information about an intersection
//between a ray and a body
class raycol {
  //initailizes a 'raycol' object with the given data
  //param 'body' - stores the body that the ray has
  //	collided with
  //param 'point' - stores the collision point
  //param 'normal' - stores the normal of the edge that
  //	the ray collides with
  //param 'verts' - stores the vertices of the edge that
  //	the ray collides with
  constructor(body, point, normal, verts) {
    this.body = body;
    this.point = point;
    this.normal = normal;
    this.verts = verts;
  }
}

//data type that contains information and methods for a
//ray object
class ray {
  //initializes a ray instance with the given parameters
  //param 'start' - the starting point of the ray
  //param 'end' - the ending point of the ray
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  yValueAt(x) {
    //returns the y value on the ray at the specified x
    //slope-intercept form:
    //y = m * x + b
    return this.offsetY + this.slope * x;
  }
  xValueAt(y) {
    //returns the x value on the ray at the specified y
    //slope-intercept form:
    //x = (y - b) / m
    return (y - this.offsetY) / this.slope;
  }

  pointInBounds(point) {
    //checks to see if the specified point is within
    //the ray's bounding box (inclusive)
    var minX = Math.min(this.start.x, this.end.x);
    var maxX = Math.max(this.start.x, this.end.x);
    var minY = Math.min(this.start.y, this.end.y);
    var maxY = Math.max(this.start.y, this.end.y);
    return (
      point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    );
  }
  calculateNormal(ref) {
    //calulates the normal based on a specified
    //reference point
    var dif = this.difference;

    //gets the two possible normals as points that lie
    //perpendicular to the ray
    var norm1 = dif.normalized().rotate(Math.PI / 2);
    var norm2 = dif.normalized().rotate(Math.PI / -2);

    //returns the normal that is closer to the provided
    //reference point
    if (
      this.start.plus(norm1).distance(ref) <
      this.start.plus(norm2).distance(ref)
    )
      return norm1;
    return norm2;
  }

  get difference() {
    //pretty self explanitory
    return this.end.minus(this.start);
  }
  get slope() {
    var dif = this.difference;
    return dif.y / dif.x;
  }
  get offsetY() {
    //the y-offset at x = 0, in slope-intercept form:
    //b = y - m * x
    //offsetY = start.y - slope * start.x
    return this.start.y - this.slope * this.start.x;
  }
  get isHorizontal() {
    return compareNum(this.start.y, this.end.y);
  }
  get isVertical() {
    return compareNum(this.start.x, this.end.x);
  }

  static intersect(rayA, rayB) {
    //returns the intersection point between two rays
    //null if no intersection

    //conditional checks for axis aligned rays
    if (rayA.isVertical && rayB.isVertical) return null;
    if (rayA.isVertical)
      return new vec2(rayA.start.x, rayB.yValueAt(rayA.start.x));
    if (rayB.isVertical)
      return new vec2(rayB.start.x, rayA.yValueAt(rayB.start.x));
    if (compareNum(rayA.slope, rayB.slope)) return null;
    if (rayA.isHorizontal)
      return new vec2(rayB.xValueAt(rayA.start.y), rayA.start.y);
    if (rayB.isHorizontal)
      return new vec2(rayA.xValueAt(rayB.start.y), rayB.start.y);

    //slope intercept form:
    //y1 = m2 * x + b2; where y1 = m1 * x + b1:
    //m1 * x + b1 = m2 * x + b2:
    //x = (b2 - b1) / (m1 - m2)
    var x = (rayB.offsetY - rayA.offsetY) / (rayA.slope - rayB.slope);
    return new vec2(x, rayA.yValueAt(x));
  }
  static collisionPoint(rayA, rayB) {
    //returns the collision point of two rays
    //null if no collision
    var intersection = ray.intersect(rayA, rayB);
    if (!intersection) return null;
    if (!rayA.pointInBounds(intersection)) return null;
    if (!rayB.pointInBounds(intersection)) return null;
    return intersection;
  }
  static bodyEdges(body) {
    //returns all of the edges of a body in the
    //form of an array of ray objects
    var r = [];
    for (var i = body.parts.length - 1; i >= 0; i--) {
      for (var k = body.parts[i].vertices.length - 1; k >= 0; k--) {
        var k2 = k + 1;
        if (k2 >= body.parts[i].vertices.length) k2 = 0;
        var tray = new ray(
          vec2.fromOther(body.parts[i].vertices[k]),
          vec2.fromOther(body.parts[i].vertices[k2])
        );

        //stores the vertices inside the edge
        //ray for future reference
        tray.verts = [body.parts[i].vertices[k], body.parts[i].vertices[k2]];

        r.push(tray);
      }
    }
    return r;
  }
  static bodyCollisions(rayA, body) {
    //returns all the collisions between a specified ray
    //and body in the form of an array of 'raycol' objects
    var r = [];

    //gets the edge rays from the body
    var edges = ray.bodyEdges(body);

    //iterates through each edge and tests for collision
    //with 'rayA'
    for (var i = edges.length - 1; i >= 0; i--) {
      //gets the collision point
      var colpoint = ray.collisionPoint(rayA, edges[i]);

      //if there is no collision, then go to next edge
      if (!colpoint) continue;

      //calculates the edge's normal
      var normal = edges[i].calculateNormal(rayA.start);

      //adds the ray collision to the return array
      r.push(new raycol(body, colpoint, normal, edges[i].verts));
    }

    return r;
  }
}

//in order to avoid miscalculations due to floating points
//error, which for whatever reason javascript has a ton of
//example:
//var m = 6; m -= 1; m -= 3; m += 4
//now 'm' probably equals 6.0000000008361 or something stupid
function compareNum(a, b, leniency = 0.00001) {
  return Math.abs(b - a) <= leniency;
}

//
//included external dependencies:
//
//2d vector data type; contains information and methods for
//2-dimensional vectors
class vec2 {
  //initailizes a 'vec2' object with specified values
  constructor(x = 0, y = x) {
    this.x = x;
    this.y = y;
  }

  normalized(magnitude = 1) {
    //returns a vector 2 with the same direction as this but
    //with a specified magnitude
    return this.multiply(magnitude / this.distance());
  }
  get inverted() {
    //returns the opposite of this vector
    return this.multiply(-1);
  }
  multiply(factor) {
    //returns this multiplied by a specified factor
    return new vec2(this.x * factor, this.y * factor);
  }
  plus(vec) {
    //returns the result of this added to another
    //specified 'vec2' object
    return new vec2(this.x + vec.x, this.y + vec.y);
  }
  minus(vec) {
    //returns the result of this subtracted by another
    //specified 'vec2' object
    return this.plus(vec.inverted);
  }
  rotate(rot) {
    //rotates the vector by the specified angle
    var ang = this.direction;
    var mag = this.distance();
    ang += rot;
    return vec2.fromAng(ang, mag);
  }
  toPhysVector() {
    //converts this to a vector compatible with the
    //matter.js physics engine
    return Matter.Vector.create(this.x, this.y);
  }

  get direction() {
    //returns the angle this vector is pointing in radians
    return Math.atan2(this.y, this.x);
  }
  distance(vec = new vec2()) {
    //returns the distance between this and a specified
    //'vec2' object
    var d = Math.sqrt(
      Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2)
    );
    return d;
  }

  clone() {
    //returns a new instance of a 'vec2' object with the
    //same value
    return new vec2(this.x, this.y);
  }
  static fromAng(angle, magnitude = 1) {
    //returns a vector which points in the specified angle
    //and has the specified magnitude
    return new vec2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }
  static fromOther(vector) {
    //converts other data types that contain 'x' and 'y'
    //properties to a 'vec2' object type
    return new vec2(vector.x, vector.y);
  }

  toString() {
    return "vector<" + this.x + ", " + this.y + ">";
  }
}
