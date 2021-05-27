const dark = false;

const defaultCategory = 1;
const shieldCategory = 2;
const packageCategory = 4;
const bulletCategory = 8;
const wallCategory = 16;
const playerCategory = 32;
const edgeCategory = 64;

module.exports = {
  theme: { dark },
  FPS: 60,
  sessionTimeout: 4000, // ms
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
    num0: 32
  },
  package: {
    spawnRate: 12000, // ms
    max: 12,
    minimumDistance: 5, // TODO: cells
    appearance: {
      color: dark ? "#000000" : "#ffffff",
      size: 32 // px
    },
    physics: {
      chamfer: 0.005,
      friction: 0,
      frictionAir: 0.1,
      frictionStatic: 0,
      restitution: 0.8,
      density: 0.000001,
      collisionFilter: {
        category: packageCategory,
        mask: defaultCategory | playerCategory
      }
    },
    powers: {
      speed: {
        enabled: true,
        name: "speed",
        bias: 1,
        timeout: 10000, // ms
        multiplier: 1.7,
        turnMultiplier: 1.3
      },
      slow: {
        enabled: false,
        name: "slow",
        bias: 1,
        timeout: 10000, // ms
        multiplier: 0.7,
        turnMultiplier: 0.9
      },
      shield: {
        enabled: true,
        name: "shield",
        bias: 1,
        timeout: 20000, // ms
        state: true,
        circle: {
          radius: 24,
          lightenColor: 1.2,
          options: {
            collisionFilter: {
              category: shieldCategory,
              mask: defaultCategory | bulletCategory
            },
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            restitution: 0.8,
            mass: 0
          }
        }
      },
      laser: {
        enabled: true,
        bias: 1,
        name: "laser",
        timeout: 8000, // ms
        color: "red",
        streakLength: 200, // px
        speed: 1 // px / ms
      },
      bouncy: {
        enabled: true,
        name: "bouncy",
        bias: 1,
        limit: 3,
        size: 6,
        timeout: 8000, // ms
        multiplier: 2,
        fillStyle: "#FF69B4" // hotpink
      },
      invisibility: {
        enabled: false,
        name: "invisibility",
        bias: 1,
        timeout: 20000 // ms
      },
      teleport: {
        enabled: false,
        name: "teleport",
        bias: 1,
        timeout: 100 // ms
      }
    }
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
      forward: 0.0014
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
      collisionFilter: {
        category: playerCategory
      },
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
    maximum: 20,
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
      restitution: 1,
      collisionFilter: {
        category: bulletCategory,
        mask: defaultCategory | shieldCategory | playerCategory | edgeCategory
      }
    }
  },
  level: {
    appearance: {
      color: dark ? "#212121" : "#ffffff",
      thickness: 6,
      cellsize: 62,
      mazesize: 6, // 12 cells
      shadow: true
    },
    physics: {
      density: Math.pow(10, 10),
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      restitution: 0,
      isStatic: true,
      collisionFilter: {
        category: wallCategory,
        mask: defaultCategory | playerCategory | bulletCategory
      }
    }
  },
  engine: {
    enableSleeping: false,
    positionIterations: 10,
    velocityIterations: 10
  },
  world: {
    gravity: { x: 0, y: 0 },
    collisionFilter: {
      category: edgeCategory,
      mask: defaultCategory | playerCategory | bulletCategory
    }
  }
};
