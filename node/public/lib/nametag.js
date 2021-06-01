import { playerPosition } from '../app.js';
import { name, open } from './joinmodal.js';
import { writable, playerData, alive } from './store.js';

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
    playerData.subscribe(d => {
      e(`p${uid}`).innerText = d.score;
    });
    name.subscribe(n => {
      e(`span${uid}`).innerText = n;
    });
    alive.subscribe(a => {
      console.log('alive',a);
    })
    let prevList = [];
    playerList.subscribe(l => {
      if(prevList.sort().join(',') !== l.map(l => l.id).sort().join(',')) {
        e(`div3${uid}`).innerHTML = l.map(p => /*html*/`
        <div class="div2${uid}" id="div2${uid}${p.id}">
          <span class="player${uid}" id="span2${uid}${p.id}">${p.name}</span>
          <span class="player${uid}" id="span4${uid}${p.id}">${p.score}</span>
        </div>
        `).join('');
      }
      l.forEach(p => {
        const dx = p.position.x;
        const dy = p.position.y - 40;
        e(`span2${uid}${p.id}`).innerText = p.name;
        e(`span4${uid}${p.id}`).innerText = p.score;
        const div = e(`div2${uid}${p.id}`);
        if (!p.alive) {
          if (!div.classList.contains("dead")) {
            div.classList.add("dead");
          }
        }
        else if (div.classList.contains("dead")) {
          div.classList.add("remove");
        }
        div.style['transform'] = `translate(${dx}px, ${dy}px)`;
      })
      // update transform
      prevList = l.map(l => l.id);
    });
    playerPosition.subscribe(p => {
      const dx = p.x;
      const dy = p.y - 40;
      e(`div${uid}`).style['transform'] = `translate(${dx}px, ${dy}px)`;
      // e(`p${uid}`).style['transform'] = `translate(${dx}px, ${dy + 16}px)`;
    });
    e(`button${uid}`).onclick = () => {
      open.update(v => !v);
    }
  });
  return /*html*/`
  <style>
    #div${uid}, .div2${uid}, #div3${uid} {
      position: fixed;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      font-family: system-ui, sans-serif;
      font-size: 1rem;
      text-align: left;
      pointer-events: none;
    }
    .player${uid} {
      height: 1rem;
      line-height: 1rem;
      border-radius: 3px;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
      padding: 0 0.25rem;
      background-color: rgba(224, 224, 224, 0.76);
      font-weight: 400;
      font-size: 0.75rem;
    }
    .dead {
      text-decoration: line-through;
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
  <div id="div3${uid}">
    
  </div>
  <div id="div${uid}">
    <button id="button${uid}">
      <span id="span${uid}">${label}</span>
    </button>
    <p style="margin-top: 1px" class="player${uid}" id="p${uid}">${label}</p>
  </div>
  `;
}
