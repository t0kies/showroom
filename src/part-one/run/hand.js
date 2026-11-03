// showroom: 01 and 02 in luna's text cells: the six fingers, then the run and
// its files. TK · xoxn · 2026
import { S, btn, rule, row, seg7, toHTML, width } from '../../../vendor/luna/js/text.js';
import { $ } from '../../lib/dom.js';
import { HAND, FILES, cols, fmt } from './files.js';

// six fingers as luna's input bars draw their value: P1..P6 in LCD digits,
// the unlit segments still faintly there
export function hand() {
  const W = cols($('hand'));
  const lines = [rule(W, '╔', '╗', [S('KLOVES')], [btn('[GENERATE]', 'go', { c: 'inv' })])];
  HAND.forEach(([name, v], i) => {
    const tag = seg7(`P${i + 1}`), val = seg7(fmt(v));
    const pad = S(' '.repeat(Math.max(1, 15 - width(val[0]))));
    tag.forEach((t, r) => lines.push(row(W, [...t, S('  '), ...val[r], pad, S(r === 1 ? name : '', { c: 'dim' })])));
  });
  lines.push(rule(W, '╚', '╝'));
  $('hand').innerHTML = toHTML(lines);
}

export function run() {
  const W = cols($('run'));
  const right = n => S(n.padStart(W - 4 - 18));
  $('run').innerHTML = toHTML([
    rule(W, '╔', '╗', [S('ABFE417D373DBE87')]),
    row(W, [S('2026-10-29 21:04 UTC', { c: 'dim' })]),
    rule(W, '╟', '╢'),
    ...FILES.map(([f, n]) => row(W, [S(f.padEnd(18)), right(n)])),
    rule(W, '╟', '╢'),
    row(W, [S('READY', { c: 'pos' }), S('  '), S('CHECKS PENDING', { c: 'neg' })]),
    rule(W, '╚', '╝'),
  ]);
}
