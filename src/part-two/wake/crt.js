// showroom: 12, xorxnor's CRT hero glitch (heros/CrtText.tsx) on the heading.
// TK · xoxn · 2026
import { $ } from '../../lib/dom.js';

// CrtText: the first glitch once things settle, then one every 12 to 35 s, 700 ms each
const between = ([min, max]) => min + Math.random() * (max - min);
function glitch() {
  const el = $('crt');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden) {
    el.dataset.glitch = '';
    setTimeout(() => { delete el.dataset.glitch; }, 700);
  }
  setTimeout(glitch, between([12000, 35000]));
}
setTimeout(glitch, between([5000, 12000]));
$('crt').addEventListener('click', () => { const el = $('crt'); el.dataset.glitch = ''; setTimeout(() => { delete el.dataset.glitch; }, 700); });
