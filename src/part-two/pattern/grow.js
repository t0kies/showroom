// showroom: 11, maze-patterns' idea in the browser: Gray-Scott reaction-diffusion
// grown from round seeds until it settles into rounded worms and beans with room
// between them. F and k land somewhere in that range each run. TK · xoxn · 2026
export const N = 160; // cells a side
export const STEPS = 4000;
const DU = 0.16, DV = 0.08;

// a seeded random, so a run can be played again
export function random(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32; };
}

// U everywhere, V in 24 round seeds; F 0.034 to 0.040 and k 0.0612 to 0.0622 grow worms
export function seed(n) {
  const rand = random(n), U = new Float32Array(N * N).fill(1), V = new Float32Array(N * N);
  for (let s = 0; s < 24; s++) {
    const x = 10 + Math.floor(rand() * (N - 20)), y = 10 + Math.floor(rand() * (N - 20)), r = 4 + Math.floor(rand() * 4);
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      if (i * i + j * j <= r * r) { U[(y + j) * N + x + i] = 0.5; V[(y + j) * N + x + i] = 0.25 + rand() * 0.05; }
    }
  }
  const F = 0.034 + rand() * 0.006, k = 0.0612 + rand() * 0.001;
  return { U, V, U2: new Float32Array(N * N), V2: new Float32Array(N * N), F, k, t: 0 };
}

// one step; the edges wrap round, and inside a box (cells in from each edge) V stays out
export function step(g, inset = 0) {
  const { U, V, U2, V2, F, k } = g;
  for (let y = 0; y < N; y++) {
    const up = ((y + N - 1) % N) * N, down = ((y + 1) % N) * N, row = y * N;
    for (let x = 0; x < N; x++) {
      const l = (x + N - 1) % N, r = (x + 1) % N, i = row + x, u = U[i], v = V[i];
      const Lu = U[up + x] + U[down + x] + U[row + l] + U[row + r] - 4 * u;
      const Lv = V[up + x] + V[down + x] + V[row + l] + V[row + r] - 4 * v;
      const uvv = u * v * v;
      U2[i] = Math.min(1, Math.max(0, u + DU * Lu - uvv + F * (1 - u)));
      const out = x < inset || y < inset || x >= N - inset || y >= N - inset;
      V2[i] = out ? 0 : Math.min(1, Math.max(0, v + DV * Lv + uvv - (F + k) * v));
    }
  }
  [g.U, g.U2, g.V, g.V2] = [U2, U, V2, V];
  g.t++;
}
