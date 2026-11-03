import { ago, num, setText } from '../log/format.js';
import { bests, oneRepMax } from '../log/stats.js';
import { fit, pad, padLeft, seg, windowed } from '../term/grid.js';
import { cursor } from './rows.js';

// BESTS: per exercise, the top set, its estimated one-rep max, how many sets
// and when. Narrow screens drop the last two columns. ↵ opens its history.
export function bestsScreen(st, { entries, w, h }) {
    const rows = bests(entries);
    const wide = w >= 58;
    const nameW = Math.max(8, Math.min(24, w - (wide ? 38 : 24)));
    const cols = (name, top, max, sets, last) => [
        pad(name, nameW),
        padLeft(top, 11),
        padLeft(max, 6),
        ...(wide ? [padLeft(sets, 6), padLeft(last, 7)] : []),
    ];
    const head = [seg('  '), seg(cols('EXERCISE', 'TOP SET', '1RM', 'SETS', 'LAST').join(''), 'dim')];

    st.best.sel = Math.min(st.best.sel, Math.max(0, rows.length - 1));
    const { start, end } = windowed(rows.length, st.best.sel, st.best.top, h - 2);
    st.best.top = start;
    const body = rows.slice(start, end).map((row, i) => {
        const sel = start + i === st.best.sel;
        const [name, top, max, ...rest] = cols(
            row.exercise,
            setText(row.top),
            row.top.weight ? num(oneRepMax(row.top)) : '-',
            String(row.sets),
            ago(row.last),
        );
        const a = `best:${start + i}`;
        return fit(
            [
                cursor(sel),
                seg(name, sel ? 'fg' : 'accent', { a, bold: sel }),
                seg(top, 'accent', { a }),
                seg(max, 'fg', { a, bold: true }),
                seg(rest.join(''), 'dim', { a }),
            ],
            w,
        );
    });
    if (!rows.length) body.push([seg('  nothing logged yet · tab to LOG', 'dim')]);
    return {
        lines: [head, [], ...body],
        help: [
            ['↑↓', 'exercise'],
            ['↵', 'its history'],
        ],
    };
}
