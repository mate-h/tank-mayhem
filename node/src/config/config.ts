export default {
  node: {
    port: process.env.NODE_PORT || 3000
  },
  redis: {
    host: "redis",
    port: parseInt(process.env.REDIS_PORT || "6379")
  }
};

