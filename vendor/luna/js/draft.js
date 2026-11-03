// Flat files → sheets on a canvas, sized in font pixels and scaled up
// pixelated by the page like the text around them. Shapes are drawn the way
// every picture is: flat outlines, rim in ink, boundaries between colors in
// rust, no fill.
//
// SVG: an engineering drawing on grid paper in real units, with a double
// border, overall dimensions in teal and a title block.
// PDF: the page; grid PDFs set in the UI font on the 7×14 cell grid,
// anything else printed as is at full screen resolution.

import { classifyLabels, CREASE, RIM } from './dots.js';
import { labels, canvas, SS } from './viewers.js';
import { token as css, rgba } from './palette.js';

const MM = { mm: 1, cm: 10, in: 25.4, pt: 25.4 / 72, pc: 25.4 / 6 };
const CW = 7, LH = 14; // Departure Mono cell at 11px
const STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

const num = v => String(Math.round(v * 10) / 10);

// viewBox in user units, and mm per user unit when width carries a physical
// unit (OpenSCAD writes mm); null means plain units.
function sizeOf(svgText, img) {
  const root = svgText.match(/<svg\b[^>]*>/i)?.[0] || '';
  const attr = n => root.match(new RegExp(`\\s${n}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
  const vb = (attr('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  const box = vb.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0
    ? vb : [0, 0, img.naturalWidth || 300, img.naturalHeight || 150];
  const w = (attr('width') || '').match(/^([\d.]+)\s*(mm|cm|in|pt|pc)$/i);
  return { box, mm: w ? (parseFloat(w[1]) * MM[w[2].toLowerCase()]) / box[2] : null };
}

// Exact extent of plain absolute paths (M L H V Z, no transforms), which is
// what OpenSCAD writes; null for anything else, which is measured from pixels.
function pathBounds(svgText) {
  if (/transform\s*=|<(?:circle|ellipse|rect|polygon|polyline|line|use|text|image)\b/i.test(svgText)) return null;
  const ds = [...svgText.matchAll(/\sd\s*=\s*["']([^"']*)["']/g)].map(m => m[1]);
  if (!ds.length) return null;
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const at = (x, y) => {
    b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x);
    b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y);
  };
  for (const d of ds) {
    if (/[^MLHVZz\d\s,.eE+-]/.test(d)) return null;
    let x = 0, y = 0;
    for (const [, cmd, args] of d.matchAll(/([MLHVZz])([^MLHVZz]*)/g)) {
      const n = (args.match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || []).map(Number);
      if (cmd === 'H') n.forEach(v => at((x = v), y));
      else if (cmd === 'V') n.forEach(v => at(x, (y = v)));
      else for (let i = 0; i + 1 < n.length; i += 2) at((x = n[i]), (y = n[i + 1]));
    }
  }
  return b.x0 <= b.x1 ? b : null;
}

// svgText → { canvas: the W×H drawing sheet, meta: { w, h, unit, grid } }.
export async function draftSVG(svgText, name, W, H) {
  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    await document.fonts.load('11px "Departure Mono"');
    return sheet(svgText, img, name, W, H);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sheet(svgText, img, name, W, H) {
  const { box, mm } = sizeOf(svgText, img);
  const unit = mm ? 'MM' : 'U';
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const g = out.getContext('2d');
  g.font = '11px "Departure Mono"';
  g.textBaseline = 'top';
  const INK = css('--ink'), RUST = css('--R'), TEAL = css('--G');

  const hline = (x0, x1, y) => g.fillRect(Math.min(x0, x1), y, Math.abs(x1 - x0) + 1, 1);
  const vline = (x, y0, y1) => g.fillRect(x, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1);
  const frame = (x, y, w, h) => { hline(x, x + w - 1, y); hline(x, x + w - 1, y + h - 1); vline(x, y, y + h - 1); vline(x + w - 1, y, y + h - 1); };
  const text = (t, x, y, color) => {
    g.clearRect(x - 2, y, t.length * CW + 4, LH); // keep the grid off the label
    g.fillStyle = color;
    g.fillText(t, x, y);
  };

  // ── Layout: border, title block, room for the dimensions ────────────────
  const inner = { x: 7, y: 7, w: W - 14, h: H - 14 };
  const tbRows = 3;
  const tbW = Math.min(inner.w, CW * Math.max(name.length, 22) + 12);
  const tbH = tbRows * (LH + 2) + 1;
  const area = { x: inner.x + 14, y: inner.y + 14 };
  area.w = inner.x + inner.w - 14 - 48 - area.x; // right: vertical dimension + label
  area.h = inner.y + inner.h - tbH - 6 - 28 - area.y; // bottom: horizontal dimension + label
  const s = Math.min(area.w / box[2], area.h / box[3]); // px per user unit
  const dw = Math.max(1, Math.round(box[2] * s)), dh = Math.max(1, Math.round(box[3] * s));
  const ox = area.x + Math.floor((area.w - dw) / 2), oy = area.y + Math.floor((area.h - dh) / 2);

  // ── Paper: grid in real units, lined up with the drawing's origin ───────
  const perUnit = s / (mm || 1); // px per mm (or per unit)
  const minor = STEPS.find(v => v * perUnit >= 6) ?? STEPS[STEPS.length - 1];
  const major = minor * (String(minor).replace(/[0.]/g, '')[0] === '5' ? 2 : 5);
  const X0 = ox - box[0] * s, Y0 = oy - box[1] * s;
  g.fillStyle = TEAL;
  const grid = (x0, x1, y0, y1) => {
    for (const [step, alpha] of [[minor, 0.1], [major, 0.24]]) {
      g.globalAlpha = alpha;
      const d = step * perUnit;
      for (let x = X0 + Math.ceil((x0 - X0) / d) * d; x <= x1; x += d) vline(Math.round(x), y0, y1);
      for (let y = Y0 + Math.ceil((y0 - Y0) / d) * d; y <= y1; y += d) hline(x0, x1, Math.round(y));
    }
    g.globalAlpha = 1;
  };
  grid(inner.x, inner.x + inner.w - 1, inner.y, inner.y + inner.h - 1);
  g.fillStyle = INK;
  frame(3, 3, W - 6, H - 6);
  frame(inner.x - 1, inner.y - 1, inner.w + 2, inner.h + 2);

  // ── Design: flat outlines, no fill ───────────────────────────────────────
  const r = canvas(dw * SS, dh * SS);
  r.drawImage(img, 0, 0, dw * SS, dh * SS);
  const label = labels(r, dw, dh);
  const cls = classifyLabels(label, dw, dh, 3);
  for (const [c, color] of [[CREASE, RUST], [RIM, INK]]) {
    g.fillStyle = color;
    for (let i = 0; i < cls.length; i++) if (cls[i] === c) g.fillRect(ox + (i % dw), oy + Math.floor(i / dw), 1, 1);
  }

  // ── Extent: exact from the paths when possible, else from the pixels ────
  let b = pathBounds(svgText);
  if (!b) {
    b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (let i = 0; i < label.length; i++) {
      if (!label[i]) continue;
      const x = (i % dw) / s + box[0], y = Math.floor(i / dw) / s + box[1];
      b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x + 1 / s);
      b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y + 1 / s);
    }
  }
  const k = mm || 1;
  const wU = (b.x1 - b.x0) * k, hU = (b.y1 - b.y0) * k;

  // ── Dimensions: overall width under, overall height to the right ───────
  if (Number.isFinite(wU)) {
    const bx0 = Math.round(X0 + b.x0 * s), bx1 = Math.round(X0 + b.x1 * s) - 1;
    const by0 = Math.round(Y0 + b.y0 * s), by1 = Math.round(Y0 + b.y1 * s) - 1;
    g.fillStyle = TEAL;
    // width
    const y = oy + dh + 8;
    vline(bx0, by1 + 3, y + 3);
    vline(bx1, by1 + 3, y + 3);
    hline(bx0, bx1, y);
    for (let d = 1; d <= 3; d++) { vline(bx0 + d, y - d, y + d); vline(bx1 - d, y - d, y + d); }
    const wt = num(wU);
    text(wt, Math.round((bx0 + bx1) / 2 - (wt.length * CW) / 2), y + 3, TEAL);
    // height
    g.fillStyle = TEAL;
    const x = ox + dw + 8;
    hline(bx1 + 3, x + 3, by0);
    hline(bx1 + 3, x + 3, by1);
    vline(x, by0, by1);
    for (let d = 1; d <= 3; d++) { hline(x - d, x + d, by0 + d); hline(x - d, x + d, by1 - d); }
    text(num(hU), x + 5, Math.round((by0 + by1) / 2 - LH / 2), TEAL);
  }

  // ── Title block, bottom right ────────────────────────────────────────────
  const tx = inner.x + inner.w - tbW, ty = inner.y + inner.h - tbH;
  g.clearRect(tx, ty, tbW, tbH);
  g.fillStyle = INK;
  frame(tx, ty, tbW + 1, tbH + 1);
  const rowsText = [
    name.toUpperCase(),
    Number.isFinite(wU) ? `${num(wU)} × ${num(hU)} ${unit}` : '—',
    `GRID ${minor} ${unit} · KLOVES`,
  ];
  const meta = { w: num(wU), h: num(hU), unit, grid: minor };
  rowsText.forEach((t, i) => {
    const y = ty + i * (LH + 2);
    if (i) hline(tx, tx + tbW, y);
    g.fillStyle = i ? INK : RUST;
    g.fillText(t.slice(0, Math.floor((tbW - 10) / CW)), tx + 6, y + 2);
    g.fillStyle = INK;
  });
  return { canvas: out, meta };
}

// ── PDF page ───────────────────────────────────────────────────────────────

// catio writes "grid CxR" into a PDF's keywords: its text sits on a C×R grid
// of Courier cells, the same shape as ours.
async function gridOf(doc) {
  const { info } = await doc.getMetadata().catch(() => ({}));
  const m = /\bgrid (\d+)x(\d+)\b/.exec(info?.Keywords || '');
  return m ? { cols: +m[1], rows: +m[2] } : null;
}

// Page n (0-based) → { canvas, meta }. A grid PDF that fits is set cell for
// cell in the UI font; anything else is printed as pdf.js draws it, at full
// screen resolution (hi device pixels per font pixel), in ink. Either way
// text is never moved, so nothing can pile up.
export async function draftPDF(doc, n, W, H, hi = 1) {
  const page = await doc.getPage(n + 1);
  const grid = await gridOf(doc);
  const d = grid && grid.cols * CW <= W && grid.rows * LH <= H
    ? await gridPage(page, grid, W, H)
    : await printPage(page, W, H, hi);
  d.meta = { pages: doc.numPages, mode: d.meta.mode, hi: d.meta.hi };
  return d;
}

// The page edge, f px thick; a page taller than wide is a slip torn off a
// roll, so its bottom edge zigzags.
function edge(g, x, y, w, h, f) {
  const torn = h > w;
  const tear = i => Math.abs((i % 8) - 4) * f; // 0..4 font px up from the bottom
  g.fillRect(x, y, w, f);
  g.fillRect(x, y, f, h - (torn ? tear(0) : 0));
  g.fillRect(x + w - f, y, f, h - (torn ? tear(w / f - 1) : 0));
  if (!torn) {
    g.fillRect(x, y + h - f, w, f);
    return;
  }
  for (let i = 0; i < w / f; i++) g.fillRect(x + i * f, y + h - f - tear(i), f, f);
}

async function gridPage(page, { cols, rows }, W, H) {
  await document.fonts.load('11px "Departure Mono"');
  const pw = cols * CW, ph = rows * LH;
  const vp1 = page.getViewport({ scale: 1 });
  const scale = pw / vp1.width; // one PDF cell = one 7×14 cell
  const ox = Math.floor((W - pw) / 2 / CW) * CW, oy = Math.floor((H - ph) / 2 / LH) * LH;

  // graphics only (pdf.js draws glyphs with fillText), as flat outlines
  const r = canvas(pw * SS, ph * SS);
  r.fillText = r.strokeText = () => {};
  await page.render({ canvasContext: r, viewport: page.getViewport({ scale: scale * SS }) }).promise;
  const cls = classifyLabels(labels(r, pw, ph), pw, ph, 3);

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const g = out.getContext('2d');
  const INK = css('--ink'), RUST = css('--R');
  // dimmed text: the ink at 55%, like the --dim role (light or dark palette)
  const DIM = `rgba(${rgba('--ink').slice(0, 3).map(c => Math.round(c * 255)).join(', ')}, 0.55)`;
  for (const [c, color] of [[CREASE, RUST], [RIM, INK]]) {
    g.fillStyle = color;
    for (let i = 0; i < cls.length; i++) if (cls[i] === c) g.fillRect(ox + (i % pw), oy + Math.floor(i / pw), 1, 1);
  }
  g.fillStyle = INK;
  edge(g, ox, oy, pw, ph, 1);

  // text: each run starts in the cell its baseline and x fall in
  const vp = page.getViewport({ scale });
  const font = id => { try { return page.commonObjs.get(id)?.name || ''; } catch { return ''; } };
  g.font = '11px "Departure Mono"';
  g.textBaseline = 'top';
  for (const it of (await page.getTextContent()).items) {
    if (!it.str || !it.str.trim()) continue;
    const [x, y] = vp.convertToViewportPoint(it.transform[4], it.transform[5]);
    const col = Math.round(x / CW), row = Math.floor(y / LH);
    if (row < 0 || row >= rows || col >= cols) continue;
    g.fillStyle = /Oblique|Italic/i.test(font(it.fontName)) ? DIM : INK;
    g.fillText(it.str.slice(0, cols - col), ox + col * CW, oy + row * LH + 1);
  }
  return { canvas: out, meta: { mode: 'grid', hi: 1 } };
}

async function printPage(page, W, H, hi) {
  const vp1 = page.getViewport({ scale: 1 });
  const scale = Math.min(W / vp1.width, H / vp1.height) * 0.96;
  const pw = Math.round(vp1.width * scale * hi), ph = Math.round(vp1.height * scale * hi);
  const r = canvas(pw, ph);
  await page.render({ canvasContext: r, viewport: page.getViewport({ scale: scale * hi }) }).promise;

  // paper → transparent, print → ink: darkness becomes the ink's alpha
  const img = r.getImageData(0, 0, pw, ph);
  const px = img.data;
  const ink = rgba('--ink').slice(0, 3).map(c => Math.round(c * 255));
  for (let i = 0; i < px.length; i += 4) {
    const a = 255 - (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11);
    px[i] = ink[0]; px[i + 1] = ink[1]; px[i + 2] = ink[2]; px[i + 3] = a;
  }
  r.putImageData(img, 0, 0);

  const out = document.createElement('canvas');
  out.width = Math.round(W * hi);
  out.height = Math.round(H * hi);
  const g = out.getContext('2d');
  const f = Math.max(1, Math.round(hi));
  const ox = Math.round((out.width - pw) / 2 / f) * f, oy = Math.round((out.height - ph) / 2 / f) * f;
  g.drawImage(r.canvas, ox, oy);
  g.fillStyle = css('--ink');
  edge(g, ox, oy, Math.floor(pw / f) * f, Math.floor(ph / f) * f, f);
  return { canvas: out, meta: { mode: 'print', hi } };
}
