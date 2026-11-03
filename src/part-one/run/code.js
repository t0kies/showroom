// showroom: 04, the run's firmware twice: luna's highlighter on one side,
// xorxnor's code block on the other. TK · xoxn · 2026
import { S, rule, row, toHTML } from '../../../vendor/luna/js/text.js';
import { highlighter } from '../../../vendor/luna/js/syntax.js';
import { $, esc } from '../../lib/dom.js';
import { files, cols } from './files.js';

export async function code() {
  const lines = (await files.c).replace(/\n$/, '').split('\n');
  const W = cols($('luna-code'));
  const hl = highlighter('main.c', lines)(lines.length);
  $('luna-code').innerHTML = toHTML([rule(W, '╔', '╗', [S('MAIN.C')]), ...hl.map(l => row(W, l)), rule(W, '╚', '╝')]);
  const n = String(lines.length).length + 2;
  $('xorx-code').innerHTML = lines.map((l, k) =>
    `<div style="display: flex"><span class="tui-code-number" style="width: ${n}ch">${k + 1}</span><span class="tui-code-text">${esc(l)}</span></div>`).join('');
}
