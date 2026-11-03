// showroom: the cover's scheme panel: the scheme's name and notes, the list of
// every scheme, and the status line. TK · xoxn · 2026
import { $ } from '../lib/dom.js';
import { label, slug, onScheme, pick } from './state.js';

$('skins').innerHTML = SKINS.map((s, j) => `<a class="tui-link" href="#${slug(s)}" data-i="${j}">${label(s)}</a>`).join('');
// a scheme picked from a list stops auto
export function pickFrom(e) {
  if (!e.target.dataset.i) return;
  e.preventDefault();
  pick(+e.target.dataset.i);
}
$('skins').onclick = pickFrom;

onScheme((s, at) => {
  $('name').textContent = label(s);
  $('about').textContent = s.about;
  $('mode').textContent = s.mode;
  $('status').textContent = `${label(s)} · ${at + 1} of ${SKINS.length} · from ${s.from} · used by ${s.used.join(', ') || 'nothing yet'}`;
  for (const a of $('skins').children) a.setAttribute('aria-current', a.dataset.i === String(at) ? 'page' : 'false');
});
