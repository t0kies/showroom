// showroom: the contents are buttons, not links, so the hash keeps naming the
// color scheme. TK · xoxn · 2026
import { $ } from '../lib/dom.js';

$('contents').onclick = e => {
  const go = e.target.closest('[data-go]');
  if (go) $(go.dataset.go).scrollIntoView({ behavior: 'smooth' });
};
