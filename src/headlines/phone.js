// showroom: app-template's CRT components redrawn in HTML: TabSwitcher,
// Counter, NumberSlider (drag or arrows) and CRTButton. TK · xoxn · 2026
import { $ } from '../lib/dom.js';

const OPACITY = [1, 0.4, 0.15]; // config/constants.js NUMBER_DISPLAY: center, next, far
const SENSITIVITY = 12; // px of drag per number
let value = 50, count = 0;

const clamp = v => Math.min(100, Math.max(0, v));

function draw() {
  $('phone-drum').innerHTML = [-2, -1, 0, 1, 2].map(d => {
    const n = value + d;
    return `<span style="opacity: ${n < 0 || n > 100 ? 0 : OPACITY[Math.abs(d)]}">${String(clamp(n)).padStart(3, '0')}</span>`;
  }).join('');
  $('phone-count').textContent = `CNT: ${count}`;
}

$('phone').addEventListener('click', e => {
  const mode = e.target.closest('[data-mode]')?.dataset.mode;
  if (!mode || e.target.id === 'phone') return;
  $('phone').dataset.mode = mode;
  for (const b of $('phone').querySelectorAll('.phone-tabs button')) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
});
$('phone-button').onclick = () => { count++; draw(); };

// NumberSlider.utils.js: dragging up raises the value, one step per SENSITIVITY px
const drum = $('phone-drum');
let drag = null;
drum.onpointerdown = e => { drag = { y: e.clientY, from: value }; drum.setPointerCapture(e.pointerId); };
drum.onpointermove = e => { if (drag) { value = clamp(Math.round(drag.from - (e.clientY - drag.y) / SENSITIVITY)); draw(); } };
drum.onpointerup = drum.onpointercancel = () => { drag = null; };
drum.addEventListener('keydown', e => {
  const step = { ArrowUp: 1, ArrowDown: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  value = clamp(value + step);
  draw();
});
draw();
