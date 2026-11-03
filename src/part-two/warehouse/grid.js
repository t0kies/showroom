// showroom: litterbox's live grid view (internal/view/web/index.html): the
// bins, the arm and the panel under them. TK · xoxn · 2026
import { $ } from '../../lib/dom.js';
import { COLS, ROWS, CAP, SHIFT, bins, arm, tally } from './yard.js';

export function build() {
  $('litter').style.setProperty('--cols', COLS);
  $('litter').innerHTML = bins.map(() => '<div class="cell"></div>').join('')
    + `<div class="cell special" style="grid-row: ${ROWS + 1}">HOME</div><div class="cell special" style="grid-row: ${ROWS + 1}; grid-column: ${COLS}">DROP-OFF</div><i id="arm"></i>`;
}

export function render() {
  const cells = $('litter').children;
  bins.forEach((b, i) => {
    cells[i].className = `cell ${b.qty ? b.kind : 'empty'}`;
    cells[i].innerHTML = `<div>${b.label}</div><div>${b.qty}/${b.max}</div><div class="stock-bar"><i style="width: ${b.qty ? Math.round((100 * b.qty) / b.max) : 100}%"></i></div>`;
  });
  const a = $('arm');
  a.style.left = `calc(${arm.x} * 100% / ${COLS})`;
  a.style.top = `calc(${arm.y} * 100% / ${ROWS + 1})`;
  a.classList.toggle('holding', arm.held.length > 0);
  $('litter-panel').innerHTML = `<div>state: <b>${arm.state}</b> &nbsp; pos: <b>(${arm.x.toFixed(2)}, ${arm.y.toFixed(2)})</b></div>`
    + `<div>carrying: <b>${arm.held.join(', ') || '—'}</b></div><div id="capbar"><i style="width: ${(100 * arm.held.length) / CAP}%"></i></div>`
    + `<div>${arm.held.length.toFixed(1)} / ${CAP.toFixed(1)} capacity used</div><div>delivered: <b>${tally.delivered}</b> &nbsp; on shift: <b>${SHIFT[tally.cat]}</b></div>`;
}
