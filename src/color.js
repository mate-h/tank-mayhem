const Util = require("./util");

function Color(string) {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 1;

  var parse = function(str) {
    if (str.indexOf("#") > -1) {
      str = str.split("#")[1].toLowerCase();
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

      this.r =
        getHex(str.substring(0, 2).split("")[0]) * 16 +
        getHex(str.substring(0, 2).split("")[1]);
      this.g =
        getHex(str.substring(2, 4).split("")[0]) * 16 +
        getHex(str.substring(2, 4).split("")[1]);
      this.b =
        getHex(str.substring(4, 6).split("")[0]) * 16 +
        getHex(str.substring(4, 6).split("")[1]);
    } else if (str.indexOf("rgb") > -1) {
      var hasA = false;
      if (!str.indexOf("rgba") > -1) str = str.split("rgb(")[1];
      else if (str.indexOf("rgba") > -1) {
        str = str.split("rgba(")[1];
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

  this.toString = function() {
    return (
      "rgba(" +
      Math.floor(this.r) +
      ", " +
      Math.floor(this.g) +
      ", " +
      Math.floor(this.b) +
      ", " +
      this.a +
      ")"
    );
  };

  this.darker = function(scalar) {
    scalar = Util.clip(scalar, 0, 1);

    var c = new Color();
    c.r = this.r * scalar;
    c.g = this.g * scalar;
    c.b = this.b * scalar;
    c.a = this.a;
    return c;
  };
  this.interpolate = function(color, fact) {
    fact = Util.clip(fact, 0, 1);
    var c = new Color();
    c.r = Util.interpolate(this.r, color.r, fact);
    c.g = Util.interpolate(this.g, color.g, fact);
    c.b = Util.interpolate(this.b, color.b, fact);
    c.a = Util.interpolate(this.a, color.a, fact);
    return c;
  };

  if (string) parse(string);
}

module.exports = Color;
