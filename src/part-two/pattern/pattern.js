// showroom: 11, a run played slowly: the pattern grows, a border boxes it in,
// it goes sharp, then comes out as SVG. A new run on every load and every
// scheme change; with reduced motion it skips to the SVG. TK · xoxn · 2026
import { $ } from '../../lib/dom.js';
import { rgbOf, ink } from '../../lib/color.js';
import { onScheme } from '../../schemes/state.js';
import { N, STEPS, seed, step } from './grow.js';
import { THRESHOLD, sharpen, soften } from './sharp.js';
import { trace, pathOf } from './trace.js';

const PER_FRAME = 6, BOX = 8, BOX_STEPS = 400, SHARP_MS = 1200; // steps a frame; the border's inset in cells
const cv = $('kn'), ctx = cv.getContext('2d'), svg = $('kn-svg'), frame = $('kn-box'), image = ctx.createImageData(N, N);
cv.width = cv.height = N;
const SVG = 'http://www.w3.org/2000/svg';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
let run = null, shown = false, ends = [];

// V as a color from the glass (empty) to the accent (pattern); soft is how wide the edge is
function paint(V, soft) {
  const d = image.data, [lo, hi] = ends;
  for (let i = 0; i < N * N; i++) {
    const t = Math.max(0, Math.min(1, (V[i] - THRESHOLD + soft / 2) / soft));
    for (let c = 0; c < 3; c++) d[i * 4 + c] = lo[c] + (hi[c] - lo[c]) * t;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

const say = (stage, what) => { for (const li of document.querySelectorAll('[data-kn]')) li.toggleAttribute('data-on', li.dataset.kn === stage); $('kn-what').textContent = what; };
const inset = n => { frame.style.display = n ? '' : 'none'; frame.setAttribute('x', n - 0.5); frame.setAttribute('y', n - 0.5); frame.setAttribute('width', N - 2 * n); frame.setAttribute('height', N - 2 * n); };

// the SVG: every outline, drawn along its length, then filled
function draw(g) {
  const walls = soften(sharpen(g.V, N), N), loops = trace(walls, N);
  paint(walls.map(v => (v > 0.5 ? 1 : 0)), 0.01);
  const shapes = document.createElementNS(SVG, 'g');
  for (const loop of loops) {
    const path = shapes.appendChild(document.createElementNS(SVG, 'path'));
    path.setAttribute('d', pathOf(loop));
    path.setAttribute('pathLength', '1'); // so each one draws in over the same time
  }
  svg.querySelector('g')?.remove();
  svg.append(shapes);
  const file = `<svg xmlns="${SVG}" viewBox="-0.5 -0.5 ${N} ${N}"><path fill-rule="evenodd" d="${loops.map(pathOf).join('')}"/></svg>`;
  $('kn-save').href = URL.createObjectURL(new Blob([file], { type: 'image/svg+xml' }));
  $('kn-save').download = `knurl-${g.n}.svg`;
  requestAnimationFrame(() => svg.dataset.stage = 'svg');
  say('svg', `${loops.length} shapes`);
}

// one frame of run g; a newer run stops this one
function tick(g, now) {
  if (g !== run) return;
  if (shown && g.t < STEPS) { for (let s = 0; s < PER_FRAME; s++) step(g); paint(g.V, 0.3); say('grow', `step ${g.t} of ${STEPS}`); }
  else if (shown && g.t < STEPS + BOX_STEPS) {
    const n = Math.min(BOX, Math.ceil(((g.t - STEPS) / BOX_STEPS) * BOX * 2));
    for (let s = 0; s < PER_FRAME; s++) step(g, n);
    inset(n); paint(g.V, 0.3); say('box', `${n} cells in`);
  } else if (shown && !g.sharp) { g.sharp = now; }
  else if (shown && now - g.sharp < SHARP_MS) { paint(g.V, 0.3 * (1 - (now - g.sharp) / SHARP_MS) + 0.01); say('sharp', `over ${THRESHOLD} is wall`); }
  else if (shown) return draw(g);
  requestAnimationFrame(t => tick(g, t));
}

function start() {
  ends = [rgbOf(ink('--xn-bg')), rgbOf(ink('--xn-accent'))];
  const n = Math.floor(Math.random() * 2 ** 31);
  run = Object.assign(seed(n), { n });
  delete svg.dataset.stage; svg.querySelector('g')?.remove(); inset(0);
  $('kn-seed').textContent = n; $('kn-fk').textContent = `${run.F.toFixed(4)} · ${run.k.toFixed(4)}`;
  const g = run;
  if (!still) return requestAnimationFrame(t => tick(g, t));
  while (run.t < STEPS + BOX_STEPS) step(run, run.t < STEPS ? 0 : BOX);
  inset(BOX); draw(run);
}

new IntersectionObserver(([e]) => { shown = e.isIntersecting; }).observe(cv);
onScheme(start); // the first scheme starts the first run
