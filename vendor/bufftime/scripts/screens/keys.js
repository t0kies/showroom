import { pad, seg } from '../term/grid.js';

// [heading] or [keys, what they do], in two columns when the box is wide
const LEFT = [
    ['ANYWHERE'],
    ['tab', 'next screen (shift: back)'],
    ['t', 'next theme'],
    ['u', 'undo a log or delete'],
    ['e  i', 'export / import (JSON)'],
    ['?  esc', 'these keys / close'],
    [],
    ['LOG'],
    ['↑↓', 'row'],
    ['type', 'exercise, weight, reps'],
    ['→', 'take the completion'],
    ['←→', 'past names · weight ±5'],
    ['', 'reps ±1 · feel (shift: ±1)'],
    ['↵', 'log it; the form stays'],
];
const RIGHT = [
    ['HISTORY'],
    ['↑↓ pgup pgdn', 'set'],
    ['↵', 'only this exercise'],
    ['esc', 'all exercises again'],
    ['/', 'find an exercise'],
    ['←→', 'last 1 2 5 10 days, all'],
    ['x  del', 'delete the set'],
    [],
    ['BESTS'],
    ['↑↓  ↵', 'open its history'],
];

const line = ([key, what]) =>
    what == null
        ? [seg(pad(key ?? '', 40), 'accent', { bold: true })]
        : [seg(pad(key, 13), 'fg', { bold: true }), seg(pad(what, 27), 'dim')];

// The ? panel: every key, in the box in place of the screen.
export function keysScreen({ w }) {
    const lines =
        w >= 82
            ? LEFT.map((row, i) => [...line(row), seg('  '), ...line(RIGHT[i] ?? [])])
            : [...LEFT, [], ...RIGHT].map(line);
    return { lines, help: [['esc', 'close', 'help']] };
}
