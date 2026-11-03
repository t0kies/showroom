// showroom: 07, stools. The clock is the time of day until go live, then how
// long it's been live; the key bar picks the view. TK · xoxn · 2026
import { $, onKey } from '../../lib/dom.js';

const two = n => String(n).padStart(2, '0');
let since = 0;

function onair() {
  const d = since ? new Date(Date.now() - since) : new Date();
  const hms = since ? [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()] : [d.getHours(), d.getMinutes(), d.getSeconds()];
  const [h, , m, s] = $('onair').children;
  [h.textContent, m.textContent, s.textContent] = hms.map(two);
}
onair();
setInterval(onair, 1000);

const live = on => { since = on ? since || Date.now() : 0; $('live').setAttribute('aria-pressed', String(on)); $('live').textContent = on ? 'live' : 'go live'; onair(); };
$('live').onclick = () => live(true);
$('live-end').onclick = () => live(false);
$('live-save').onclick = e => {
  Object.assign(e.target, { textContent: 'saved', disabled: true });
  setTimeout(() => Object.assign(e.target, { textContent: 'save', disabled: false }), 1500);
};

// the window says which view the key bar picked
const view = a => {
  if (!a) return;
  for (const b of a.parentElement.children) b.removeAttribute('aria-current');
  a.setAttribute('aria-current', 'page');
  $('onair-win').dataset.title = `stools · ${a.dataset.view}`;
};
const bar = document.querySelector('.tui-keybar');
bar.addEventListener('click', e => view(e.target.closest('[data-view]')));
onKey(bar, e => view(e.target.closest('[data-view]')));
