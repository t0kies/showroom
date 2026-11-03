// showroom: a screen that's a fixed number of cells wide (data-fit) gets the
// biggest crisp size that fits its glass, 11 or 22px (or less on a phone), and the cell sizes
// that go with it. TK · xoxn · 2026
const SIZES = [22, 11]; // Departure Mono is crisp only at multiples of 11
const AIR = 4; // cells of padding, two each side

function size(box, fs) {
  box.style.setProperty('--fs', `${fs}px`);
  box.style.setProperty('--px', `${fs / 11}px`);
  box.style.setProperty('--cw', `${fs * 7 / 11}px`);
  box.style.setProperty('--lh', `${fs * 14 / 11}px`);
}

function fit() {
  for (const pre of document.querySelectorAll('[data-fit]')) {
    const box = pre.parentElement, cols = +pre.dataset.fit + AIR;
    // a phone too narrow even for 11px gets the size that fits; soft beats a side scroll
    const fs = SIZES.find(s => cols * s * 7 / 11 <= box.clientWidth) ?? (box.clientWidth * 11) / (cols * 7);
    size(box, fs);
    // a glyph from outside the font can run a little wide; measure, and shrink if so
    // (some styles don't scale with the font, so measure again until it fits)
    for (let i = 0, f = fs; i < 3; i++) {
      const room = box.clientWidth - (AIR * f * 7) / 11;
      if (pre.scrollWidth <= room + 1) break;
      size(box, (f = (f * room) / pre.scrollWidth));
    }
  }
}

// fit again whenever a box or its text changes width: page resize, fonts, the text arriving
const seen = new WeakMap();
const watch = new ResizeObserver(boxes => {
  if (boxes.some(b => seen.get(b.target) !== b.contentRect.width)) fit();
  for (const b of boxes) seen.set(b.target, b.contentRect.width);
});
for (const pre of document.querySelectorAll('[data-fit]')) { watch.observe(pre.parentElement); watch.observe(pre); }
fit();
