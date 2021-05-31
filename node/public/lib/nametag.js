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
    });
    let prevList = [];
    playerList.subscribe(l => {
      // if(prevList.sort().join(',') !== l.map(l => l.id).sort().join(',')) {
        e(`div3${uid}`).innerHTML = l.map(p => /*html*/`
        <div id="div2${uid}">
          <span class="player${uid}" id="span2${uid}${p.id}">${p.name}</span>
        </div>
        `).join('');
      // }
      l.forEach(p => {
        const dx = p.position.x;
        const dy = p.position.y - 35;
        e(`span2${uid}${p.id}`).style['transform'] = `translate(${dx}px, ${dy}px)`;
      })
      // update transform
      

      prevList = l.map(l => l.id);
    });
    playerPosition.subscribe(p => {
      const dx = p.x;
      const dy = p.y - 35;
      e(`button${uid}`).style['transform'] = `translate(${dx}px, ${dy}px)`;
    });
    e(`button${uid}`).onclick = () => {
      open.update(v => !v);
    }
  });
  return /*html*/`
  <style>
    #div${uid}, #div2${uid}, #div3${uid} {
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
    .player${uid} {
      height: 1.5rem;
      line-height: 1.5rem;
      border-radius: 3px;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
      padding: 0 0.5rem;
    }
    .player${uid}, #button${uid} {
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
  <div id="div3${uid}">
    
  </div>
  `;
}

playerData.subscribe(d => {
  console.log(d);
})
