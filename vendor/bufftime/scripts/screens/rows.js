import { clock, dayName, face, setText, summary } from '../log/format.js';
import { volume } from '../log/stats.js';
import { fit, pad, padLeft, seg } from '../term/grid.js';

export const FEEL_ROLE = { good: 'safe', ok: 'dim', bad: 'danger' };

// The selected row's "> " marker, as on punchathon's settings and calibrate.
export const cursor = on => (on ? seg('> ', 'fg', { bold: true }) : seg('  '));

// "> 11:45  squats            135 × 8  :|  x": time, exercise, set, feel,
// delete. The name column takes what's left, up to 24 cells.
export function setLine(entry, w, { sel = false, pick = null } = {}) {
    const nameW = Math.max(6, Math.min(24, w - 30));
    return fit(
        [
            cursor(sel),
            seg(`${clock(entry.at)}  `, 'dim'),
            seg(pad(entry.exercise, nameW), sel ? 'fg' : 'accent', { a: pick, bold: sel }),
            seg(padLeft(setText(entry), 11), 'accent'),
            seg('  '),
            seg(face(entry), FEEL_ROLE[entry.feel]),
            seg('  '),
            seg('x', 'danger', { a: `del:${entry.id}` }),
        ],
        w,
    );
}

// "TODAY  3 sets · 2,760 lb"
export const dayLine = (at, entries) => [
    seg(dayName(at).toUpperCase(), 'fg', { bold: true }),
    seg(`  ${summary(entries, volume(entries))}`, 'dim'),
];

// "LABEL     value": a dim label column, as on punchathon's STATUS tab.
export const label = (text, on, w = 10) => seg(pad(text.toUpperCase(), w), on ? 'fg' : 'dim', { bold: on });
