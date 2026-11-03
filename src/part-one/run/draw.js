// showroom: luna repaints the whole run on a new scheme and after a resize.
// TK · xoxn · 2026
import { onScheme } from '../../schemes/state.js';
import { hand, run } from './hand.js';
import { code } from './code.js';
import { model } from './model.js';
import { sheets } from './sheets.js';

export function draw() {
  hand();
  run();
  code();
  model();
  sheets();
}
onScheme(draw);

let resized = 0;
addEventListener('resize', () => { clearTimeout(resized); resized = setTimeout(draw, 200); });
