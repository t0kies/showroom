// showroom: offload bay's kiosk screen, the frames lib/ui.sh draws on the
// Pi's little terminal, played through one card. The card is made up.
// TK · xoxn · 2026
import { $, esc } from '../../lib/dom.js';

const W = 35, H = 11; // the attached terminal, in cells
// on the Pi's console ▣ takes two cells and ✓ one; the font here has neither, so each is pinned to its cells
const WIDTH = { '▣': 2 };
const len = s => [...s].reduce((n, c) => n + (WIDTH[c] ?? 1), 0);
const cells = s => esc(s).replace(/[▣✓]/g, c => `<span class="w${WIDTH[c] ?? 1}">${c}</span>`);
const span = (cls, s) => (cls ? `<span class="${cls}">${cells(s)}</span>` : cells(s));
// padded on both sides to the full W, so every line is the screen's width and the screen sits centered
const center = (s, cls) => {
  const left = Math.max(0, (W - len(s)) >> 1);
  return span(cls, `${' '.repeat(left)}${s}`) + ' '.repeat(Math.max(0, W - left - len(s)));
};

// sym_dir, sym_sd ... straight out of lib/symbols.sh
const glyphs = fetch('samples/symbols.sh').then(r => r.text()).then(sh =>
  Object.fromEntries([...sh.matchAll(/sym_(\w+)\(\) \{\ncat <<'EOF'\n([\s\S]*?)\nEOF/g)].map(m => [m[1], m[2].split('\n')])));

// ui_show_symbol, ui_show_progress, ui_show, ui_done: each clears and centers
const symbol = (g, label, detail, status) => [...g.map(l => center(l)), '', center(label, 'k-title'), detail ? center(detail, 'k-dim') : null, status ? '' : null, status ? center(status) : null];
const bar = (i, n) => '█'.repeat(Math.floor((i * 20) / n)) + '░'.repeat(20 - Math.floor((i * 20) / n));
const progress = (title, label, i, n) => [center(title, 'k-title'), '', center(label), '', center(bar(i, n)), center(`${i} / ${n}`, 'k-dim')];
const show = (title, status) => [center(title, 'k-title'), '', center(status)];
const done = msg => [center(`✓ ${msg}`, 'k-ok')];

// one card from plug-in to safe-to-remove; the shell log beside it uses xoxn/sh/lib.sh's marks
function* card(g) {
  const T = 'SD CARD · videos', N = 12;
  yield [symbol(g.dir, 'READY', 'Plug in a card, drive, or phone.'), null];
  yield [symbol(g.sd, 'SD CARD DETECTED', 'A001  (/dev/sda1)'), ['info', 'sd card on /dev/sda1']];
  for (const n of [3, 2, 1]) yield [symbol(g.sd, 'SD CARD DETECTED', 'A001  (/dev/sda1)', `Starting in ${n}...`), null];
  yield [symbol(g.sd, 'Mounting...', 'A001'), ['ok', 'mounted /mnt/card']];
  yield [show(T, 'Scanning...'), ['info', '12 .mp4 over 1 GB']];
  for (let i = 0; i <= N; i++) yield [progress(T, 'Copying...', i, N), i === N ? ['ok', 'copied 12 files'] : null];
  for (let i = 0; i <= N; i++) yield [progress(T, 'Verifying with md5', i, N), i === N ? ['ok', '12 of 12 match'] : null];
  yield [show('SD CARD · photos', 'No matching files.'), ['warn', 'photos: no .raw files']];
  yield [symbol(g.sd, 'Safe to remove SD CARD', 'A001'), ['ok', 'safe to remove']];
  yield [done('demo finished'), null];
}

const MARK = { ok: ['✓', 'k-ok'], info: ['→', 'k-info'], warn: ['!', 'k-warn'], fail: ['✗', 'k-err'] };
const stamp = () => new Date().toTimeString().slice(0, 8);
let log = [];

function paint(lines, entry) {
  const body = lines.filter(l => l !== null);
  const top = Math.max(0, (H - body.length) >> 1);
  const blank = ' '.repeat(W);
  $('kiosk').innerHTML = [...Array(top).fill(blank), ...body, ...Array(Math.max(0, H - top - body.length)).fill(blank)].join('\n');
  if (!entry) return;
  const [mark, cls] = MARK[entry[0]];
  log = [...log, `<span class="k-dim">${stamp()}</span> ${span(cls, mark)} ${esc(entry[1])}`].slice(-9);
  $('kiosk-log').innerHTML = log.join('\n');
}

glyphs.then(g => {
  let frames = card(g);
  setInterval(() => {
    let next = frames.next();
    if (next.done) { frames = card(g); log = []; next = frames.next(); }
    paint(...next.value);
  }, 450);
});
