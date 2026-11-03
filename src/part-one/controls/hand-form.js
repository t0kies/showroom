// showroom: 01's form. Generate draws the six bars from it, a number out of
// range is marked, and keep the receipt hides it from 02. TK · xoxn · 2026
import { $, onKey } from '../../lib/dom.js';
import { HAND } from '../run/files.js';
import { draw } from '../run/draw.js';

function generate() {
  document.querySelectorAll('.hand input[type=text]').forEach((input, i) => {
    const v = Number(input.value);
    const ok = input.value.trim() !== '' && Number.isFinite(v) && Math.abs(v) <= 3;
    input.setAttribute('aria-invalid', String(!ok));
    if (ok) HAND[i][1] = Math.round(v * 10) / 10;
  });
  draw();
}
document.querySelector('.hand').addEventListener('submit', generate);
$('hand').addEventListener('click', e => { if (e.target.closest('[data-a="go"]')) generate(); });
onKey($('hand'), e => { if (e.target.closest('[data-a="go"]')) generate(); });
// off leaves receipt.pdf out of the run's files in 02
document.querySelector('.hand input[type=checkbox]').addEventListener('change', e => {
  document.querySelector('a[href="samples/receipt.pdf"]').closest('tr').hidden = !e.target.checked;
});
