import animals from './animals.js';
import symbols from './symbols.js';
import { writable, streamable, playerData } from './store.js';
import { playerPosition } from '../app.js';

function r(c) {
  return Math.floor(Math.random() * c);
}

const colors = {
  "red": "#F44336",
  "pink": "#E91E63",
  "purple": "#9C27B0",
  "deep purple": "#673AB7",
  "indigo": "#3F51B5",
  "blue": "#2196F3",
  "light blue": "#03A9F4",
  "cyan": "#00BCD4",
  "teal": "#009688",
  "green": "#4CAF50",
  "light green": "#8BC34A",
  "lime": "#CDDC39",
  "amber": "#FFC107",
  "orange": "#FF9800",
  "deep orange": "#FF5722",
  "brown": "#795548",
  "grey": "#9E9E9E",
  "blue grey": "#607D8B"
}

let placeholder = "";
const defaultColor = Object.keys(colors)[r(Object.keys(colors).length)];

// playerData.compress = (v, s) => ([v.name, v.color, s.id]);
// playerData.decompress = (v, s) => ([v.name, v.color, s.id]);
export const name = writable("");
export const color = writable("");
export const open = writable(false);

function e(id) {
  return document.getElementById(id);
}
function s(id) {
  return document.querySelector(id);
}
function icon(name) {
  return /*html*/`<i class="icon">${symbols[name]}</i>`;
}

/**
 * @type HTMLDOMElement
 */
export function render() {
  requestAnimationFrame(() => {
    playerPosition.subscribe(p => {
      const dx = p.x;
      const dy = p.y - e('div2').clientHeight/2 - 55;
      e('div1').style['transform'] = `translate(${dx}px, ${dy}px)`;
    });
    playerData.subscribe(p => {
      if (p.name) {
        placeholder = p.name;
        e('name').placeholder = p.name;
        name.set(p.name);
      }
      if (p.color) color.set(p.color);
    })
    open.subscribe(o => {
      e('div1').style.visibility = o ? 'visible' : 'hidden';
    });
    name.subscribe(n => {
      console.log(n);
      
      // if (n === "") return;
      // playerData.update(p => ({...p, name: n}))
    })
    color.subscribe(c => {
      console.log(c);
      // if (c === "") return;
      // playerData.update(p => ({...p, color: c}))
    })
    e('button-play').onclick = () => {
      open.set(false);
    }
    e('name').oninput = (e) => {
      const i = e.target.value;
      if (i.trim() === "") name.set(placeholder);
      else name.set(i);
    }
    e('colors').onchange = (e) => {
      const val = e.target.value;
      color.set(val);
      // console.log(e.target.value)
    }
  })
  return /*html*/`
    <style>
      .icon {
        font-family: "SF Symbols";
        font-style: normal;
      }
      #div1 {
        position: fixed;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        font-family: system-ui, sans-serif;
        font-size: 1rem;
        text-align: left;
        pointer-events: none;
      }
      #div2 {
        display: inline-block;
        background-color: rgba(224, 224, 224, 0.76);
        box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
        border-radius: 3px;
        padding: 1.5rem;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
        pointer-events: all;
      }
      * {
        transition: box-shadow 150ms ease;
      }
      p {
        margin: 0;
      }
      button {
        height: 1.5rem;
        cursor: pointer;
        appearance: none;
        border: none;
        outline: none;
        border-radius: 3px;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
        font-weight: 500;
        padding: 0 0.5rem;
        background: none;
        transition: background-color 75ms linear;
      }
      button:active {
        background-color: rgba(0,0,0,0.12);
      }
      button:focus {
        box-shadow: 0 0 0 2px #007aff;
      }
      label {
        display: inline-block;
        margin: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        width: 140px;
      }
      input, select {
        position: relative;
        display: inline-block;
        width: 180px;
        height: 1.5rem;
        font-size: 1rem;
        appearance: none;
        outline: none;
        border: none;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
        border-radius: 2px;
        padding: 0 0.5rem;
      }
      input:focus, select:focus {
        box-shadow: 0 0 0 2px #007aff;
      }
    </style>
    <div id="div1">
      <div id="div2">
        <label for="name">Choose a name</label>
        <input style="margin-bottom: 1rem" id="name" placeholder="${placeholder}" type="text" name="name" autocomplete="off"/>
        <br/>
        <label for="colors">Pick a color</label>
        <select style="margin-bottom: 1rem" name="color" id="colors">
          ${Object.entries(colors).map(([k,v]) => {
            if (colors[defaultColor] === v) return /*html*/`<option selected value="${v}">${k}</option>`;
            return /*html*/`<option value="${k}">${k}</option>`
          }).join('')}
        </select>
        <p style="text-align: right">
          <button id="button-play">Play ${icon('play')}</button>
        </p>
      </div>
    </div>
  `;
}