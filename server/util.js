var extend = require("extend");
const Util = {
  extractBodyProperties: function(body) {
    var vertices = [];
    for (var j = 0; j < body.vertices.length; j++) {
      vertices.push({
        x: body.vertices[j].x,
        y: body.vertices[j].y,
        index: body.vertices[j].index,
        isInternal: body.vertices[j].isInternal
      });
    }
    var parts = [];
    for (j = 0; j < body.parts.length; j++) {
      var vertices2 = [];
      for (var k = 0; k < body.parts[j].vertices.length; k++) {
        vertices2.push({
          x: body.parts[j].vertices[k].x,
          y: body.parts[j].vertices[k].y,
          isInternal: body.parts[j].vertices[k].isInternal
        });
      }
      parts.push({
        id: body.parts[j].id,
        vertices: vertices2,
        render: body.parts[j].render,
        position: body.parts[j].position,
        angle: body.parts[j].angle,
        bounds: body.parts[j].bounds,
        axes: body.parts[j].axes
      });
    }

    return {
      ...body,
      parts: parts,
      vertices: vertices,
      parent: undefined
      // id: body.id,
      // label: body.label,
      // velocity: body.velocity,
      // render: body.render,
      // position: body.position,
      // angle: body.angle,
      // bounds: body.bounds,
      // isStatic: body.isStatic
    };
  },
  clip: function(val, min, max) {
    val = Math.max(min, val);
    val = Math.min(max, val);
    return val;
  },
  interpolate: function(start, end, fact) {
    fact = Util.clip(fact, 0, 1);
    return start + (end - start) * fact;
  },
  merge: function(list) {
    function ext(o1, o2) {
      var result = {};
      extend(result, o1, o2);
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
  clone: function(obj) {
    var result = {};
    extend(result, {}, obj);
    return result;
  },
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getRandom: function(min, max) {
    return Math.random() * (max - min) + min;
  },
  getRandomColor: function() {
    var colors = [
      "#F44336",
      "#E91E63",
      "#9C27B0",
      "#673AB7",
      "#3F51B5",
      "#2196F3",
      "#03A9F4",
      "#00BCD4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#CDDC39",
      "#FFC107",
      "#FF9800",
      "#FF5722",
      "#795548",
      "#9E9E9E",
      "#607D8B"
    ];
    var c = colors[Util.getRandomInt(0, colors.length)];
    return c;
  }
};

module.exports = Util;
