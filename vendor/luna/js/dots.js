// Dot grid → LCD text. Every picture preview (STL, SVG, PDF) is drawn the
// same way: flat outlines in quadrant blocks, 2×2 dots per cell, no shading.
// A renderer fills a label buffer, classify() turns it into edge classes and
// rows() turns those into colored segments for the current look.

import { S } from './text.js';

// Bits: TL=1 TR=2 BL=4 BR=8.
const QUAD = ' ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█';

// Dot classes, in paint priority order: a cell takes the color of its
// strongest dot, since a char has a single color.
export const FILL = 1;   // inside a shape, not on an edge
export const CREASE = 2; // between two regions of one shape (fold, hole, color change)
export const FOLD = 3;   // a nearer part in front of a farther one
export const RIM = 4;    // shape against the background

// Looks: which CSS class each dot class is painted with ('' is plain ink).
export const PALETTES = {
  mono: { [CREASE]: '', [FOLD]: '', [RIM]: '', fill: 'gh' },
  duo: { [CREASE]: 'e2', [FOLD]: '', [RIM]: '', fill: 'gh' },
  tri: { [CREASE]: 'e2', [FOLD]: 'e3', [RIM]: '', fill: 'gt' },
};
export const PALETTE_ORDER = Object.keys(PALETTES);

const NB = [[-1, 0, false], [1, 0, true], [0, -1, false], [0, 1, true]];

// filled(i) says whether dot i is part of any shape; edge(i, j, fwd) returns
// the edge class dot i gets from its neighbor j (0 for none). fwd is true for
// the right/down neighbor, so a boundary between two regions can be marked
// on one side only and stays one dot thin.
export function classify(w, h, filled, edge = null) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!filled(i)) continue;
      let c = FILL;
      for (const [dx, dy, fwd] of NB) {
        const nx = x + dx, ny = y + dy;
        const j = ny * w + nx;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || !filled(j)) { c = RIM; break; }
        if (edge) c = Math.max(c, edge(i, j, fwd));
      }
      out[i] = c;
    }
  }
  return out;
}

// Classes for a plain label buffer (0 = background): edges where the label
// changes, drawn on the higher label's side so the line stays one dot thin.
// Used for SVG and PDF, where a label is a quantized color.
export function classifyLabels(label, w, h, R = 2) {
  const cls = classify(w, h, i => label[i] !== 0, (i, j) => (label[i] > label[j] ? CREASE : 0));
  // A stroke is a color region of its own; its border with the fill it
  // outlines would be a second line just inside the rim, so drop creases
  // within R dots of a rim.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (cls[y * w + x] !== CREASE) continue;
      near: for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && cls[ny * w + nx] === RIM) {
            cls[y * w + x] = FILL;
            break near;
          }
        }
      }
    }
  }
  return cls;
}

// { cls, W, H, text? } → rows of segments. cls is the (2W)×(2H) dot grid;
// text, if given, is W×H chars drawn over the dots (PDF text).
export function rows({ cls, W, H, text = null }, look) {
  const pal = PALETTES[look.pal] || PALETTES.duo;
  const w = W * 2;
  const out = [];
  for (let r = 0; r < H; r++) {
    const segs = [];
    const put = (t, c) => {
      const last = segs[segs.length - 1];
      if (last && (last.c || '') === c) last.t += t;
      else segs.push(S(t, c ? { c } : {}));
    };
    for (let col = 0; col < W; col++) {
      const ch = text && text[r * W + col];
      if (ch) { put(ch, ''); continue; }
      const i = r * 2 * w + col * 2;
      const d = [cls[i], cls[i + 1], cls[i + w], cls[i + w + 1]];
      let bits = 0, top = 0, fill = false;
      d.forEach((v, k) => {
        if (v > FILL) { bits |= 1 << k; top = Math.max(top, v); }
        else if (v === FILL) fill = true;
      });
      if (bits) put(QUAD[bits], pal[top]);
      else if (fill && look.fill) put('█', pal.fill);
      else put(' ', '');
    }
    out.push(segs);
  }
  return out;
}
