export const writable = (defaultValue) => {
  const listeners = [];
  let value = defaultValue;
  return {
    set: v => {
      value = v;
      listeners.forEach(l => l(v));
    },
    subscribe: (callback) => {
      listeners.push(callback);
      callback(value);
    }
  }
}