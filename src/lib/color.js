// showroom: the screen's colors, read back as numbers. TK · xoxn · 2026
// a CSS color as [r, g, b], read back off a canvas like ooo's logo.js does
const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
export function rgbOf(color) {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  return [...probe.getImageData(0, 0, 1, 1).data.slice(0, 3)];
}
export const hexOf = color => `#${rgbOf(color).map(c => c.toString(16).padStart(2, '0')).join('')}`;
export const ink = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
