(function Game() {
    var PLAYERS_ONLINE;
    var LEVEL_GLOBAL;

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
        Bodies = Matter.Bodies;

    //broadcast actions
    var ACTION_MOVE = 0x0001;
    var ACTION_SHOOT = 0x0002;
    var ACTION_SPAWN = 0x0003;
    var ACTION_DIE = 0x0004;
    var ACTION_INIT = 0x0005;

    var player_me = {};

    var debug = false;
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
            num0: 96
        },

        player: {
            appearance: {
                baseWidth: 22,
                baseHeight: 28,
                baseRadius: 8,
                shooterWidth: 6,
                shooterLength: 20,
                chamfer: 0,
                darkenColor: 0.76
            },
            speed: {
                turn: 0.085,
                forward: 0.0018
            },
            path: {
                enabled: true,
                wheelWidth: 10
            },
            physics: {
                density: 0.1, //default
                friction: 0,
                frictionAir: 0.2, //TODO 0.1
                frictionStatic: 0,
                restitution: 0.3,
                shards: {
                    density: 0.001,
                    friction: 0,
                    frictionAir: 0.05,
                    frictionStatic: 0,
                    restitution: 0.8
                }
            }
        },
        bullet: {
            maximum: 60,
            disappear: 10000,
            speed: 3,
            appearance: {
                size: 3
            },
            physics: {
                density: Number.POSITIVE_INFINITY,
                friction: 0,
                frictionAir: 0,
                frictionStatic: 0,
                restitution: 1
            }
        },
        level: {
            appearance: {
                color: "#ffffff",
                thickness: 6,
                cellsize: 62,
                mazesize: 12,
                shadow: true
            },
            physics: {
                density: Math.pow(10, 10),
                friction: 0,
                frictionAir: 0,
                frictionStatic: 0,
                restitution: 0,
                isStatic: true
            }
        },
        render: {
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            background: '#e0e0e0',
            wireframeBackground: '#222',
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
        },
        engine: {
            enableSleeping: false,
            positionIterations: 10,
            velocityIterations: 10
        },
        world: {
            gravity: { x: 0, y: 0 }
        }
    };
    this.input = {
        mouse: {
            x: 0,
            y: 0
        },
        left: false,
        right: false
    };
    this.players = [];

    this.keyEventHandler = function (code, down) {
        var keys = Object.keys(this.settings.keys);
        for (var i = 0; i < keys.length; i++) {
            this.input[keys[i]] = code == this.settings.keys[keys[i]] ? down : this.input[keys[i]];
        }
    };
    this.initialize = function (init_id) {
        log("Game::initialize");
        document.addEventListener("keydown", function (evt) {
            this.keyEventHandler(evt.keyCode, true);
            console.log(evt.keyCode);
        }.bind(this));
        document.addEventListener("keyup", function (evt) {
            this.keyEventHandler(evt.keyCode, false);
        }.bind(this));

        //create an engine
        this.engine = Engine.create(this.settings.engine);

        this.engine.world = World.create(this.settings.world);

        //create a renderer
        this.render = Render.create({
            element: document.body,
            engine: this.engine,
            options: this.settings.render
        });
        this.world = this.engine.world;

        //create two boxes and a ground
        //var boxA = Bodies.rectangle(400, 200, 80, 80, { chamfer: 3 });
        //var boxB = Bodies.rectangle(450, 50, 80, 80);
        player_me = new Player();
        player_me.spawn();
        player_me.broadcastSpawn();
        player_me.id = init_id;
        this.players[init_id] = player_me;
        if (PLAYERS_ONLINE !== undefined) {
            for (var i = 0; i < PLAYERS_ONLINE.length; i++) {
                var u = PLAYERS_ONLINE[i];
                var user = new Player();
                user.spawn();
                user.id = u.ID;
                user.name = u.name;
                user.color = new Color(u.color);
                Body.setPosition(u.position.x, u.position.y);
                Body.setAngle(u.angle);
            }
        }

        if (LEVEL_GLOBAL !== undefined) {
            new Level().spawn(LEVEL_GLOBAL.size, LEVEL_GLOBAL.size, LEVEL_GLOBAL.horiz, LEVEL_GLOBAL.verti);
        } else new Level().generate();

        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        //add bounds
        /*World.add(this.world, [
         Bodies.rectangle(w / 2, h * 1.5, w * 3, h, {isStatic: true}),
         Bodies.rectangle(w / 2, -h * 0.5, w * 3, h, {isStatic: true}),
         Bodies.rectangle(-w * 0.5, h / 2, w, h, {isStatic: true}),
         Bodies.rectangle(w * 1.5, h / 2, w, h, {isStatic: true})
         ]);*/

        //create mouse
        var mouse = Mouse.create(this.render.canvas);
        this.render.mouse = mouse;
        // add mouse control
        var mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        // get the center of the viewport
        var viewportCenter = {
            x: w * 0.5,
            y: h * 0.5
        };

        // keep track of current bounds scale (view zoom)
        var boundsScaleTarget = 1,
            boundsScale = {
                x: 1,
                y: 1
            };


        //run the engine
        Engine.run(this.engine);

        //run the renderer
        Render.run(this.render);

        // use the engine tick event to control our view
        Bounds.translate(this.render.bounds, Vector.sub(player_me.body.position, viewportCenter));
        Events.on(this.engine, 'beforeTick', function () {
            var world = game.engine.world,
                translate;

            // mouse wheel controls zoom
            var scaleFactor = mouseConstraint.mouse.wheelDelta * -0.1;
            if (scaleFactor !== 0) {
                if ((scaleFactor < 0 && boundsScale.x >= 0.6) || (scaleFactor > 0 && boundsScale.x <= 1.4)) {
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
                game.render.bounds.max.x = game.render.bounds.min.x + game.render.options.width * boundsScale.x;
                game.render.bounds.max.y = game.render.bounds.min.y + game.render.options.height * boundsScale.y;

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
            var player_abs = {};
            player_abs.x = (player_me.body.position.x - game.render.bounds.min.x) / boundsScale.x;
            player_abs.y = (player_me.body.position.y - game.render.bounds.min.y) / boundsScale.y;

            var deltaCenter = Vector.sub(player_abs, viewportCenter),
                centerDist = Vector.magnitude(deltaCenter);

            // translate the view if player has moved over 50px from the center of viewport
            if (centerDist > 50) {
                // create a vector to translate the view, allowing the user to control view speed
                var direction = Vector.normalise(deltaCenter),
                    speed = Math.min(10, Math.pow(centerDist - 50, 2) * 0.0002);

                translate = Vector.mult(direction, speed);

                // prevent the view moving outside the world bounds
                if (game.render.bounds.min.x + translate.x < world.bounds.min.x)
                    translate.x = world.bounds.min.x - game.render.bounds.min.x;

                if (game.render.bounds.max.x + translate.x > world.bounds.max.x)
                    translate.x = world.bounds.max.x - game.render.bounds.max.x;

                if (game.render.bounds.min.y + translate.y < world.bounds.min.y)
                    translate.y = world.bounds.min.y - game.render.bounds.min.y;

                if (game.render.bounds.max.y + translate.y > world.bounds.max.y)
                    translate.y = world.bounds.max.y - game.render.bounds.max.y;

                // move the view
                Bounds.translate(game.render.bounds, translate);

                // we must update the mouse too
                Mouse.setOffset(mouse, game.render.bounds.min);
            }
        });

        Events.on(this.engine, 'collisionStart', function (event) {
            var i, pair,
                length = event.pairs.length;

            var db = {};
            for (i = 0; i < length; i++) {
                pair = event.pairs[i];
                Events.trigger(pair.bodyA.parent, 'collision', { with: pair.bodyB, pair: pair, new_collision: !db[pair.bodyB.label] });
                Events.trigger(pair.bodyB.parent, 'collision', { with: pair.bodyA, pair: pair, new_collision: !db[pair.bodyB.label] });

                if (db[pair.bodyA.label] == undefined) db[pair.bodyA.label] = true;
                if (db[pair.bodyB.label] == undefined) db[pair.bodyB.label] = true;
            }
        });
    };

    this.broadcast = function (action, message) {
        var arr = [];
        arr[0] = action;
        arr = arr.concat(message);
        for (var i = 0; i < arr.length; i++) if(Number.NaN == arr[i]) return;// arr[i] = Math.floor(arr[i]);
        //conn.send(JSON.stringify(arr));
    };
    this.receive = function (data) {
        var arr = JSON.parse(data);
        var ACTION = arr[1];
        var ID = arr[0];
        if (ACTION == ACTION_MOVE && ID != player_me.id) {
            this.players[ID].receiveMove([arr[2], arr[3], arr[4]]);
        }
        if (ACTION == ACTION_SPAWN) {
            var user = new Player();
            user.id = ID;
            user.name = arr[5];
            user.color = new Color(arr[6]);
            user.spawn([arr[2], arr[3]]);
            Body.setAngle(user.body, arr[4] / 1000);
            this.players[ID] = user;
        }
        if (ACTION == ACTION_INIT) {
            game.initialize(ID);
        }
    };

    function Level() {
        this.walls = [];
        this.settings = game.settings.level;
        this.generate = function () {
            //remove old stuff
            if (this.walls.length > 0) {
                World.remove(game.world, this.walls);
                this.walls = [];
            }

            var x = this.settings.appearance.mazesize;
            var y = this.settings.appearance.mazesize;
            var n = x * y - 1;
            if (n < 0) {
                alert("illegal maze dimensions");
                return;
            }
            var horiz = [];
            for (var j = 0; j < x + 1; j++) horiz[j] = [];
            var verti = [];
            for (var j = 0; j < y + 1; j++) verti[j] = [];
            var here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)];
            var path = [here];
            var unvisited = [];
            for (var j = 0; j < x + 2; j++) {
                unvisited[j] = [];
                for (var k = 0; k < y + 1; k++)
                    unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
            }
            while (0 < n) {
                var potential = [[here[0] + 1, here[1]], [here[0], here[1] + 1],
                [here[0] - 1, here[1]], [here[0], here[1] - 1]];
                var neighbors = [];
                for (var j = 0; j < 4; j++)
                    if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
                        neighbors.push(potential[j]);
                if (neighbors.length) {
                    n = n - 1;
                    next = neighbors[Math.floor(Math.random() * neighbors.length)];
                    unvisited[next[0] + 1][next[1] + 1] = false;
                    if (next[0] == here[0])
                        horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
                    else
                        verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
                    path.push(here = next);
                } else
                    here = path.pop();
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
                            while (!done) {
                                var which = Math.floor(Math.random() * 4);
                                if (tried.indexOf(which) == -1) tried.push(which);
                                //Does the wall I'm trying to remove have more than 1 connection?
                                var bubble = countConnections(i, j, which) < 2;
                                //if the blocks surrounding me have a wall of 0 connections, continue searching
                                var dont_remove = false;
                                if (!places[which] && tried.length < 4) {
                                    removeWall(i, j, which);
                                    for (var h = 0; h < 4; h++) {
                                        dont_remove = dont_remove || countConnections(i - 1, j - 1, h) < 2;
                                        dont_remove = dont_remove || countConnections(i - 1, j, h) < 2;
                                        dont_remove = dont_remove || countConnections(i - 1, j + 1, h) < 2;
                                        dont_remove = dont_remove || countConnections(i, j - 1, h) < 2;
                                        dont_remove = dont_remove || countConnections(i, j + 1, h) < 2;
                                        dont_remove = dont_remove || countConnections(i + 1, j - 1, h) < 2;
                                        dont_remove = dont_remove || countConnections(i + 1, j, h) < 2;
                                        dont_remove = dont_remove || countConnections(i + 1, j + 1, h) < 2;
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
            function countConnections(x, y, wall_index) {
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
                }
                function countThem(pl, pl2) {
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

            function removeWall(x, y, wall_index) {
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

            function placeWall(x, y, wall_index) {
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
        this.spawn = function (x, y, horiz, verti) {
            //spawn bodies
            var w = game.render.canvas.width;
            var h = game.render.canvas.height;
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
            var goffs = { x: w / 2 - (ch * x / 2), y: h / 2 - (ch * y / 2) };
            for (var i = 0; i < x; i++) {
                for (var j = 0; j < y; j++) {
                    if ((!horiz[j][i] || horiz[j][i] == "dell") && i != x - 1) {
                        this.walls.push(Bodies.rectangle(goffs.x + offs.x + ch * (i + 0.5), goffs.y + offs.y + ch * (j), th, ch + th, horiz[j][i] == "del" ? settings_del : settings_vert));
                    }
                    if ((!verti[j][i] || verti[j][i] == "dell") && j != y - 1) {
                        this.walls.push(Bodies.rectangle(goffs.x + offs.x + ch * (i), goffs.y + offs.y + ch * (j + 0.5), ch + th, th, verti[j][i] == "del" ? settings_del : settings_horiz));
                    }
                }
            }
            //console.log(JSON.stringify({size: this.settings.appearance.mazesize, horiz: horiz, verti: verti}));

            //add bounds
            this.walls.push(Bodies.rectangle(goffs.x + ch * x / 2, goffs.y + -1000, 4000, 2000, settings_horiz));
            this.walls.push(Bodies.rectangle(goffs.x + ch * x / 2, goffs.y + ch * x + 1000, 4000, 2000, settings_horiz));
            this.walls.push(Bodies.rectangle(goffs.x + -1000, goffs.y + ch * x / 2, 2000, ch * x, settings_vert));
            this.walls.push(Bodies.rectangle(goffs.x + ch * x + 1000, goffs.y + ch * x / 2, 2000, ch * x, settings_vert));

            World.add(game.world, this.walls);
        };
    }

    var bid = 0;

    function Bullet() {
        this.type = 0;
        this.id = bid++;
        this.body = {};
        this.settings = game.settings.bullet;
        this.color = new Color("#222222");

        var has_spawn = false;
        this.spawn = function (position, angle) {
            if (has_spawn) return;
            has_spawn = true;

            //set up keyboard controls

            var app = this.settings.appearance;
            var phy = this.settings.physics;
            var parts = {
                parts: [
                    Bodies.circle(position.x, position.y, this.settings.appearance.size, {
                        render: { fillStyle: this.color.toString() },
                        label: "Bullet " + this.id
                    })
                ],
                label: "Bullet " + this.id
            };

            this.body = Body.create(Util.merge([app, phy, parts]));

            World.add(game.world, [this.body]);

            Body.applyForce(this.body, this.body.position, {
                x: Math.cos(angle - (Math.PI / 2)) * this.settings.speed / 10000,
                y: Math.sin(angle - (Math.PI / 2)) * this.settings.speed / 10000
            });

            Events.on(game.engine, "beforeUpdate", function () {
                this.update();
            }.bind(this));

            Events.on(this.body, 'collision', function (e) {
                this.collision(e);
            }.bind(this));
        };
        this.update = function () {

        };
        this.collision = function (e) {
            var id1 = e.with.label.split(" ")[1];
            if (collidedWith("Player")) {
                //This is the part when you FUCKING DIE
                this.impact(game.players[parseInt(id1)]);
            }
            else if (collidedWith("Shard")) {
                Body.setVelocity(e.with, this.body.velocity);
                this.destroy();
            }
            else if (e.new_collision) {
                //R =  V - 2*(V dot N)*N
                var new_velocity = Vector.sub(this.body.velocity, Vector.mult(Vector.normalise(e.pair.collision.normal), Vector.dot(this.body.velocity, Vector.normalise(e.pair.collision.normal)) * 2));
                Body.setVelocity(this.body, new_velocity);
            }
            function collidedWith(label) {
                return e.with.label.split(" ")[0] == label;
            }
        };
        this.impact = function (player) {
            this.destroy();
            player.kill();

            //TODO remove this
            if (player.id == 0) player_me = game.players[1];
        };
        this.destroy = function () {
            //TODO: particle effects
            World.remove(game.world, this.body);
            this.player.bullet_count--;
        }
    }

    function Player() {
        this.id = -1;
        this.color = new Color("#ff6870");
        this.settings = game.settings.player;
        this.bullet_count = 0;
        this.bullets = [];
        this.intent_received = false;

        this.has_spawn = false;
        var shoot_released = true;
        this.spawn = function (params) {
            var x, y;
            if (params == undefined) {
                var clip = 2;
                var r = Math.random();
                var w = game.render.canvas.width;
                var h = game.render.canvas.height;
                var goffs = {
                    x: w / 2 - (game.settings.level.appearance.cellsize * game.settings.level.appearance.mazesize / 2),
                    y: h / 2 - (game.settings.level.appearance.cellsize * game.settings.level.appearance.mazesize / 2)
                };
                x = goffs.x + (clip + Math.floor(Math.random() * (game.settings.level.appearance.mazesize - 2 * clip)) + 0.5) * game.settings.level.appearance.cellsize;
                y = goffs.y + (clip + Math.floor(Math.random() * (game.settings.level.appearance.mazesize - 2 * clip)) + 0.5) * game.settings.level.appearance.cellsize;
            } else {
                x = params[0];
                y = params[1];
            }


            if (this.has_spawn) return;
            this.has_spawn = true;

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
                        label: "Player " + this.id
                    }),
                    //center circle
                    Bodies.circle(x, y, app.baseRadius, { render: { fillStyle: this.color.darker(app.darkenColor).toString() } }),
                    //shooter
                    Bodies.rectangle(x, y - app.shooterLength + 10, app.shooterWidth, app.shooterLength, {
                        render: { fillStyle: this.color.darker(app.darkenColor).toString() },
                        label: "Player " + this.id,
                        density: 0
                    })
                ],
                label: "Player " + this.id
            };

            this.body = Body.create(Util.merge([app, phy, extra]));
            World.add(game.world, [this.body]);
            this.pos_old = {x:0,y:0};
            this.rot_old = 0;
            Events.on(game.engine, "beforeUpdate", function () {
                this.pos_old.x = this.body.position.x;
                this.pos_old.y = this.body.position.y;
                this.rot_old = this.body.angle;
                this.update();
            }.bind(this));
            Events.on(game.engine, "afterUpdate", function () {
                if (this.rot_old != this.body.angle || Math.floor(this.pos_old.x) != Math.floor(this.body.position.x) || Math.floor(this.pos_old.y) != Math.floor(this.body.position.y)) {
                    if (!this.intent_received) {}//this.broadcastMove();
                    else this.intent_received = false;
                }
            }.bind(this));

            document.addEventListener("keydown", function (evt) {
                if (this.shootControlCode(evt.keyCode) && shoot_released) {
                    shoot_released = false;
                    this.shoot();
                }
            }.bind(this));
            document.addEventListener("keyup", function (evt) {
                if (this.shootControlCode(evt.keyCode)) shoot_released = true;
            }.bind(this));
        };
        this.forwardControl = function () {
            return player_me.id == this.id && game.input.up;
        };
        this.backwardControl = function () {
            return player_me.id == this.id && game.input.down;
        };
        this.leftTurnControl = function () {
            return player_me.id == this.id && game.input.left;
        };
        this.rightTurnControl = function () {
            return player_me.id == this.id && game.input.right;
        };
        this.shootControlCode = function (code) {
            return player_me.id == this.id && code == game.settings.keys.num0;
        };
        this.shootControl = function () {
            return player_me.id == this.id && game.input.num0;
        };
        this.shoot = function () {
            if (this.bullet_count < game.settings.bullet.maximum) {
                this.bullet_count++;
                var bullet = new Bullet();
                bullet.player = this;
                this.bullets.push(bullet);
                var len = this.settings.appearance.baseHeight / 2 + this.settings.appearance.shooterLength / 2;
                bullet.spawn({
                    x: this.body.position.x + Math.cos(this.body.angle - (Math.PI / 2)) * len,
                    y: this.body.position.y + Math.sin(this.body.angle - (Math.PI / 2)) * len
                }, this.body.angle);
                Body.applyForce(this.body, this.body.position, {
                    x: -Math.cos(this.body.angle - (Math.PI / 2)) * this.settings.speed.forward,
                    y: -Math.sin(this.body.angle - (Math.PI / 2)) * this.settings.speed.forward
                });
                window.setTimeout(function () {
                    this.bullet_count--;
                    World.remove(game.world, this.bullets[0].body);
                    this.bullets.splice(0, 1);
                }.bind(this), game.settings.bullet.disappear);
            }
        };
        this.update = function () {
            //check to update velocities
            if (this.leftTurnControl()) {
                Body.rotate(this.body, -this.settings.speed.turn);
            } else if (this.rightTurnControl()) {
                Body.rotate(this.body, this.settings.speed.turn);
            }
            if (this.forwardControl()) {
                Body.applyForce(this.body, this.body.position, {
                    x: Math.cos(this.body.angle - (Math.PI / 2)) * this.settings.speed.forward,
                    y: Math.sin(this.body.angle - (Math.PI / 2)) * this.settings.speed.forward
                });
            }
            if (this.backwardControl()) {
                Body.applyForce(this.body, this.body.position, {
                    x: -Math.cos(this.body.angle - (Math.PI / 2)) * this.settings.speed.forward,
                    y: -Math.sin(this.body.angle - (Math.PI / 2)) * this.settings.speed.forward
                });
            }
            //if (this.shootControl()) this.shoot();
        };

        var angle_resolution = 1000;
        this.broadcastMove = function () {
            var arr = [];
            arr[0] = this.body.position.x;
            arr[1] = this.body.position.y;
            var angle = this.body.angle;
            while (angle >= Math.PI * 2) angle -= Math.PI * 2;
            while (angle <= Math.PI * 2) angle += Math.PI * 2;
            arr[2] = angle * angle_resolution;
            game.broadcast(ACTION_MOVE, arr);
        };
        this.broadcastSpawn = function () {
            var arr = [];
            arr[0] = this.body.position.x;
            arr[1] = this.body.position.y;
            var angle = this.body.angle;
            while (angle >= Math.PI * 2) angle -= Math.PI * 2;
            while (angle <= Math.PI * 2) angle += Math.PI * 2;
            arr[2] = angle * angle_resolution;
            game.broadcast(ACTION_SPAWN, arr);
        };
        this.receiveMove = function (arr) {
            this.intent_received = true;
            Body.setPosition(this.body, {x: arr[0], y: arr[1]});
            Body.setAngle(this.body, arr[3] / angle_resolution);
        };
        this.kill = function () {
            //TODO: particle effects
            World.remove(game.world, this.body);

            //shatter effect
            var shards = [];
            var shardCountTarget = 30;
            var r = this.settings.appearance.baseWidth / this.settings.appearance.baseHeight;
            var a = Math.sqrt(shardCountTarget * r);
            var b = Math.sqrt(shardCountTarget / r);
            console.log(r - (a / b));
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
                    var rdir = { x: spread * (Math.random() * 2 - 1), y: spread * (Math.random() * 2 - 1) };
                    if ((y == 0 || y == b) && (x != 0 && x != a)) pt.x += rdir.x;
                    else if ((x == 0 || x == a) && (y != 0 && y != b)) pt.y += rdir.y;
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
            var threshold_l = 0.5 * (this.settings.appearance.baseWidth * this.settings.appearance.baseHeight) / shardCount;
            //var threshold_u = 2 * (this.settings.appearance.baseWidth * this.settings.appearance.baseHeight) / shardCount;
            for (y = 0; y < b; y++) {
                for (x = 0; x < a; x++) {
                    var newpos = Vector.rotateAbout({ x: offs.x + (x + 0.5) * sw, y: offs.y + (y + 0.5) * sh }, this.body.angle, this.body.position);
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
            World.add(game.world, shards);
            var explode = 0.00035;
            for (var i = 0; i < shards.length; i++) {
                var f = Vector.mult(Vector.normalise(Vector.sub(shards[i].position, this.body.position)), explode);
                Body.applyForce(shards[i], this.body.position, f);
            }
            this.color.a = 1;

            //TODO: score counter
        };
    }

    function Color(string) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;

        var parse = function (str) {
            if (str.includes("#")) {
                str = str.split('#')[1].toLowerCase();
                function getHex(c) {
                    switch (c) {
                        case "0":
                            return 0;
                        case "1":
                            return 1;
                        case "2":
                            return 2;
                        case "3":
                            return 3;
                        case "4":
                            return 4;
                        case "5":
                            return 5;
                        case "6":
                            return 6;
                        case "7":
                            return 7;
                        case "8":
                            return 8;
                        case "9":
                            return 9;
                        case "a":
                            return 10;
                        case "b":
                            return 11;
                        case "c":
                            return 12;
                        case "d":
                            return 13;
                        case "e":
                            return 14;
                        case "f":
                            return 15;
                    }
                }

                this.r = getHex(str.substring(0, 2).split("")[0]) * 16 + getHex(str.substring(0, 2).split("")[1]);
                this.g = getHex(str.substring(2, 4).split("")[0]) * 16 + getHex(str.substring(2, 4).split("")[1]);
                this.b = getHex(str.substring(4, 6).split("")[0]) * 16 + getHex(str.substring(4, 6).split("")[1]);

            } else if (str.includes("rgb")) {
                var hasA = false;
                if (!str.includes("rgba")) str = str.split('rgb(')[1];
                else if (str.includes("rgba")) {
                    str = str.split('rgba(')[1];
                    hasA = true;
                }

                str = str.replace(" ", "");
                str = str.substring(0, str.length - 1);
                this.r = Number.parseInt(str.split(",")[0]);
                this.g = Number.parseInt(str.split(",")[1]);
                this.b = Number.parseInt(str.split(",")[2]);
                if (hasA) this.a = Number.parseInt(str.split(",")[3]);
            } else {
                return null;
            }
        }.bind(this);

        this.toString = function () {
            return "rgba(" + Math.floor(this.r) + ", " + Math.floor(this.g) + ", " + Math.floor(this.b) + ", " + this.a + ")";
        };

        this.darker = function (scalar) {
            scalar = Util.clip(scalar, 0, 1);

            var c = new Color();
            c.r = this.r * scalar;
            c.g = this.g * scalar;
            c.b = this.b * scalar;
            c.a = this.a;
            return c;
        };
        this.interpolate = function (color, fact) {
            fact = Util.clip(fact, 0, 1);
            var c = new Color();
            c.r = Util.interpolate(this.r, color.r, fact);
            c.g = Util.interpolate(this.g, color.g, fact);
            c.b = Util.interpolate(this.b, color.b, fact);
            c.a = Util.interpolate(this.a, color.a, fact);
            return c;
        };

        if (string) parse(string)
    }

    var Util = {
        clip: function (val, min, max) {
            val = Math.max(min, val);
            val = Math.min(max, val);
            return val;
        },
        interpolate: function (start, end, fact) {
            fact = Util.clip(fact, 0, 1);
            return start + ((end - start) * fact);
        },
        merge: function (list) {
            function ext(o1, o2) {
                var result = {};
                $.extend(result, o1, o2);
                return result;
            }

            if (list.length <= 0) return {};
            if (list.length == 1) return list[0];
            else {
                var res = {};
                for (var i = 0; i < list.length; i++) res = ext(res, list[i]);
                return res;
            }
        },
        clone: function (obj) {
            var result = {};
            $.extend(result, {}, obj);
            return result;
        },
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },
        getRandom: function (min, max) {
            return Math.random() * (max - min) + min;
        }
    };

    var log = function (str) {
        if (this.settings.debug) console.log(str);
    }.bind(this);

    var game = this;
    game.initialize();

})();
