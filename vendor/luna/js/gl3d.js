// STL → real 3D on a canvas: flat, unshaded, outlines only. Faces go into
// the depth buffer only, so they hide whatever is behind them, then only the edges that define the shape are drawn on top: the
// outline (an edge between a face turned toward the eye and one turned away,
// found again every frame), creases (faces bending more than 30°) and open
// boundaries.

import { PALETTES, CREASE, FOLD, RIM } from './dots.js';
import { rgba } from './palette.js';

const CREASE_COS = Math.cos((30 * Math.PI) / 180);
const EYE = 3.4; // eye distance, in model radii

// ── Mesh: welded vertices, face normals, classified edges ─────────────────

export class Mesh3D {
  // tris: triangles already centered and scaled to radius 1 (StlView.v)
  constructor(tris) {
    const n = tris.length / 9;
    this.tris = tris;
    this.count = n;

    // STL repeats every vertex per face; weld them so faces share edges
    const ids = new Uint32Array(n * 3);
    const seen = new Map();
    const pos = [];
    for (let k = 0; k < n * 3; k++) {
      const x = tris[k * 3], y = tris[k * 3 + 1], z = tris[k * 3 + 2];
      const key = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)}`;
      let id = seen.get(key);
      if (id === undefined) {
        id = pos.length / 3;
        seen.set(key, id);
        pos.push(x, y, z);
      }
      ids[k] = id;
    }
    const P = (this.pos = new Float32Array(pos));

    const N = (this.normals = new Float32Array(n * 3));
    const flat = new Uint8Array(n); // degenerate faces have no direction
    for (let t = 0; t < n; t++) {
      const [a, b, c] = [ids[t * 3], ids[t * 3 + 1], ids[t * 3 + 2]].map(i => i * 3);
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
      const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz);
      if (!l) { flat[t] = 1; continue; }
      N[t * 3] = nx / l; N[t * 3 + 1] = ny / l; N[t * 3 + 2] = nz / l;
    }

    // edge → the faces on it, and which way each face walks it
    const edges = new Map();
    const nv = P.length / 3;
    for (let t = 0; t < n; t++) {
      for (let e = 0; e < 3; e++) {
        const a = ids[t * 3 + e], b = ids[t * 3 + ((e + 1) % 3)];
        if (a === b) continue;
        const key = Math.min(a, b) * nv + Math.max(a, b);
        let r = edges.get(key);
        if (!r) edges.set(key, (r = { a: Math.min(a, b), b: Math.max(a, b), f: [], up: [] }));
        r.f.push(t);
        r.up.push(a < b);
      }
    }

    const nonManifold = [], border = [], sil = [];
    const line = (out, a, b) => out.push(P[a * 3], P[a * 3 + 1], P[a * 3 + 2], P[b * 3], P[b * 3 + 1], P[b * 3 + 2]);
    for (const r of edges.values()) {
      if (r.f.length === 1) { line(border, r.a, r.b); continue; }
      if (r.f.length > 2) { line(nonManifold, r.a, r.b); continue; }
      const [f1, f2] = r.f;
      if (flat[f1] || flat[f2]) continue;
      // neighbors walking the edge the same way are wound inconsistently:
      // one of the normals points inward, so read it flipped
      const flip = r.up[0] === r.up[1] ? -1 : 1;
      const dot = flip * (N[f1 * 3] * N[f2 * 3] + N[f1 * 3 + 1] * N[f2 * 3 + 1] + N[f1 * 3 + 2] * N[f2 * 3 + 2]);
      sil.push(r.a, r.b, f1, f2, flip, dot < CREASE_COS ? 1 : 0);
    }
    this.nonManifold = new Float32Array(nonManifold);
    this.border = new Float32Array(border);
    this.sil = Int32Array.from(sil);
    this.rimOut = new Float32Array(sil.length);
    this.creaseOut = new Float32Array(sil.length);

    // extent around and along z, for fitting the view (see View3D.draw)
    let rxy = 0, hz = 0;
    for (let i = 0; i < P.length; i += 3) {
      rxy = Math.max(rxy, Math.hypot(P[i], P[i + 1]));
      hz = Math.max(hz, Math.abs(P[i + 2]));
    }
    this.rxy = rxy || 1;
    this.hz = hz;
  }

  // Edges for an eye at (ex, ey, ez): the outline, where one face turns
  // toward the eye and the other away, and the creases that aren't outline.
  edges(ex, ey, ez) {
    const { pos: P, normals: N, sil: S, rimOut: rim, creaseOut: crease } = this;
    let r = 0, c = 0;
    for (let i = 0; i < S.length; i += 6) {
      const a = S[i] * 3, b = S[i + 1] * 3, f1 = S[i + 2] * 3, f2 = S[i + 3] * 3;
      const dx = ex - P[a], dy = ey - P[a + 1], dz = ez - P[a + 2];
      const s1 = N[f1] * dx + N[f1 + 1] * dy + N[f1 + 2] * dz > 0;
      const s2 = S[i + 4] * (N[f2] * dx + N[f2 + 1] * dy + N[f2 + 2] * dz) > 0;
      let out;
      if (s1 !== s2) { out = rim; }
      else if (S[i + 5]) { out = crease; } // back ones fail the depth test
      else continue;
      let k = out === rim ? r : c;
      out[k++] = P[a]; out[k++] = P[a + 1]; out[k++] = P[a + 2];
      out[k++] = P[b]; out[k++] = P[b + 1]; out[k++] = P[b + 2];
      if (out === rim) r = k; else c = k;
    }
    return { rim: rim.subarray(0, r), crease: crease.subarray(0, c) };
  }
}

// ── View: WebGL, one flat-color program ───────────────────────────────────

// Model z is up. Yaw turns around z, then the eye sits pitch above the
// ground plane, EYE radii out, looking at the origin.
const VS = `
attribute vec3 p;
uniform vec4 r;   // cos yaw, sin yaw, cos pitch, sin pitch
uniform vec3 cam; // eye distance, focal, aspect
uniform vec2 off; // screen offset in clip units (the drop shadow pass)
void main() {
  float x1 = p.x * r.x - p.y * r.y;
  float y1 = p.x * r.y + p.y * r.x;
  float up = p.z * r.z + y1 * r.w;
  float toward = p.z * r.w - y1 * r.z;
  float w = cam.x - toward;
  float n = cam.x - 1.5, f = cam.x + 1.5;
  gl_Position = vec4(x1 * cam.y / cam.z, up * cam.y, (f + n) / (f - n) * w - 2.0 * f * n / (f - n), w);
  gl_Position.xy += off * w;
}`;

const FS = `
precision mediump float;
uniform vec4 c;
void main() { gl_FragColor = c; }`;

// A palette token, premultiplied for WebGL.
function color(name) {
  const [r, g, b, a] = rgba(name);
  return [r * a, g * a, b * a, a];
}

// dots.js palette classes → the palette tokens they paint with
const TOKEN = { '': '--ink', e2: '--R', e3: '--G', shadow: '--shadow' };

export class View3D {
  static create(canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true });
    return gl ? new View3D(canvas, gl) : null;
  }

  constructor(canvas, gl) {
    this.canvas = canvas;
    this.gl = gl;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    this.u = { r: gl.getUniformLocation(prog, 'r'), cam: gl.getUniformLocation(prog, 'cam'), c: gl.getUniformLocation(prog, 'c'), off: gl.getUniformLocation(prog, 'off') };
    const p = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(p);
    this.attr = p;
    this.buf = { faces: gl.createBuffer(), odd: gl.createBuffer(), border: gl.createBuffer(), crease: gl.createBuffer(), rim: gl.createBuffer() };
    this.mesh = null;
    this.colors = {};
  }

  setMesh(m) {
    if (m === this.mesh) return;
    const gl = this.gl;
    for (const [k, data] of [['faces', m.tris], ['odd', m.nonManifold], ['border', m.border]]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf[k]);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
    this.mesh = m;
  }

  // Internal size in font pixels; CSS scales it up, pixelated.
  resize(w, h) {
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
  }

  // Forget cached colors (the palette changed).
  recolor() {
    this.colors = {};
  }

  ink(cls) {
    const name = TOKEN[cls] || '--ink';
    return (this.colors[name] ||= color(name));
  }

  draw(yaw, pitch, look) {
    const { gl, mesh: m, u } = this;
    if (!m) return;
    const W = this.canvas.width, H = this.canvas.height;
    const pal = PALETTES[look.pal] || PALETTES.duo;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);

    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.uniform4f(u.r, cy, sy, cp, sp);
    // Fit the part's bounding cylinder (around z) at this pitch: it doesn't
    // change with yaw, so auto-rotation doesn't make the view breathe.
    const acp = Math.abs(cp), asp = Math.abs(sp);
    // depth halfway to the nearest point: parts rarely reach the cylinder's
    // near edge where they're also widest, so the full margin wastes room
    const near = EYE - 0.5 * (m.rxy * acp + m.hz * asp);
    const focal = 0.92 * near * Math.min((W / H) / m.rxy, 1 / (m.rxy * asp + m.hz * acp));
    gl.uniform3f(u.cam, EYE, focal, W / H);

    const pass = (buf, mode, n, c) => {
      if (!n) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(this.attr, 3, gl.FLOAT, false, 0, 0);
      gl.uniform4fv(u.c, c);
      gl.drawArrays(mode, 0, n);
    };

    // faces: depth only, pushed back a little so edges on them still pass
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    gl.colorMask(false, false, false, false);
    pass(this.buf.faces, gl.TRIANGLES, m.count * 3, [0, 0, 0, 0]);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.POLYGON_OFFSET_FILL);

    const e = m.edges(-EYE * cp * sy, -EYE * cp * cy, EYE * sp);
    const dyn = (buf, data) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      return data.length / 3;
    };
    const nCrease = dyn(this.buf.crease, e.crease), nRim = dyn(this.buf.rim, e.rim);
    const lines = color => {
      pass(this.buf.odd, gl.LINES, m.nonManifold.length / 3, color(pal[CREASE]));
      pass(this.buf.crease, gl.LINES, nCrease, color(pal[CREASE]));
      pass(this.buf.border, gl.LINES, m.border.length / 3, color(pal[FOLD]));
      pass(this.buf.rim, gl.LINES, nRim, color(pal[RIM]));
    };
    // The drop shadow, drawn here rather than by a CSS filter (which would
    // re-shadow the whole canvas every frame): every line once more, one
    // font pixel down and right, in the screen's shadow color, under the
    // real lines and without writing depth.
    const shadow = this.ink('shadow');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniform2f(u.off, 2 / W, -2 / H);
    lines(() => shadow);
    gl.uniform2f(u.off, 0, 0);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    lines(cls => this.ink(cls));
  }
}
