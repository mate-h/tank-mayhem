import { playerPosition } from '../app.js';
import { name, open } from './joinmodal.js';
import { writable, playerData } from './store.js';

export const playerList = writable([]);

function e(id) {
  return document.getElementById(id);
}
/**
 * @type HTMLDOMElement
 */
 export function render({label}) {
  const uid = Math.random().toString(36).substr(2, 7);
  requestAnimationFrame(() => {
    
    name.subscribe(n => {
      e(`span${uid}`).innerText = n;
    })
    playerPosition.subscribe(p => {
      const dx = p.x;
      const dy = p.y - 35;
      e(`button${uid}`).style['transform'] = `translate(${dx}px, ${dy}px)`;
    })
    e(`button${uid}`).onclick = () => {
      open.update(v => !v);
    }
  });
  return /*html*/`
  <style>
    #div${uid} {
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
    #button${uid} {
      pointer-events: all;
      background-color: rgba(224, 224, 224, 0.76);
      font-weight: 400;
      font-size: 0.75rem;
    }
    #button${uid}:active {
      background-color: rgba(0,0,0,0.12);
    }
  </style>
  <div id="div${uid}">
    <button id="button${uid}">
      <span id="span${uid}">${label}</span>
    </button>
  </div>
  `;
}

playerData.subscribe(d => {
  console.log(d);
})
playerList.subscribe(l => {
  console.log(l);
});