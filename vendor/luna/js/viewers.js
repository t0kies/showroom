// File → text renderers. Raw views are plain strings, one per screen row;
// the STL fallback is a dot grid for dots.js to draw as LCD outlines. SVG
// and PDF sheets are drawn by draft.js, 3D by gl3d.js.
// Character cells are 1:2 (w:h), so anything drawn here compensates for that.

import { classify, FOLD, CREASE } from './dots.js';

// ── Classification ─────────────────────────────────────────────────────────

export function kindOf(name, buf) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'stl') return 'stl';
  if (ext === 'svg') return 'svg';
  if (ext === 'pdf') return 'pdf';
  const head = new Uint8Array(buf, 0, Math.min(buf.byteLength, 4096));
  return head.includes(0) ? 'bin' : 'text';
}

// ── Raw text / hexdump ─────────────────────────────────────────────────────

// Latin-1 decode with control bytes shown as '·', so binary-ish text (PDF)
// still reads raw without breaking the grid.
export function textLines(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (const b of bytes) {
    if (b === 10) s += '\n';
    else if (b === 9) s += '    ';
    else if (b === 13) continue;
    else if (b < 32 || b === 127 || (b >= 128 && b < 160)) s += '·';
    else s += String.fromCharCode(b);
  }
  return s.split('\n');
}

const hex2 = b => b.toString(16).padStart(2, '0');

export function hexLines(buf, cols) {
  const bytes = new Uint8Array(buf);
  // 8 offset + 2 + n*3 + 1 + n + 2 cells per row
  const per = cols >= 78 ? 16 : cols >= 46 ? 8 : 4;
  const out = [];
  for (let o = 0; o < bytes.length; o += per) {
    const chunk = bytes.subarray(o, o + per);
    const hex = [...chunk].map(hex2).join(' ').padEnd(per * 3 - 1);
    const asc = [...chunk].map(b => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
    out.push(`${o.toString(16).padStart(8, '0')}  ${hex}  |${asc}|`);
  }
  return out;
}

// ── STL → shaded ASCII ─────────────────────────────────────────────────────

export function parseSTL(buf) {
  const dv = new DataView(buf);
  if (buf.byteLength >= 84) {
    const n = dv.getUint32(80, true);
    if (84 + n * 50 === buf.byteLength) {
      const out = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) {
        const o = 84 + i * 50 + 12;
        for (let j = 0; j < 9; j++) out[i * 9 + j] = dv.getFloat32(o + j * 4, true);
      }
      return out;
    }
  }
  const txt = new TextDecoder().decode(buf);
  const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g;
  const a = [];
  let m;
  while ((m = re.exec(txt))) a.push(+m[1], +m[2], +m[3]);
  return new Float32Array(a.slice(0, a.length - (a.length % 9)));
}


// ── STL → flat outline ─────────────────────────────────────────────────────

// Neighboring dots on different faces get an edge when the faces bend more
// than this, or when one is in front of the other by more than DEPTH dots.
const CREASE_COS = Math.cos((30 * Math.PI) / 180);
const DEPTH = 8;

