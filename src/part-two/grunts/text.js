// showroom: grunts' panel text: a line is W cells, centered like lipgloss,
// and the big numbers use its own digit font. TK · xoxn · 2026
import { esc } from '../../lib/dom.js';

export const W = 48; // cells, the tab bar's width

// panel/digitfont.go: 3x5, and the 1 sits on the right
const FONT = {
  0: ['###', '# #', '# #', '# #', '###'], 1: ['  #', '  #', '  #', '  #', '  #'], 2: ['###', '  #', '###', '#  ', '###'],
  3: ['###', '  #', '###', '  #', '###'], 4: ['# #', '# #', '###', '  #', '  #'], 5: ['###', '#  ', '###', '  #', '###'],
  6: ['###', '#  ', '###', '# #', '###'], 7: ['###', '  #', '  #', '  #', '  #'], 8: ['###', '# #', '###', '# #', '###'],
  9: ['###', '# #', '###', '  #', '###'],
};
export const span = (cls, s) => `<span class="${cls}">${esc(s)}</span>`;
export const pad = s => ' '.repeat(Math.max(0, (W - s.length) >> 1));
export const center = (s, cls = '') => pad(s) + (cls ? span(cls, s) : esc(s));
export const bigDigits = (n, cls) => [0, 1, 2, 3, 4].map(r => center([...String(n)].map(c => FONT[c][r]).join(' ').replaceAll('#', '█'), cls));
