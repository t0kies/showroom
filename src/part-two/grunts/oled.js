// showroom: grunts' 0.91" OLED (firmware/src/PunchDisplay.cpp) and its
// serial line, on the same hits as the terminal demo (hits.js). A punch
// or a move, no g. Its colors cycle through grunts' themes. TK · xoxn · 2026
import { $ } from '../../lib/dom.js';
import { hits, onHit } from './hits.js';
import { themes, applyTheme } from './themes.js';

const oled = $('oled'), st = { theme: 0 };

// punchScreen: the count big, PUNCHES under it, the last hit and the moves on the right
function draw() {
  oled.querySelector('b').textContent = hits.punches;
  oled.querySelector('i').textContent = `last ${(hits.last ?? '—').toLowerCase()}\nmoves ${hits.moves}`;
}

onHit((kind, riseMs) => {
  draw();
  // main.cpp prints one line a hit
  $('serial').textContent = kind === 'PUNCH' ? `PUNCH #${hits.punches} ${hits.ppm}/min` : `MOVE rise${riseMs}ms`;
  if (kind !== 'PUNCH') return;
  oled.classList.add('flash'); // flashUntil = now + 160
  setTimeout(() => oled.classList.remove('flash'), 160);
});

async function nextTheme() {
  const list = await themes;
  st.theme = (st.theme + 1) % list.length;
  const theme = list[st.theme];
  applyTheme(oled, theme);
  $('oled-theme').textContent = `colors: ${theme.name === 'SCREEN' ? 'PANEL' : theme.name}`;
}

$('oled-theme').addEventListener('click', nextTheme);
oled.addEventListener('click', nextTheme);
oled.addEventListener('keydown', e => {
  if (e.key !== 't' && e.key !== 'Enter') return;
  e.preventDefault();
  e.stopPropagation(); // t here is the OLED's colors, not the page's
  nextTheme();
});
draw();
