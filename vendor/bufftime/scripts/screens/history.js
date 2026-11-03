import { DAYS } from '../app/state.js';
import { byDay, lastSessions, matching } from '../log/stats.js';
import { seg, windowed } from '../term/grid.js';
import { fieldSegs } from './fields.js';
import { dayLine, label, setLine } from './rows.js';

// The sets HISTORY shows, newest first: the filter, then the last N days.
export function shownSets(st, entries) {
    const found = matching(entries, st.hist.filter);
    return st.hist.days ? lastSessions(found, st.hist.days) : found;
}

// HISTORY: FIND and DAYS on top, then every set by day with a "> " cursor.
// ↵ (or a tap on a name) keeps only that exercise.
export function historyScreen(st, { entries, w, h, frame }) {
    const { hist } = st;
    const find = [
        { ...label('find', hist.finding, 6), a: 'find' },
        ...fieldSegs(hist.filter, 26, { on: hist.finding, frame, empty: 'all' }),
    ];
    const days = [label('days', false, 6), ...DAYS.flatMap(n => dayChoice(n, hist.days === n))];
    const head = w >= 76 ? [[...find, seg('  '), ...days]] : [find, days];

    const sets = shownSets(st, entries);
    hist.sel = Math.min(hist.sel, Math.max(0, sets.length - 1));
    // one display row per day heading and per set; the cursor counts sets
    const rows = [];
    let at = 0;
    for (const day of byDay(sets)) {
        if (rows.length) rows.push({ line: [] });
        rows.push({ line: dayLine(day.entries[0].at, day.entries) });
        for (const entry of day.entries) {
            const sel = at === hist.sel;
            rows.push({ line: setLine(entry, w, { sel, pick: `pick:${at}` }), sel });
            at += 1;
        }
    }
    const room = h - head.length - 1;
    const selRow = Math.max(
        0,
        rows.findIndex(r => r.sel),
    );
    const { start, end } = windowed(rows.length, selRow, hist.top, room);
    hist.top = start;
    const body = rows.slice(start, end).map(r => r.line);
    if (!entries.length) body.push([seg('  nothing logged yet · tab to LOG', 'dim')]);
    else if (!sets.length) body.push([seg(`  no sets match "${hist.filter.trim()}"`, 'dim')]);
    return { lines: [...head, [], ...body], help: historyHelp(hist.finding) };
}

const dayChoice = (n, on) => [
    seg(' '),
    seg(on ? `[${n || 'ALL'}]` : ` ${n || 'ALL'} `, on ? 'fg' : 'accent', { a: `days:${n}`, bold: on }),
];

const historyHelp = finding =>
    finding
        ? [
              ['type', 'find'],
              ['↵', 'done'],
              ['esc', 'clear'],
          ]
        : [
              ['↑↓', 'set'],
              ['↵', 'only this'],
              ['←→', 'days'],
              ['/', 'find', 'find'],
              ['x', 'delete'],
              ['u', 'undo', 'undo'],
          ];
