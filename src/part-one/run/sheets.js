// showroom: 05, the outline and the report as luna drafts them. TK · xoxn · 2026
import { draftSVG, draftPDF } from '../../../vendor/luna/js/draft.js';
import { $ } from '../../lib/dom.js';
import { files, px } from './files.js';

// a sheet is drawn once per screen and size, then copied in
async function sheet(id, make) {
  const cv = $(id);
  const w = Math.round(cv.clientWidth / px(cv)), h = Math.round(w * 0.75);
  const d = await make(w, h);
  cv.width = d.canvas.width;
  cv.height = d.canvas.height;
  cv.classList.toggle('print', d.meta?.mode === 'print');
  cv.getContext('2d').drawImage(d.canvas, 0, 0);
}

export function sheets() {
  sheet('sheet-svg', async (w, h) => draftSVG(await files.svg, 'profile.svg', w, h));
  sheet('sheet-pdf', async (w, h) => draftPDF(await files.pdf, 0, w, h, px($('sheet-pdf')) * (devicePixelRatio || 1)));
}
