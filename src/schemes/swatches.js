// showroom: the scheme's colors as ooo swatches; a click copies one and the
// status line says which. TK · xoxn · 2026
import { $ } from '../lib/dom.js';
import { hexOf, ink } from '../lib/color.js';
import { label, scheme } from './state.js';

const INKS = ['glass-hi', 'glass', 'glass-lo', 'ink', 'on', 'accent', 'r', 'g', 'b', 'c', 'm', 'y', 'o', 'p'];
const xn = k => hexOf(ink(`--xn-${k}`));

$('swatches').innerHTML = INKS.map(k =>
  `<button type="button" class="game-choice" data-k="${k}"><span class="blocks" style="color: var(--xn-${k})">███\n███</span><span class="key">${k}</span></button>`).join('');
$('swatches').onclick = e => {
  const k = e.target.closest('[data-k]')?.dataset.k;
  if (!k) return;
  navigator.clipboard?.writeText(xn(k)).catch(() => {});
  $('status').textContent = `${k} is ${xn(k)} in ${label(SKINS[scheme.at])}, copied`;
};
