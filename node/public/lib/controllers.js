import { streamable, writable } from './store.js';

export const gamepads = writable([]);

export const connected = writable(false);

const defaultControllerInput = { left: {x: 0, y: 0}, right: {x: 0, y: 0}, buttons: { shoot: 0 }};
export const controllerInput = streamable('controller-input', defaultControllerInput);

controllerInput.compress = (v) => {
  const prec = 0.001;
  function p(v) {
    return Math.round(v / prec) * prec;
  }
  return [p(v.left.x), p(v.left.y), p(v.right.x), p(v.right.y), v.buttons.shoot? 1:0];
}

controllerInput.decompress = (v) => {
  return { left: {x: v[0], y: v[1]}, right: {x: v[2], y: v[3]}, buttons: { shoot: v[4] }}
}

let vibrated = false;
export function gamepad() {
  window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad connected");
    console.log(navigator.getGamepads());
    gamepads.set(navigator.getGamepads());
    
    // connected.update(c => c === true ? undefined : true);
  });
  window.addEventListener("gamepaddisconnected", (event) => {
    console.log("Gamepad disconnected");
    gamepads.set(navigator.getGamepads());
    // connected.set(false);
  });
  let precision = 0.001;
  let prev = defaultControllerInput;
  gamepads.subscribe(g => {
    const controller = g[1];
    if (controller && !vibrated && controller.vibrationActuator !== null) {
      vibrated = true;
      // controller.vibrationActuator.playEffect("dual-rumble", {
      //   startDelay: 0,
      //   duration: 10,
      //   weakMagnitude: 0.1,
      //   strongMagnitude: 0.1
      // });
    }
    if (controller) {
      let x = controller.axes[0];
      let y = controller.axes[1];
      const left = {x, y};
      x = controller.axes[2];
      y = controller.axes[3];
      const right = {x, y};
      function appx(n1, n2) {
        const r1 = Math.round(n1 / precision) * precision;
        const r2 = Math.round(n2 / precision) * precision;
        return r1 === r2;
      }
      const shoot = controller.buttons[6].pressed;
      function then() {
        prev = { left, right, buttons: {shoot} };
      }
      // console.log(controller.buttons.map((b,i) => b.pressed ? 1 : 0))
      // if prev left or right input is approximately same as current ones, skip the broadcast
      const a1 = appx(left.x, prev.left.x) && appx(left.y, prev.left.y);
      const a2 = appx(right.x, prev.right.x) && appx(right.y, prev.right.y);
      if (a1 && a2 && prev.buttons.shoot === shoot) {
        then();
        return;
      }

      // set the value on the message broadcast
      // console.log('controllerInput.set');
      controllerInput.set({ left, right, buttons: { shoot }  });
      then();
      
      // console.log(left, right);
    }
  })
  const throttle = 25;
  function loop() {
    gamepads.set(navigator.getGamepads());
    setTimeout(loop, throttle);
  }
  loop();
}