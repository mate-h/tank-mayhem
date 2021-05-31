export const writable = (defaultValue) => {
  const listeners = [];
  let value = defaultValue;
  return {
    update: (callback) => {
      const newVal = callback(value);
      if (newVal === undefined) return;
      value = newVal;
      listeners.forEach(l => l(newVal));
    },
    set: v => {
      if (v === undefined) return;
      value = v;
      listeners.forEach(l => l(v));
    },
    subscribe: (callback) => {
      listeners.push(callback);
      callback(value);
    }
  }
}

export let socketClient = writable(null);

export const streamable = (name, defaultValue, options = {}) => {
  const {
    broadcast = true, // default
    callback = () => {} // used for setting up custom socket listeners
  } = options;
  const listeners = [];
  let value = defaultValue;
  let socket;

  class Stream {
    compress = defaultValue.compress || ((c) => c)
    decompress = defaultValue.decompress || ((c) => c)
    broadcast = broadcast;
    setOptions = options => {
      const {
        broadcast = true, // default
        callback = () => {} // used for setting up custom socket listeners
      } = options;
      this.broadcast = broadcast;
      this.callback = callback;
    }
    update = (callback) => {
      const newVal = callback(value);
      if (newVal === undefined) return;
      value = newVal;
      if (socket && this.broadcast) socket.emit(name, this.compress(newVal, socket));
      listeners.forEach(l => l(newVal));
    }
    set = v => {
      if (v === undefined) return;
      value = v;
      if (socket && this.broadcast) socket.emit(name, this.compress(v, socket));
      listeners.forEach(l => l(v));
    }
    subscribe = (callback) => {
      listeners.push(callback);
      callback(value);
    }
  }
  let stream = new Stream();
  socketClient.subscribe(s => {
    // side effect in the streamable scope, do not export this variable.
    // import { socketClient } from "../app.js";
    // socketClient.subscribe(s => { ... })
    socket = s;
    if (socket) {
      socket.on('connect', () => {
        // console.log(`connect streamable: ${name}`, socket.id);
        callback(socket, stream);
      })
      // socket.on(name, msg => {
      //   const val = stream.decompress(msg, socket);
      //   listeners.forEach(l => l(msg));
      //   // console.log(`streamable: ${name}`, msg);
      // });
    }
  });
  
  return stream;
}

export const playerData = streamable("player-data", {
  name: "",
  color: "",
  id: 0
});