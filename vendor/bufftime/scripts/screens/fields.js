import { complete } from '../log/stats.js';
import { FACE, FEELS } from '../log/store.js';
import { fit, seg } from '../term/grid.js';
import { FEEL_ROLE } from './rows.js';

// The frame ticks every 250 ms, so the cursor blinks once a second.
export const blinkOn = frame => frame % 4 < 2;

// A field's value, with the cursor and a dim completion while it's being
// typed into, exactly `cells` wide. `names` completes the exercise field.
export function fieldSegs(value, cells, { on = false, frame = 0, names = null, empty = '-' } = {}) {
    if (!on) return fit([value ? seg(value, 'accent') : seg(empty, 'dim')], cells);
    const ghost = names ? (complete(value, names)?.slice(value.length) ?? '') : '';
    // a block cursor, as a terminal draws it: over the completion's next
    // letter in reverse video, or a ▓ after the value
    const next = ghost[0];
    const caret = next ? seg(next, 'dim', { inv: blinkOn(frame) }) : seg(blinkOn(frame) ? '▓' : ' ', 'fg');
    return fit([seg(value, 'accent', { bold: true }), caret, seg(ghost.slice(1), 'dim')], cells);
}

// "[−] [+]": for thumbs; arrows do the same.
export const steppers = name => [
    seg('[−]', 'dim', { a: `nudge:${name}:-1` }),
    seg(' '),
    seg('[+]', 'dim', { a: `nudge:${name}:1` }),
];

// ":)  [:|]  :(": the picked one bracketed.
export function feelSegs(feel) {
    return FEELS.flatMap((f, i) => {
        const on = f === feel;
        const face = seg(on ? `[${FACE[f]}]` : ` ${FACE[f]} `, FEEL_ROLE[f], { a: `feel:${f}`, bold: on });
        return i ? [seg(' '), face] : [face];
    });
}
