const config = require("./config/config");
const fastifyStatic = require('fastify-static')
const path = require('path')

const fastify = require('fastify')({
  logger: false
})

const socketio = require('socket.io')(fastify.server);
const socketioRedis = require("socket.io-redis");
socketio.adapter(
  socketioRedis({ host: config.redis.host, port: config.redis.port })
);
fastify.decorate('io', socketio)
fastify.addHook('onClose', (fastify, done) => {
  fastify.io.close()
  done()
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public')
})

fastify.get('/api/ping', function (request, reply) {
  reply.send("pong");
})

// Run the server
fastify.listen(config.node.port, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})

module.exports = { socketio, fastify };
