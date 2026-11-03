// A screen is an array of lines; a line is an array of segments
// { t, r, a, inv, bold }: text, color role (themes.js), click action,
// reverse video, bold. Every glyph is one cell wide, so width is length.
// Nothing here knows about the DOM, so a terminal can print the same lines.

export const seg = (t, r = 'fg', extra = {}) => ({ t: String(t), r, ...extra });

export const width = line => line.reduce((n, s) => n + [...s.t].length, 0);

export const pad = (text, w) => [...String(text)].slice(0, w).join('').padEnd(w);
export const padLeft = (text, w) => [...String(text)].slice(0, w).join('').padStart(w);

// Cut or pad a line to exactly w cells.
export function fit(line, w) {
    const out = [];
    let n = 0;
    for (const s of line) {
        if (n >= w) break;
        const chars = [...s.t].slice(0, w - n);
        out.push({ ...s, t: chars.join('') });
        n += chars.length;
    }
    if (n < w) out.push(seg(' '.repeat(w - n)));
    return out;
}

export const center = (line, w) => fit([seg(' '.repeat(Math.max(0, (w - width(line)) >> 1))), ...line], w);

// left, then right pushed to the far edge
export function spread(left, right, w) {
    const gap = Math.max(1, w - width(left) - width(right));
    return fit([...left, seg(' '.repeat(gap)), ...right], w);
}

export const rule = (char, w, r = 'dim') => [seg(char.repeat(w), r)];

// "B U F F T I M E": the banner's letter spacing
export const spaced = text => [...text].join(' ');

// Lines in a w x h box drawn in the border role, padX cells of air inside.
// Lines past the box are dropped; missing ones are blank.
export function box(lines, w, h, { r = 'border', padX = 2, padY = 1 } = {}) {
    const inner = w - 2 - padX * 2;
    const rows = h - 2 - padY * 2;
    const air = seg(' '.repeat(padX));
    const side = seg('│', r);
    const body = Array.from({ length: rows }, (_, i) => [side, air, ...fit(lines[i] ?? [], inner), air, side]);
    const blank = Array.from({ length: padY }, () => [side, seg(' '.repeat(w - 2)), side]);
    return [[seg(`┌${'─'.repeat(w - 2)}┐`, r)], ...blank, ...body, ...blank, [seg(`└${'─'.repeat(w - 2)}┘`, r)]];
}

// The rows of a list that fit in `rows`, scrolled so `sel` shows.
export function windowed(count, sel, top, rows) {
    let start = Math.min(top, Math.max(0, count - rows));
    if (sel < start) start = sel;
    if (sel >= start + rows) start = sel - rows + 1;
    return { start: Math.max(0, start), end: Math.min(count, Math.max(0, start) + rows) };
}
