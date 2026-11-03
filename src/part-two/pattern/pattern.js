// showroom: 11, the reaction-diffusion canvas, colored by the screen's glass
// and accent. Runs only while it's on screen. TK · xoxn · 2026
import { $ } from '../../lib/dom.js';
import { rgbOf, ink } from '../../lib/color.js';
import { onScheme } from '../../schemes/state.js';
import { W, H, rd, reset, step } from './rd.js';

const STEPS = 8; // per frame
let paused = false, shown = false, ends = [[0, 0, 0], [0, 0, 0]];
const cv = $('rd'), ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
const image = ctx.createImageData(W, H);

// U − V from accent (the pattern) to glass (the empty screen)
function paint() {
  const d = image.data, [lo, hi] = ends;
  for (let i = 0; i < W * H; i++) {
    const t = Math.max(0, Math.min(1, rd.A[i] - rd.B[i])) ** 0.6;
    for (let c = 0; c < 3; c++) d[i * 4 + c] = lo[c] + (hi[c] - lo[c]) * t;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  $('rd-fk').textContent = paused ? 'paused' : 'running';
  $('rd-F').textContent = rd.F.toFixed(3);
  $('rd-k').textContent = rd.k.toFixed(3);
}

function recolor() { ends = [rgbOf(ink('--xn-accent')), rgbOf(ink('--xn-bg'))]; paint(); }

function frame() {
  if (shown && !paused) for (let s = 0; s < STEPS; s++) step();
  if (shown) paint();
  requestAnimationFrame(frame);
}

// the lab file's keys (only while the canvas has focus) and the panel's buttons do the same things
const DO = {
  'F+': () => { rd.F += 0.001; }, 'F-': () => { rd.F = Math.max(0, rd.F - 0.001); },
  'k+': () => { rd.k += 0.001; }, 'k-': () => { rd.k = Math.max(0, rd.k - 0.001); },
  reset, pause: () => { paused = !paused; $('rd-pause').textContent = paused ? 'play' : 'pause'; },
};
const KEYS = { ArrowUp: 'F+', ArrowDown: 'F-', ArrowRight: 'k+', ArrowLeft: 'k-', r: 'reset', ' ': 'pause' };
cv.addEventListener('keydown', e => {
  if (!KEYS[e.key]) return;
  e.preventDefault();
  e.stopPropagation(); // space here pauses; it doesn't restart the game
  DO[KEYS[e.key]]();
});
document.querySelector('.rd-panel').addEventListener('click', e => { const a = e.target.closest('[data-rd]')?.dataset.rd; if (a) DO[a](); });
new IntersectionObserver(([e]) => { shown = e.isIntersecting; }).observe(cv);
reset();
recolor();
onScheme(recolor);
requestAnimationFrame(frame);
