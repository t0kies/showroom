// Colors from the CSS palette (css/palette.css, or a palette laid over it)
// for what's painted on canvases: the 3D view (gl3d.js) and the sheets
// (draft.js). Tokens may be written in any CSS color syntax.

// The skins in css/xoxn/skin/ (vendored from @xoxn/skins), in the order P
// cycles them: xorxnor (the house default, light/dark from the system),
// positive (dark ink on a lit panel), then the dark ones.
export const PALETTES = ['xorxnor', 'signal', 'silver', 'amber', 'gameboy', 'nokia', 'cmyk', 'stn', 'plasma', 'vfd', 'twilight'];

// Where a skin's file is: luna's own (css/skin/: signal, for colour-vision
// deficiency) or a vendored one. index.html picks the first the same way.
export const OWN = ['signal'];
export const skinHref = name => (OWN.includes(name) ? `css/skin/${name}.css` : `css/xoxn/skin/${name}.css`);

// The palette index.html picked before first paint.
export const current = () => document.documentElement.dataset.palette || 'xorxnor';

// Swap the palette's swatch file; done() runs once its colors apply, for
// whatever cached them (canvases). Remembered for the next visit.
export function usePalette(name, done) {
  const link = document.getElementById('palette');
  link.onload = () => done?.();
  link.href = skinHref(name);
  document.documentElement.dataset.palette = name;
  try { localStorage.setItem('luna.palette', name); } catch {}
  const url = new URL(location.href);
  if (url.searchParams.has('palette')) {
    url.searchParams.set('palette', name);
    history.replaceState(null, '', url);
  }
}

// A token's value as written (var() already resolved by the browser).
export const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// The canvas parses CSS colors for us and hands back '#rrggbb' or
// 'rgba(r, g, b, a)'.
const probe = document.createElement('canvas').getContext('2d');

// A token as [r, g, b, a], each 0..1.
export function rgba(name) {
  probe.fillStyle = '#000';
  probe.fillStyle = token(name) || '#000';
  const s = probe.fillStyle;
  const hex = s.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (hex) return [1, 2, 3].map(i => parseInt(hex[i], 16) / 255).concat(1);
  const [r, g, b, a = 1] = s.match(/[\d.]+/g).map(Number);
  return [r / 255, g / 255, b / 255, a];
}