export class StlView {
  constructor(tris) {
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < tris.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], tris[i + k]);
        max[k] = Math.max(max[k], tris[i + k]);
      }
    }
    const c = min.map((v, k) => (v + max[k]) / 2);
    let r = 0;
    for (let i = 0; i < tris.length; i += 3) {
      r = Math.max(r, Math.hypot(tris[i] - c[0], tris[i + 1] - c[1], tris[i + 2] - c[2]));
    }
    r = r || 1;
    this.v = tris.map((v, i) => (v - c[i % 3]) / r);
    this.count = tris.length / 9;
    this.size = max.map((v, k) => v - min[k]);

    // face normals; the angle between two never changes with the view
    const v = this.v;
    this.n = new Float32Array(this.count * 3);
    for (let t = 0; t < this.count; t++) {
      const o = t * 9;
      const ux = v[o + 3] - v[o], uy = v[o + 4] - v[o + 1], uz = v[o + 5] - v[o + 2];
      const wx = v[o + 6] - v[o], wy = v[o + 7] - v[o + 1], wz = v[o + 8] - v[o + 2];
      const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      const l = Math.hypot(nx, ny, nz) || 1;
      this.n[t * 3] = nx / l;
      this.n[t * 3 + 1] = ny / l;
      this.n[t * 3 + 2] = nz / l;
    }
  }

  // W×H cells → { cls, W, H } for dots.rows().
  dots(W, H, yaw, pitch) {
    const w = W * 2, h = H * 2;
    const zb = new Float32Array(w * h).fill(-Infinity);
    const face = new Int32Array(w * h).fill(-1);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    // one model unit = s dots across, s/2 dots down (dots are 1:2 like cells)
    const s = Math.min(W / 2, H) * 0.95 * 2;
    const P = new Float32Array(9);

    for (let t = 0; t < this.count; t++) {
      for (let k = 0; k < 3; k++) {
        const i = t * 9 + k * 3;
        const x = this.v[i], y = this.v[i + 1], z = this.v[i + 2]; // z is up
        const x1 = x * cy - y * sy;
        const y1 = x * sy + y * cy;
        P[k * 3] = w / 2 + x1 * s;                       // right
        P[k * 3 + 1] = h / 2 - (z * cp - y1 * sp) * s / 2; // down
        P[k * 3 + 2] = -(y1 * cp + z * sp) * s;           // toward viewer, in dots
      }
      const [ax, ay, az, bx, by, bz, qx, qy, qz] = P;
      const area = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
      if (Math.abs(area) < 1e-9) continue;

      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, qx)));
      const x9 = Math.min(w - 1, Math.ceil(Math.max(ax, bx, qx)));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by, qy)));
      const y9 = Math.min(h - 1, Math.ceil(Math.max(ay, by, qy)));
      for (let py = y0; py <= y9; py++) {
        const cyy = py + 0.5;
        for (let px = x0; px <= x9; px++) {
          const cxx = px + 0.5;
          const w0 = ((bx - cxx) * (qy - cyy) - (by - cyy) * (qx - cxx)) / area;
          const w1 = ((qx - cxx) * (ay - cyy) - (qy - cyy) * (ax - cxx)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * az + w1 * bz + w2 * qz;
          const idx = py * w + px;
          if (z > zb[idx]) {
            zb[idx] = z;
            face[idx] = t;
          }
        }
      }
    }

    const N = this.n;
    const cls = classify(w, h, i => face[i] >= 0, (i, j, fwd) => {
      const a = face[i], b = face[j];
      if (a === b) return 0;
      const dz = zb[i] - zb[j];
      if (dz > DEPTH) return FOLD;       // i is the near side of a step
      if (dz < -DEPTH || !fwd) return 0; // the far side, or marked from j
      const dot = N[a * 3] * N[b * 3] + N[a * 3 + 1] * N[b * 3 + 1] + N[a * 3 + 2] * N[b * 3 + 2];
      return dot < CREASE_COS ? CREASE : 0;
    });
    return { cls, W, H };
  }
}

// ── Canvas → labels (SVG, PDF) ─────────────────────────────────────────────

export const SS = 4; // canvas pixels per dot, each way

// A dot is inked when a quarter of its pixels are; its label is its mean ink
// color, 2 bits per channel, so differently colored parts outline apart.
export function labels(ctx, mw, mh) {
  const cw = mw * SS;
  const px = ctx.getImageData(0, 0, cw, mh * SS).data;
  const label = new Uint8Array(mw * mh);
  for (let my = 0; my < mh; my++) {
    for (let mx = 0; mx < mw; mx++) {
      let ink = 0, r = 0, g = 0, b = 0;
      for (let yy = 0; yy < SS; yy++) {
        for (let xx = 0; xx < SS; xx++) {
          const i = ((my * SS + yy) * cw + mx * SS + xx) * 4;
          if (px[i] + px[i + 1] + px[i + 2] < 3 * 235) {
            ink++;
            r += px[i]; g += px[i + 1]; b += px[i + 2];
          }
        }
      }
      if (ink >= (SS * SS) / 4) {
        label[my * mw + mx] = 1 + (((r / ink) >> 6) << 4 | ((g / ink) >> 6) << 2 | ((b / ink) >> 6));
      }
    }
  }
  return label;
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  return ctx;
}

// ── PDF → flat outline + text on the grid ──────────────────────────────────

const PDFJS = '../assets/vendor/pdfjs/';
let pdfjs = null;

// pdf.js is ~1.7 MB, so it only loads the first time a PDF is viewed.
function lib() {
  pdfjs ||= import(`${PDFJS}pdf.min.mjs`).then(m => {
    m.GlobalWorkerOptions.workerSrc = new URL(`${PDFJS}pdf.worker.min.mjs`, import.meta.url).href;
    return m;
  });
  return pdfjs;
}

export async function openPDF(buf) {
  const m = await lib();
  return m.getDocument({
    data: new Uint8Array(buf.slice(0)), // pdf.js takes ownership of what it's given
    standardFontDataUrl: new URL(`${PDFJS}standard_fonts/`, import.meta.url).href,
    isEvalSupported: false,
  }).promise;
}
