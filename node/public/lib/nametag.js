import { playerPosition } from '../app.js';
import { name } from './joinmodal.js';
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
      const dy = p.y - 30;
      e(`span${uid}`).style['transform'] = `translate(${dx}px, ${dy}px)`;
    })
  });
  return /*html*/`
  <style>
    #div${uid} {
      pointer-events: none;
      position: fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100vh;
      font-family: system-ui, sans-serif;
      font-size: 1rem;
      text-align: left;
    }
    #span${uid} {
      display: inline-block;
      background-color: rgba(224, 224, 224, 0.54);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem;
    }
  </style>
  <div id="div${uid}">
    <span id="span${uid}">${label}</span>
  </div>
  `;
}