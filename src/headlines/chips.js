// showroom: 17's scheme chips: every kit scheme at once, from its own numbers,
// not the live screen. A chip switches to its scheme. TK · xoxn · 2026
import { $ } from '../lib/dom.js';
import { label } from '../schemes/state.js';
import { pickFrom } from '../schemes/cover.js';

$('chips').innerHTML = SKINS.map((s, j) => [s, j]).filter(([s]) => s.chip && (s.mode === 'light' || !s.pinned)).map(([s, j]) =>
  `<button type="button" data-i="${j}" title="switch to ${label(s)}" style="background: ${s.chip[0]}; color: ${s.chip[1]}; border-color: ${s.chip[2]}">${s.name}</button>`).join('');
$('chips').onclick = pickFrom;
