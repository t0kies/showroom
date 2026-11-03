// showroom: 12, splash-screen's cat, drawn pixel by pixel in a shuffled
// order like rendering/image_renderer.py, then wiped like clear_screen.
// TK · xoxn · 2026
import { $ } from '../../lib/dom.js';
import { ink } from '../../lib/color.js';
import { onScheme } from '../../schemes/state.js';

const PX = 8, PER_FRAME = 6; // pixel size from config.json; 3 ms a pixel is about 6 a frame

const cv = $('splash'), ctx = cv.getContext('2d');
const shuffle = list => { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list; };

// assets/image.json: rows of bytes, one bit a pixel, high bit first
const bitmap = fetch('samples/splash-cat.json').then(r => r.json()).then(d => {
  const w = d.width_pixels, row = (w + 7) >> 3, on = [];
  for (let y = 0; y < d.height; y++) for (let x = 0; x < w; x++) {
    if ((parseInt(d.bytes[y * row + (x >> 3)], 16) >> (7 - (x & 7))) & 1) on.push([x, y]);
  }
  return { w, h: d.height, on };
});

let job = 0;
async function play() {
  const { w, h, on } = await bitmap, me = ++job;
  cv.width = (w + 4) * PX; cv.height = (h + 4) * PX;
  const fill = (color, cells) => { ctx.fillStyle = color; for (const [x, y] of cells) ctx.fillRect((x + 2) * PX, (y + 2) * PX, PX, PX); };
  const run = (cells, color, per) => new Promise(done => {
    const left = shuffle([...cells]);
    const tick = () => { if (me !== job) return; fill(color, left.splice(0, per)); left.length ? requestAnimationFrame(tick) : done(); };
    tick();
  });
  ctx.clearRect(0, 0, cv.width, cv.height); // the glass shows through, as on the other screens
  await run(on, ink('--xn-fg'), PER_FRAME);
  await new Promise(r => setTimeout(r, 2500));
  const all = []; for (let y = -2; y < h + 2; y++) for (let x = -2; x < w + 2; x++) all.push([x, y]);
  await run(all, ink('--xn-accent'), 60);
  if (me === job) setTimeout(play, 600);
}
cv.addEventListener('click', play);
cv.addEventListener('keydown', e => { if (e.key === 'Enter') play(); });

onScheme(play);
new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); }, { threshold: 0.4 }).observe(cv);
