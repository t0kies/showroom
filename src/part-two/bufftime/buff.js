// showroom: bufftime's own screens (vendor/bufftime/scripts), painted with
// its painter and ANSI palette. The sets are made up; nothing is saved.
// TK · xoxn · 2026
import { screenLines } from '../../../vendor/bufftime/scripts/screens/index.js';
import { createPainter, paletteCss } from '../../../vendor/bufftime/scripts/term/html.js';
import { THEMES, PALETTE } from '../../../vendor/bufftime/scripts/term/themes.js';
import { clean } from '../../../vendor/bufftime/scripts/log/store.js';
import { $ } from '../../lib/dom.js';

const W = 64, H = 30; // cells; 28 rows and up gets the ==== banner

// a made-up week: [days ago, hour, exercise, weight in lb, reps, feel]
const SETS = [
  [0, 7.6, 'squat', 135, 5, 'good'], [0, 7.7, 'squat', 155, 5, 'ok'], [0, 7.8, 'squat', 165, 3, 'bad'],
  [0, 8.0, 'push-up', 0, 20, 'good'], [0, 8.1, 'bent row', 95, 8, 'ok'],
  [2, 18.2, 'deadlift', 185, 5, 'good'], [2, 18.4, 'deadlift', 205, 3, 'ok'], [2, 18.6, 'pull-up', 0, 6, 'ok'],
  [5, 7.5, 'squat', 145, 5, 'ok'], [5, 7.8, 'bench', 115, 6, 'good'], [5, 8.0, 'bench', 125, 4, 'bad'],
];
const day = (ago, hour) => { const d = new Date(); d.setDate(d.getDate() - ago); d.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0); return d; };
const entries = SETS.map(([ago, hour, exercise, weight, reps, feel]) => clean({ at: day(ago, hour), exercise, weight, reps, feel }))
  .sort((a, b) => (a.at < b.at ? 1 : -1));

const st = {
  splash: false, frame: 0, tab: 0, theme: 0, help: false, note: null,
  log: { row: 2, exercise: 'squat', weight: '165', reps: '3', feel: 'bad', nameAt: -1 },
  hist: { sel: 0, top: 0, filter: '', days: 0, finding: false },
  best: { sel: 0, top: 0 },
};
const splash = { ...st, splash: true };

document.head.append(Object.assign(document.createElement('style'), {
  textContent: paletteCss(PALETTE).replace(/\.([cb]\d+)\{/g, '.buff .$1{'),
}));
const paintLog = createPainter($('buff-log'));
const paintSplash = createPainter($('buff-splash'));

function draw() {
  const th = THEMES[st.theme];
  for (const el of [$('buff-log'), $('buff-splash')]) el.parentElement.style.setProperty('--buff-bg', PALETTE[th.roles.bg]);
  paintLog(screenLines(st, { entries, W, H, frame: st.frame, th }), th);
  paintSplash(screenLines(splash, { entries, W: 40, H: 22, frame: st.frame, th }), th);
}

// the clicks bufftime's own app answers (app/actions.js), the ones a demo needs
function act(a) {
  const [name, arg] = a.split(':');
  if (name === 'tab') st.tab = arg === '+1' ? (st.tab + 1) % 3 : +arg;
  else if (name === 'theme') st.theme = (st.theme + 1) % THEMES.length;
  else if (name === 'row') st.log.row = +arg;
  else if (name === 'feel') st.log.feel = arg;
  else if (name === 'help') st.help = !st.help;
  else if (name === 'log') st.note = { text: 'not saved: this is a pamphlet', tone: 'warn', until: Date.now() + 4000 };
  draw();
}
for (const id of ['buff-log', 'buff-splash']) {
  $(id).addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a && a !== 'start') act(a); });
}
$('buff-log').addEventListener('keydown', e => {
  const a = { ArrowRight: 'tab:+1', ArrowLeft: `tab:${(st.tab + 2) % 3}`, t: 'theme', '?': 'help' }[e.key];
  if (!a) return;
  e.preventDefault();
  e.stopPropagation();
  act(a);
});

// bufftime ticks every 250 ms: the cursor and the splash's fire move on it
setInterval(() => { st.frame++; splash.frame = st.frame; draw(); }, 250);
draw();
