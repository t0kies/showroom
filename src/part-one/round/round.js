// showroom: one round of Odd One Out against the cats, using ooo's own
// helpers and rules (35 s, five hearts, the shade closing in each level).
// TK · xoxn · 2026
import { markChoices } from '../../../vendor/ooo/scripts/ui/choices.js';
import { pickIndex } from '../../../vendor/ooo/scripts/ui/pick-keys.js';
import { button, line } from '../../../vendor/ooo/scripts/lib/dom.js';
import { blocks } from '../../../vendor/ooo/scripts/lib/grid.js';
import { oddOf } from '../../../vendor/ooo/scripts/lib/odd.js';
import { settings } from '../../../vendor/ooo/scripts/lib/settings.js';
import { $ } from '../../lib/dom.js';
import { ink } from '../../lib/color.js';
import { onScheme } from '../../schemes/state.js';
import { hud, showStandings } from './board.js';
import { tick } from './clock.js';

const HUES = ['accent', 'r', 'g', 'b', 'c', 'm', 'y', 'o', 'p'];
const st = { level: 1, hp: settings.match.startingHealth, right: 0, picks: 0, odd: 0, hue: 'accent', locked: false, over: false, end: 0 };
let buttons = [];
const hex = k => { const c = document.createElement('canvas').getContext('2d'); c.fillStyle = ink(`--xn-${k}`); return c.fillStyle; };

function deal(keepHue = false) {
  if (!keepHue) {
    st.hue = HUES[Math.floor(Math.random() * HUES.length)];
    st.odd = Math.floor(Math.random() * 3);
  }
  const base = hex(st.hue), odd = oddOf(base, st.level);
  $('choices').replaceChildren();
  buttons = [0, 1, 2].map(i => {
    const choice = button('', 'game-choice', () => pick(i));
    const swatch = line('blocks', blocks(6, 2));
    swatch.style.color = i === st.odd ? odd : base;
    choice.append(swatch, line('key', `${i + 1} ${'QWE'[i]}`));
    choice.disabled = st.over;
    $('choices').append(choice);
    return choice;
  });
}

function pick(i) {
  if (st.locked || st.over) return;
  st.locked = true;
  st.end ||= Date.now() + settings.match.seconds * 1000; // the clock starts on the first pick
  st.picks++;
  const hit = i === st.odd;
  if (hit) { st.right++; st.level++; } else st.hp--;
  markChoices(buttons, st.odd, hit ? -1 : i);
  hud(st, !hit);
  setTimeout(() => { st.locked = false; if (st.hp <= 0) finish('Out of hearts'); else deal(); }, 700);
}

function finish(why) {
  st.over = true;
  for (const b of buttons) b.disabled = true;
  $('verdict').textContent = `${why}. ${st.right} right, ${st.right > 14 ? 'ahead of pickles' : 'pickles is still first'}.`;
  $('again').hidden = false;
}

function start() {
  Object.assign(st, { level: 1, hp: settings.match.startingHealth, right: 0, picks: 0, over: false, locked: false, end: 0 });
  $('again').hidden = true;
  $('verdict').textContent = '';
  hud(st);
  deal();
  tick(st, finish);
}

$('again').onclick = start;
$('nick').oninput = () => showStandings(st);
addEventListener('keydown', e => {
  if (e.key === ' ' && st.over && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); start(); return; }
  const i = pickIndex(e, 3);
  if (i >= 0) pick(i);
});
setInterval(() => tick(st, finish), 250);
start();
onScheme(() => deal(true)); // a new screen: same round, its colors
