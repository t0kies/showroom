// showroom: 05's sheets each open the file they were drawn from. TK · xoxn · 2026
import { $, onKey } from '../../lib/dom.js';

for (const [id, file] of [['sheet-svg', 'profile.svg'], ['sheet-pdf', 'report.pdf']]) {
  const cv = $(id), go = () => open(`samples/${file}`, '_blank', 'noopener');
  Object.assign(cv, { title: `open ${file}`, tabIndex: 0 });
  cv.setAttribute('role', 'link');
  cv.addEventListener('click', go);
  onKey(cv, go);
}
