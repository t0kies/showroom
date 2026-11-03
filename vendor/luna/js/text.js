// Text primitives. A screen is an array of lines; a line is an array of
// segments: { t: text, a?: action, href?: url, c?: class, id?: live-region id,
// tab?: focusable, kids?: inner segments }. Every segment is exactly
// cells(t) wide; a segment with kids is drawn as them (t is their plain text), so
// a live region can hold colored text and still be patched as one span.

export const S = (t, o = {}) => ({ t: String(t), ...o });

export const btn = (t, a, o = {}) => S(t, { a, tab: true, ...o });

export const link = (t, href) => S(t, { href });

// Cells in a string: one per code point, so astral glyphs (🮂…🮆, two UTF-16
// units each) still take one cell.
export const cells = t => (/[\uD800-\uDFFF]/.test(t) ? [...t].length : t.length);

export const width = segs => segs.reduce((n, s) => n + cells(s.t), 0);

export const rpad = (s, n) => String(s).padEnd(n).slice(0, n);
export const lpad = (s, n) => String(s).padStart(n).slice(-n);

// Pad or truncate a line of segments to exactly w cells.
export function fit(segs, w) {
  const out = [];
  let n = 0;
  for (const s of segs) {
    if (n >= w) break;
    const room = w - n;
    const len = cells(s.t);
    if (len > room) {
      out.push({ ...s, t: len === s.t.length ? s.t.slice(0, room) : [...s.t].slice(0, room).join('') });
      n = w;
    } else {
      out.push(s);
      n += len;
    }
  }
  if (n < w) out.push(S(' '.repeat(w - n)));
  return out;
}

const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// A segment painted with an area gradient (s.g, screen.js paint) carries
// its cell position, so css/areas.css can lay the gradient over the whole
// screen by shifting each span's background (background-attachment: fixed
// did the same, but made Firefox repaint every span on every change).
function segHTML(s, col = 0, row = 0) {
  if (s.kids) {
    const id = s.id ? ` id="${esc(s.id)}"` : '';
    return `<span${id}>${lineHTML(s.kids, row, col)}</span>`;
  }
  const t = esc(s.t);
  const cls = s.c ? ` ${s.c}` : '';
  // s.delay: where a flash is in its count (screen.js flash), in ms
  const css = [s.g && `--c:${col};--r:${row}`, s.delay != null && `animation-delay:${s.delay}ms`].filter(Boolean).join(';');
  const pos = css ? ` style="${css}"` : '';
  if (s.href) {
    return `<a class="b${cls}" href="${esc(s.href)}" target="_blank" rel="noopener noreferrer"${pos}>${t}</a>`;
  }
  if (s.a) {
    const tab = s.tab ? ' tabindex="0" role="button"' : '';
    return `<span class="b${cls}" data-a="${esc(s.a)}"${tab}${pos}>${t}</span>`;
  }
  if (s.id || s.c) {
    const id = s.id ? ` id="${esc(s.id)}"` : '';
    const c = s.c ? ` class="${s.c}"` : '';
    return `<span${id}${c}${pos}>${t}</span>`;
  }
  return t;
}

// A line of segments; row and the starting column place gradient segments.
export function lineHTML(segs, row = 0, col = 0) {
  let html = '';
  for (const s of segs) {
    html += segHTML(s, col, row);
    col += cells(s.t);
  }
  return html;
}

export const toHTML = lines => lines.map((l, r) => lineHTML(l, r)).join('\n');

// ── Box drawing ────────────────────────────────────────────────────────────

// Horizontal rule with an inline title and right-aligned controls:
// ╟─ TITLE ─────────────── [A] [B] ─╢. The screen's own edge is double
// (╔ ╚ corners draw ═), the rules inside it single.
export function rule(W, l, r, title = [], right = []) {
  const h = '╔╚'.includes(l) ? '═' : '─';
  const head = title.length ? [S(`${l}${h} `), ...title, S(' ')] : [S(`${l}${h}`)];
  let tail = right.length ? [S(' '), ...right, S(` ${h}${r}`)] : [S(`${h}${r}`)];
  if (width(head) + width(tail) > W) tail = [S(`${h}${r}`)];
  const fill = Math.max(0, W - width(head) - width(tail));
  return fit([...head, S(h.repeat(fill)), ...tail], W);
}

// ║ content ║, inside the screen's double edge
export const row = (W, segs, l = '║', r = '║') => [S(`${l} `), ...fit(segs, W - 4), S(` ${r}`)];

// ── Seven-segment LCD digits ───────────────────────────────────────────────
// 3x5 dot digits drawn with half blocks, 3 cols x 3 rows per glyph:
//   aaa      █▀█
//   f b      █▀█   a = top, b/c = right, d = bottom,
//   ggg      ▀▀▀   e/f = left, g = middle
//   e c
//   ddd      Unlit segments ghost, like a real LCD.

const SEGS = {
  0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg',
  5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg',
  P: 'abefg', '-': 'g', '+': '', ' ': '',
};

function merge(segs) {
  const out = [];
  for (const s of segs) {
    const last = out[out.length - 1];
    if (last && last.c === s.c) last.t += s.t;
    else out.push({ ...s });
  }
  return out;
}

const PIX = {
  a: [[0, 0], [1, 0], [2, 0]], b: [[2, 0], [2, 1], [2, 2]], c: [[2, 2], [2, 3], [2, 4]],
  d: [[0, 4], [1, 4], [2, 4]], e: [[0, 2], [0, 3], [0, 4]], f: [[0, 0], [0, 1], [0, 2]],
  g: [[0, 2], [1, 2], [2, 2]],
};

// One char from two stacked dots, each 0 off / 1 ghost / 2 lit. A char has a
// single colour, so ghost halves only show in cells with nothing lit.
function half(top, bot) {
  const lv = Math.max(top, bot);
  if (!lv) return S(' ');
  const t = top === lv, b = bot === lv;
  return S(t && b ? '█' : t ? '▀' : '▄', lv === 1 ? { c: 'gh' } : {});
}

export function seg7(str) {
  const rows = [[], [], []];
  [...str].forEach((ch, i) => {
    if (i) for (const r of rows) r.push(S(' '));
    if (ch === '.') {
      rows[0].push(S(' '));
      rows[1].push(S(' '));
      rows[2].push(S('▀'));
      return;
    }
    // A sign isn't a digit: blank for +, just the middle bar for −, never a
    // ghost 8 beside the number.
    if (ch === '+' || ch === ' ') {
      for (const r of rows) r.push(S('   '));
      return;
    }
    const on = SEGS[ch] ?? '';
    const ghost = ch !== '-';
    const px = Array.from({ length: 6 }, () => [0, 0, 0]);
    for (const [seg, dots] of Object.entries(PIX)) {
      const lv = on.includes(seg) ? 2 : ghost ? 1 : 0;
      for (const [x, y] of dots) px[y][x] = Math.max(px[y][x], lv);
    }
    for (let r = 0; r < 3; r++) {
      for (let x = 0; x < 3; x++) rows[r].push(half(px[2 * r][x], px[2 * r + 1][x]));
    }
  });
  return rows.map(merge);
}
