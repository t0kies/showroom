// showroom: 08's cards. kloves and grunts show a function from their own code,
// colored by luna's highlighter; ooo's card plays a round with ooo's own oddOf().
// TK · xoxn · 2026
import { highlighter } from '../../../vendor/luna/js/syntax.js';
import { toHTML } from '../../../vendor/luna/js/text.js';
import { oddOf } from '../../../vendor/ooo/scripts/lib/odd.js';
import { blocks } from '../../../vendor/ooo/scripts/lib/grid.js';
import { $ } from '../../lib/dom.js';
import { hexOf, ink } from '../../lib/color.js';

// Go reads close enough to C for luna's C rules: comments, strings, calls
for (const pre of document.querySelectorAll('[data-snippet]')) {
  fetch(`samples/snippets/${pre.dataset.snippet}`).then(r => r.text()).then(code => {
    const lines = code.split('\n');
    pre.dataset.fit = Math.max(...lines.map(l => l.length)); // fit.js sizes it to the card
    pre.innerHTML = toHTML(highlighter('snippet.c', lines)(lines.length));
  });
}

// ooo on a card: three swatches in one of the scheme's colors, one a level's step off
const INKS = ['--xn-r', '--xn-g', '--xn-b', '--xn-c', '--xn-m', '--xn-y', '--xn-o', '--xn-p'];
let level = 1, odd = 0;
function deal() {
  const base = hexOf(ink(INKS[Math.floor(Math.random() * INKS.length)]));
  odd = Math.floor(Math.random() * 3);
  $('mini').innerHTML = [0, 1, 2].map(i =>
    `<button type="button" class="game-choice" data-i="${i}" aria-label="swatch ${i + 1}"><span class="blocks" style="color: ${i === odd ? oddOf(base, level) : base}">${blocks(5, 3)}</span></button>`).join('');
  $('mini-level').textContent = `level ${level} · find the odd one`;
}
$('mini').addEventListener('click', e => {
  const pick = e.target.closest('[data-i]');
  if (!pick) return;
  e.stopPropagation(); // a swatch plays; the rest of the card still goes to 06
  level = +pick.dataset.i === odd ? level + 1 : 1;
  deal();
});
deal();
new MutationObserver(deal).observe(document.documentElement, { attributeFilter: ['data-skin', 'data-mode'] });
