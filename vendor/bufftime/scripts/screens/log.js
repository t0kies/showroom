import { ago, face, setText, UNIT } from '../log/format.js';
import { exercises, lastOf, today } from '../log/stats.js';
import { bigText, bigWidth } from '../term/font.js';
import { fit, seg } from '../term/grid.js';
import { feelSegs, fieldSegs, steppers } from './fields.js';
import { cursor, dayLine, label, setLine } from './rows.js';

const FORM_W = 40;

// LOG: the form, the set being logged in big digits (beside the form when
// there's room, else under it), then today's sets.
export function logScreen(st, { entries, w, h, frame }) {
    const { log } = st;
    const on = i => log.row === i;
    const row = (i, name, value) => [cursor(on(i)), { ...label(name, on(i)), a: `row:${i}` }, ...value];
    const prev = lastOf(entries, log.exercise.trim().toLowerCase());
    const form = [
        row(0, 'exercise', fieldSegs(log.exercise, 26, { on: on(0), frame, names: exercises(entries) })),
        [seg(' '.repeat(12)), seg(prev ? `last ${setText(prev)} ${face(prev)} · ${ago(prev.at)}` : '', 'dim')],
        row(1, 'weight', [
            ...fieldSegs(log.weight, 7, { on: on(1), frame, empty: 'bw' }),
            seg(`${UNIT}  `, 'dim'),
            ...steppers('weight'),
        ]),
        row(2, 'reps', [...fieldSegs(log.reps, 7, { on: on(2), frame }), seg('    '), ...steppers('reps')]),
        row(3, 'feel', feelSegs(log.feel)),
        [
            cursor(on(4)),
            seg(' '.repeat(10)),
            seg('[ ↵ LOG SET ]', on(4) ? 'fg' : 'accent', { a: 'log', inv: on(4), bold: true }),
        ],
    ];
    // roomy screens (phones held upright) space the rows for thumbs
    const lines = h >= 40 ? form.flatMap((line, i) => (i && i !== 1 ? [[], line] : [line])) : form;
    placeHero(lines, heroText(log), w, h);

    const sets = today(entries);
    const room = h - lines.length - 2;
    const list = [dayLine(new Date(), sets), ...sets.slice(0, room - 1).map(entry => setLine(entry, w))];
    if (!sets.length) list.push([seg('  nothing yet today', 'dim')]);
    if (sets.length > room - 1) list[list.length - 1] = [seg(`  … ${sets.length - room + 2} more on HISTORY`, 'dim')];
    return { lines: [...lines, [], ...list], help: logHelp(log.row) };
}

const heroText = ({ weight, reps }) => `${Number(weight) ? weight : 'BW'}×${Number(reps) || 0}`;

// The set in block digits, as punchathon's hero counter: scale 2 when it
// fits, beside the form (wide screens) or under it (upright phones).
function placeHero(lines, text, w, h) {
    for (const scale of [2, 1]) {
        const big = bigText(text, scale);
        if (w >= FORM_W + bigWidth(text, scale) && lines.length >= big.length) {
            big.forEach((r, i) => {
                lines[i] = [...fit(lines[i], FORM_W), seg(r, 'accent')];
            });
            return;
        }
        if (w >= bigWidth(text, scale) && h - lines.length - big.length - 2 >= 6) {
            lines.push([], ...big.map(r => [seg(' '.repeat(2)), seg(r, 'accent')]));
            return;
        }
    }
}

const HELP = {
    exercise: [
        ['type', 'name'],
        ['→', 'complete', 'next-name'],
    ],
    weight: [
        ['←→', '±5'],
        ['shift ←→', '±1'],
    ],
    reps: [['←→', '±1']],
    feel: [['←→', 'pick']],
    log: [],
};

export const logHelp = row => [
    ...HELP[['exercise', 'weight', 'reps', 'feel', 'log'][row]],
    ['↑↓', 'row'],
    ['↵', 'log', 'log'],
    ['u', 'undo', 'undo'],
];
