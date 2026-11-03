import { TABS } from '../app/state.js';
import { box, center, fit, rule, seg, spaced, spread, width } from '../term/grid.js';

const TITLE = 'BUFFTIME WORKOUT LOG';

// Rows the frame takes around a screen: banner (3, dropped on short
// screens), tab bar, the box's border and padding (4), status line, rule, help.
export const chromeRows = h => (h >= 28 ? 3 : 0) + 1 + 4 + 2 + 2;

// The frame from punchathon's demo: a ==== banner, the [TAB] bar with the
// theme name on the right, the screen in a ┌─┐ box with a status line at
// its foot, a ---- rule and the key help.
export function chrome(st, { w, h, th, body, help, note }) {
    const lines = [];
    if (h >= 28) lines.push(rule('=', w), center([seg(spaced(TITLE), 'accent', { bold: true })], w), rule('=', w));
    lines.push(tabBar(st, w, th));
    const boxH = h - lines.length - 2;
    lines.push(...box([...body.slice(0, boxH - 6), ...pad(body, boxH - 6), [], noteLine(note)], w, boxH));
    lines.push(rule('-', w), helpLine(help, w));
    return lines;
}

const pad = (body, rows) => Array.from({ length: Math.max(0, rows - body.length) }, () => []);

function tabBar(st, w, th) {
    const tabs = TABS.flatMap((name, i) => {
        const on = st.tab === i;
        return [seg(' '), seg(`[${name}]`, on ? 'fg' : 'dim', { inv: on, bold: on, a: `tab:${i}` }), seg(' ')];
    });
    return spread(tabs, [seg(th.name, 'accent', { a: 'theme' })], w);
}

function noteLine(note) {
    if (!note) return [];
    const line = [seg(note.text, note.tone)];
    if (note.undo) line.push(seg(' · ', 'dim'), seg('u', 'fg', { a: 'undo' }), seg(' undo', 'dim', { a: 'undo' }));
    return line;
}

// " key desc • key desc", as bubbles/help prints it, cut with … when it runs
// out of room. Items with an action are tappable.
export function helpLine(items, w) {
    const all = [...items, ['tab', 'switch', 'tab:+1'], ['t', 'theme', 'theme'], ['?', 'keys', 'help']];
    const line = [seg(' ')];
    for (const [key, desc, a] of all) {
        const item = [seg(key, 'fg', { a }), seg(` ${desc}`, 'dim', { a })];
        const sep = width(line) > 1 ? [seg(' • ', 'dim')] : [];
        if (width(line) + width(sep) + width(item) > w - 2) return fit([...line, seg(' …', 'dim')], w);
        line.push(...sep, ...item);
    }
    return fit(line, w);
}
