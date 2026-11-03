// showroom: grunts' Go TUI (tools/demo/internal/panel) as text: the tab bar,
// the screen and the key help. It counts the same hits as the OLED beside it
// (hits.js). TK · xoxn · 2026
import './demo.js';
import { $, esc } from '../../lib/dom.js';
import { hits, hit, onHit } from './hits.js';
import { themes, applyTheme } from './themes.js';
import { W, span } from './text.js';
import { st, SCREENS } from './screens.js';

// app/tabs.go also has STATUS, CALIBRATE and SETTINGS; they need the band itself
const TABS = ['HEART', 'PUNCH', 'AIM'];

async function draw() {
  const name = (await themes)[st.theme].name;
  const bar = TABS.map((t, i) => (i === st.tab ? span('g-tab', ` ${t} `) : `<span class="g-dim" data-tab="${i}"> ${t} </span>`)).join('');
  const body = SCREENS[st.tab]();
  const help = span('g-dim', '[← →] tab  [p] punch  [t] ') + `<span class="g-accent" data-theme>${esc(name)}</span>`;
  $('grunts').innerHTML = [bar, '─'.repeat(W), '', ...body, ...Array(Math.max(0, 15 - body.length)).fill(''), '─'.repeat(W), help].join('\n');
}

async function nextTheme() {
  const list = await themes;
  st.theme = (st.theme + 1) % list.length;
  applyTheme($('grunts').parentElement, list[st.theme]);
  draw();
}

onHit(kind => {
  st.aim = [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30];
  if (kind === 'PUNCH') {
    st.bpm = Math.min(178, st.bpm + Math.round(Math.random() * 4));
    st.flash = true;
    setTimeout(() => { st.flash = false; draw(); }, 150);
  }
  if (hits.punches === 0) st.bpm = 96;
  draw();
});

$('grunts').addEventListener('click', e => {
  if (e.target.dataset.tab) { st.tab = +e.target.dataset.tab; draw(); }
  if ('theme' in e.target.dataset) nextTheme();
});
// tab moves focus on a web page, so the arrows switch tabs here
$('grunts').addEventListener('keydown', e => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!step && e.key !== 'p' && e.key !== 't') return;
  e.preventDefault();
  e.stopPropagation(); // p here is a punch, not the next color scheme
  if (step) { st.tab = (st.tab + step + 3) % 3; draw(); }
  else if (e.key === 't') nextTheme();
  else hit(10); // a quick spike: a punch
});
setInterval(() => { st.beat = !st.beat; if (st.tab === 0) draw(); }, 600);
draw();
