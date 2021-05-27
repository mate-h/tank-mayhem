import fastify from 'fastify';
import { Server } from 'socket.io';
import fastifyStatic from 'fastify-static';
import config from './config/config';
import path from 'path';
import { RedisClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

const server = fastify({
  logger: false
})

const pubClient = new RedisClient({ host: config.redis.host, port: config.redis.port });
const subClient = pubClient.duplicate();

const socketio = new Server(server.server);
socketio.adapter(createAdapter(pubClient, subClient));
server.decorate('io', socketio)
server.addHook('onClose', (server, done) => {
  (server as any).io.close()
  done()
})

server.register(fastifyStatic, {
  root: path.join(__dirname, '../public')
})

server.get('/api/ping', (request, reply) => {
  reply.send("pong");
})

// Run the server
server.listen(config.node.port, '0.0.0.0', (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  server.log.info(`server listening on ${address}`)
})

export { socketio, server };
