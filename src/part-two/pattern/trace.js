// showroom: 11, the walls' outlines, like skimage's find_contours: marching
// squares on a field at a level, each crossing slid to where the field
// actually crosses, and joined into closed loops. TK · xoxn · 2026
// corners top-left 8, top-right 4, bottom-right 2, bottom-left 1; edges T R B L
const CASES = [[], ['LB'], ['BR'], ['LR'], ['TR'], ['LB', 'TR'], ['TB'], ['TL'],
  ['TL'], ['TB'], ['TL', 'BR'], ['TR'], ['LR'], ['BR'], ['LB'], []];
// an edge's two corners; its key is its middle in half cells, a whole number
const ENDS = { T: [0, 0, 1, 0], R: [1, 0, 1, 1], B: [0, 1, 1, 1], L: [0, 0, 0, 1] };

export function trace(field, n, min = 10, level = 0.5) {
  const at = (x, y) => (x < 0 || y < 0 || x >= n || y >= n ? 0 : field[y * n + x]); // open past the edge, so every loop closes
  const where = new Map(), links = new Map();
  const point = (e, x, y) => {
    const [a, b, c, d] = ENDS[e], p = at(x + a, y + b), q = at(x + c, y + d), t = (level - p) / (q - p);
    const k = (2 * y + b + d + 2) * (2 * n + 4) + 2 * x + a + c + 2;
    where.set(k, [2 * (x + a + (c - a) * t), 2 * (y + b + (d - b) * t)]);
    return k;
  };
  const link = (p, q) => { for (const [a, c] of [[p, q], [q, p]]) (links.get(a) ?? links.set(a, []).get(a)).push(c); };
  for (let y = -1; y < n; y++) for (let x = -1; x < n; x++) {
    const c = (at(x, y) > level) * 8 + (at(x + 1, y) > level) * 4 + (at(x + 1, y + 1) > level) * 2 + (at(x, y + 1) > level);
    for (const [e, f] of CASES[c]) link(point(e, x, y), point(f, x, y));
  }
  const loops = [], done = new Set();
  for (const start of links.keys()) {
    if (done.has(start)) continue;
    const loop = [];
    for (let k = start, last = -1; !done.has(k);) {
      done.add(k); loop.push(where.get(k));
      const next = links.get(k).find(j => j !== last && !done.has(j)) ?? start;
      last = k; k = next;
    }
    if (loop.length > min) loops.push(loop);
  }
  return loops;
}

// a loop as SVG path data, in cells
export const pathOf = loop => `M${loop.map(([x, y]) => `${(x / 2).toFixed(2)},${(y / 2).toFixed(2)}`).join('L')}Z`;
