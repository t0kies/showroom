// showroom: maze-patterns' Gray-Scott reaction-diffusion
// (rd/reaction_diffusion.html): the grid and one step of it. TK · xoxn · 2026
export const W = 160, H = 100; // grid in cells, one canvas pixel each
const Du = 0.16, Dv = 0.08;
export const rd = {
  F: 0.035, k: 0.065,
  A: new Float32Array(W * H), B: new Float32Array(W * H),
  A2: new Float32Array(W * H), B2: new Float32Array(W * H),
};
const at = (x, y) => ((x + W) % W) + ((y + H) % H) * W;

// a noisy square in the middle, as the lab file seeds it, plus a few more so it reaches the edges sooner
export function reset() {
  rd.A.fill(1); rd.B.fill(0);
  const seeds = [[W / 2, H / 2, 10], ...Array.from({ length: 8 }, () => [Math.floor(Math.random() * W), Math.floor(Math.random() * H), 4])];
  for (const [cx, cy, r] of seeds) {
    for (let y = cy - r; y < cy + r; y++) for (let x = cx - r; x < cx + r; x++) {
      rd.A[at(x, y)] = 0.5 + (Math.random() * 0.04 - 0.02);
      rd.B[at(x, y)] = 0.25 + (Math.random() * 0.04 - 0.02);
    }
  }
}

export function step() {
  const { A, B, A2, B2, F, k } = rd;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = at(x, y), u = A[i], v = B[i];
    const n = [at(x, y - 1), at(x, y + 1), at(x - 1, y), at(x + 1, y)];
    const Lu = A[n[0]] + A[n[1]] + A[n[2]] + A[n[3]] - 4 * u;
    const Lv = B[n[0]] + B[n[1]] + B[n[2]] + B[n[3]] - 4 * v;
    const uvv = u * v * v;
    A2[i] = Math.min(1, Math.max(0, u + Du * Lu - uvv + F * (1 - u)));
    B2[i] = Math.min(1, Math.max(0, v + Dv * Lv + uvv - (F + k) * v));
  }
  [rd.A, rd.A2, rd.B, rd.B2] = [A2, A, B2, B];
}
