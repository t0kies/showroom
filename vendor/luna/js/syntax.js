// Raw view syntax colors, retro palette (see css/screen.css). A tiny line
// lexer per language: ordered sticky regexes, plus blocks (comments, PDF
// streams) whose state carries across lines. Lines → rows of segments.

import { S } from './text.js';

// Classes: sk keyword · st type · sf function/head · ss string · sn number
// · sa attribute/key/preprocessor · sc comment · sp punctuation.

const words = s => new Set(s.split(/\s+/));

const C_KW = words(`if else for while do return switch case default break continue goto
  struct union enum typedef static const volatile extern inline sizeof register
  true false NULL nullptr`);
const C_TYPES = words(`void char short int long float double signed unsigned bool
  size_t ssize_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t
  uintptr_t intptr_t`);
const SCAD_KW = words(`module function if else for let each include use true false undef
  assert echo intersection_for`);
const PDF_KW = words(`obj endobj stream endstream xref trailer startxref R true false null n f`);

const before = (line, start) => line.slice(0, start).trimEnd();
const callNext = (line, end) => /^\s*\(/.test(line.slice(end));

const STR2 = /"(?:[^"\\]|\\.)*"?/y;
const STR1 = /'(?:[^'\\]|\\.)*'?/y;
const NUM = /(?:0[xX][\da-fA-F]+|0[bB][01]+|\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+)[uUlLfF]*/y;
const PUNCT = /[{}()[\];,]/y;
const OPS = /[-+*/%=<>!&|^~?:.]+/y;
const SLASH_COMMENT = { open: /\/\*/y, close: /\*\//g, c: 'sc' };

const LANGS = {
  c: {
    blocks: [SLASH_COMMENT],
    rules: [
      [/\/\/.*/y, 'sc'],
      [/#\s*[a-z]+/y, 'sa'],
      [/<[\w./-]+>/y, (w, line) => (/^\s*#\s*include/.test(line) ? 'ss' : null)],
      [STR2, 'ss'],
      [STR1, 'ss'],
      [/[A-Za-z_]\w*/y, (w, line, end) =>
        C_KW.has(w) ? 'sk' : C_TYPES.has(w) || /_t$/.test(w) ? 'st' : callNext(line, end) ? 'sf' : ''],
      [NUM, 'sn'],
      [PUNCT, 'sp'],
      [OPS, 'sp'],
    ],
  },
  scad: {
    blocks: [SLASH_COMMENT],
    rules: [
      [/\/\/.*/y, 'sc'],
      [STR2, 'ss'],
      [/\$\w+/y, 'sa'],
      [/[A-Za-z_]\w*/y, (w, line, end) => (SCAD_KW.has(w) ? 'sk' : callNext(line, end) ? 'sf' : '')],
      [NUM, 'sn'],
      [PUNCT, 'sp'],
      [OPS, 'sp'],
    ],
  },
  json: {
    rules: [
      [STR2, (w, line, end) => (/^\s*:/.test(line.slice(end)) ? 'sa' : 'ss')],
      [/-?\d+\.?\d*(?:[eE][-+]?\d+)?/y, 'sn'],
      [/(?:true|false|null)\b/y, 'sk'],
      [/[{}[\],:]/y, 'sp'],
    ],
  },
  // KiCad files: (head arg arg (head …))
  sexp: {
    rules: [
      [STR2, 'ss'],
      [/[()]/y, 'sp'],
      [/-?\d+\.?\d*(?![\w.:-])/y, 'sn'],
      [/[A-Za-z_][\w.:-]*/y, (w, line, end, start) =>
        before(line, start).endsWith('(') ? 'sf' : /^(?:yes|no|true|false|none)$/.test(w) ? 'sk' : ''],
    ],
  },
  xml: {
    blocks: [{ open: /<!--/y, close: /-->/g, c: 'sc' }, { open: /<!\[CDATA\[/y, close: /\]\]>/g, c: 'ss' }],
    rules: [
      [/<[?!]?\/?[\w:.-]*/y, (w, l, e, s, st) => { st.tag = true; return 'sk'; }],
      [/[?/]?>/y, (w, l, e, s, st) => { if (!st.tag) return ''; st.tag = false; return 'sk'; }],
      [/[\w:.-]+(?=\s*=)/y, (w, l, e, s, st) => (st.tag ? 'sa' : '')],
      [/"[^"]*"?|'[^']*'?/y, (w, l, e, s, st) => (st.tag ? 'ss' : '')],
      [/&#?\w+;/y, 'sn'],
      [/[^<&"'\s=>?/]+/y, ''],
    ],
  },
  // Raw PDF: objects and dictionaries colored, stream bodies dimmed.
  pdf: {
    blocks: [{ open: /stream(?=\s*$)/y, close: /endstream/g, c: 'sc' }],
    rules: [
      [/%.*/y, 'sc'],
      [/\/[^\s/<>[\]()%]*/y, 'sa'],
      [/\((?:[^()\\]|\\.)*\)?/y, 'ss'],
      [/<<|>>|[[\]]/y, 'sp'],
      [/<[\da-fA-F\s]*>/y, 'ss'],
      [/[-+]?(?:\d+\.?\d*|\.\d+)/y, 'sn'],
      [/[A-Za-z*'"]+/y, w => (PDF_KW.has(w) ? 'sk' : 'sf')],
    ],
  },
};

const EXT = {
  c: 'c', h: 'c', cpp: 'c', hpp: 'c', cc: 'c', ino: 'c',
  json: 'json', kicad_pro: 'json',
  kicad_pcb: 'sexp', kicad_sch: 'sexp', kicad_mod: 'sexp', kicad_sym: 'sexp',
  scad: 'scad', svg: 'xml', xml: 'xml', pdf: 'pdf',
};

export const langOf = name => EXT[name.split('.').pop().toLowerCase()] || null;

function tokenize(line, L, st) {
  const segs = [];
  const put = (t, c) => {
    if (!t) return;
    const last = segs[segs.length - 1];
    if (last && (last.c || '') === c) last.t += t;
    else segs.push(S(t, c ? { c } : {}));
  };
  let i = 0;
  next: while (i < line.length) {
    if (st.block) {
      const b = st.block;
      b.close.lastIndex = i;
      const m = b.close.exec(line);
      const end = m ? m.index + m[0].length : line.length;
      put(line.slice(i, end), b.c);
      if (m) st.block = null;
      i = end;
      continue;
    }
    for (const b of L.blocks || []) {
      b.open.lastIndex = i;
      const m = b.open.exec(line);
      if (m) {
        put(m[0], b.c);
        st.block = b;
        i += m[0].length;
        continue next;
      }
    }
    for (const [re, c] of L.rules) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (!m || !m[0]) continue;
      const cls = typeof c === 'function' ? c(m[0], line, i + m[0].length, i, st) : c;
      if (cls != null) { // a rule may decline its match with null
        put(m[0], cls);
        i += m[0].length;
        continue next;
      }
    }
    put(line[i], '');
    i++;
  }
  return segs;
}

// A rule's class may be a function (match, line, end, start, state) → class,
// or null to let later rules try.

// Lines of a file → a function giving its first n highlighted rows. Rows are
// built on demand and kept, so paging through a big file stays cheap and a
// block opened on page 1 is still known on page 9.
export function highlighter(name, lines) {
  const L = LANGS[langOf(name)];
  const out = [];
  const st = {};
  return n => {
    for (let k = out.length; k < Math.min(n, lines.length); k++) {
      out.push(L ? tokenize(lines[k], L, st) : [S(lines[k])]);
    }
    return out;
  };
}

// One hexdump row "00000000  de ad be ef  |....|" → offset dim, ASCII teal.
export function hexSegs(line) {
  const bar = line.indexOf('|');
  return [S(line.slice(0, 8), { c: 'sc' }), S(line.slice(8, bar)), S(line.slice(bar), { c: 'st' })];
}
