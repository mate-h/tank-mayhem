import { socketClient } from "../app.js";

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

export const streamable = (name, defaultValue) => {
  const listeners = [];
  let value = defaultValue;
  let socket;

  socketClient.subscribe(s => {
    socket = s;
    if (socket) {
      socket.on(name, msg => {
        console.log(msg);
      });
    }
  });
  class Stream {
    compress = (v) => v
    decompress = (c) => c
    update = (callback) => {
      const newVal = callback(value);
      if (newVal === undefined) return;
      value = newVal;
      if (socket) socket.emit(name, this.compress(newVal));
      listeners.forEach(l => l(newVal));
    }
    set = v => {
      if (v === undefined) return;
      value = v;
      if (socket) socket.emit(name, this.compress(v));
      listeners.forEach(l => l(v));
    }
    subscribe = (callback) => {
      listeners.push(callback);
      callback(value);
    }
  }
  
  return new Stream();
}