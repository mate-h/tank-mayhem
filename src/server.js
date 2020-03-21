const config = require("./config/config");
const app = require("http").createServer();
const socketioRedis = require("socket.io-redis");
const socketio = require("socket.io")(app);

process.on("unhandledRejection", reason => {
  throw reason;
});
process.on("uncaughtException", err => {
  console.log(err);
});

socketio.adapter(
  socketioRedis({ host: config.redis.host, port: config.redis.port })
);

app.listen(config.node.port, "0.0.0.0");

module.exports = { socketio, app };
