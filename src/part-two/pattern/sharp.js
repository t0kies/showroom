// showroom: 11, the pattern made sharp like sharp_maze_svg.py does it: over the
// threshold is wall, specks under 40 cells go, holes under 25 fill, then a
// radius-2 closing. TK · xoxn · 2026
export const THRESHOLD = 0.2; // a little under the script's 0.25, for rounder blobs

// cells of one value joined side to side; any group under min flips
function dropSmall(b, n, value, min) {
  const seen = new Uint8Array(n * n), stack = [], group = [];
  for (let s = 0; s < n * n; s++) {
    if (seen[s] || b[s] !== value) continue;
    group.length = 0; stack.push(s); seen[s] = 1;
    while (stack.length) {
      const i = stack.pop(), x = i % n;
      group.push(i);
      for (const j of [x > 0 && i - 1, x < n - 1 && i + 1, i - n, i + n]) {
        if (j !== false && j >= 0 && j < n * n && !seen[j] && b[j] === value) { seen[j] = 1; stack.push(j); }
      }
    }
    if (group.length < min) for (const i of group) b[i] = 1 - value;
  }
}

// grow (dilate) or shrink (erode) by a disk; past the edge counts as open
function morph(b, n, r, grow) {
  const disk = [];
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) disk.push([i, j]);
  const out = new Uint8Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const hit = disk[grow ? 'some' : 'every'](([i, j]) => { const a = x + i, c = y + j; return a >= 0 && c >= 0 && a < n && c < n ? b[c * n + a] : !grow; });
    out[y * n + x] = hit ? 1 : 0;
  }
  return out;
}

export function sharpen(V, n) {
  const b = Uint8Array.from(V, v => (v > THRESHOLD ? 1 : 0));
  dropSmall(b, n, 1, 40);
  dropSmall(b, n, 0, 25);
  return morph(morph(b, n, 2, true), n, 2, false);
}

// the walls blurred a little, so their outlines come out round instead of stepped
export function soften(b, n, r = 2) {
  let a = Float32Array.from(b);
  for (const pass of [0, 1, 0, 1]) {
    const out = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      let s = 0, c = 0;
      for (let d = -r; d <= r; d++) { const i = pass ? x : x + d, j = pass ? y + d : y; if (i >= 0 && j >= 0 && i < n && j < n) { s += a[j * n + i]; c++; } }
      out[y * n + x] = s / c;
    }
    a = out;
  }
  return a;
}
