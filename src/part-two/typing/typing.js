// showroom: typing-speed (typing_speed.cpp), the ncurses typing test
// in a <pre>. Same rules: three passages, type over the first, Enter scores
// the right letters, 5 s without a key throws the line away. TK · xoxn · 2026
import { $, esc } from '../../lib/dom.js';
import { rightLetters } from './score.js';

const IDLE = 5000; // in ms
const RULE = '-'.repeat(38);

const passages = fetch('samples/passages.txt').then(r => r.text()).then(t => t.split('\n').filter(Boolean));
const st = { prompts: [], typed: '', score: 0, start: 0, last: 0 };
const rounds = []; // newest first: [number, right, of, seconds]
const any = list => list[Math.floor(Math.random() * list.length)];

// displayHeader, displayPrompt, displayTypedText, displayFooter
function draw() {
  const now = Date.now();
  const elapsed = st.start ? (now - st.start) / 1000 : 0;
  const idle = st.start ? Math.max(0, IDLE - (now - st.last)) : IDLE;
  const [first = '', ...rest] = st.prompts;
  const typed = [...first].map((c, i) => (i < st.typed.length
    ? `<span class="${st.typed[i] === c ? 't-ok' : 't-err'}">${esc(st.typed[i] === ' ' && c !== ' ' ? '_' : st.typed[i])}</span>`
    : `<span class="${i === st.typed.length ? 't-at' : 't-dim'}">${esc(c)}</span>`)).join('');
  const past = rounds.slice(0, 3).map(([n, right, of, secs]) => `<span class="t-dim">#${n}  ${right} of ${of} right in ${secs} s</span>`);
  $('typing').innerHTML = [RULE, `Timer: ${elapsed.toFixed(2)}  Score: ${st.score}  Idle: ${Math.floor(idle / 1000)}`, RULE,
    typed, ...rest.map(p => `<span class="t-dim">${esc(p)}</span>`), RULE, ...past].join('\n');
}

function enter(list) {
  const right = rightLetters(st.typed, st.prompts[0]);
  st.score += right;
  rounds.unshift([rounds.length + 1, right, st.prompts[0].length, st.start ? ((Date.now() - st.start) / 1000).toFixed(1) : '0.0']);
  st.prompts = [...st.prompts.slice(1), any(list)];
  Object.assign(st, { typed: '', start: 0 });
}

passages.then(list => {
  st.prompts = [any(list), any(list), any(list)];
  $('typing').addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Tab') return;
    e.stopPropagation(); // the page's own keys (p, 1 2 3, space) wait
    if (e.key.length > 1 && !['Backspace', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    if (!st.start) st.start = Date.now();
    st.last = Date.now();
    if (e.key === 'Backspace') st.typed = st.typed.slice(0, -1);
    else if (e.key === 'Enter') enter(list);
    else st.typed += e.key;
    draw();
  });
  draw();
});

setInterval(() => {
  if (st.start && Date.now() - st.last > IDLE) Object.assign(st, { typed: '', start: 0 });
  if (st.prompts.length) draw();
}, 100);
