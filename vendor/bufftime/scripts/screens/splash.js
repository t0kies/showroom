import { bigText, bigWidth } from '../term/font.js';
import { center, seg, spaced } from '../term/grid.js';
import { blinkOn } from './fields.js';

// ANSI reds, oranges and yellows the banner flickers through, as
// punchathon's FireCat splash does. Monochrome themes flicker in their hue.
const FIRE = [9, 11, 3, 11, 1, 9, 11, 15];

// BUFF over TIME in block letters, the rows cycling through the fire
// colors, and a prompt that blinks under them.
export function splashScreen(th, { w, h, frame }) {
    const scale = [3, 2, 1].find(s => bigWidth('BUFF', s) <= w - 4 && 10 * s + 8 <= h) ?? 1;
    const color = row => {
        const i = (Math.floor(frame / 2) + Math.floor(row / scale)) % FIRE.length;
        return th.mono ? (i % 3 ? 'fg' : 'dim') : FIRE[i];
    };
    const big = [...bigText('BUFF', scale), ...Array(scale).fill(''), ...bigText('TIME', scale)];
    const art = big.map((row, i) => center([seg(row, color(i))], w));
    const prompt = blinkOn(frame) ? 'press enter to start' : '';
    const lines = [
        center([seg(spaced('BUFFTIME'), 'accent', { bold: true })], w),
        [],
        ...art,
        [],
        center([seg(prompt, 'fg', { a: 'start' })], w),
        [],
        center([seg('made with ♥ by XOXN', 'dim')], w),
    ];
    const top = Math.max(0, (h - lines.length) >> 1);
    return [...Array.from({ length: top }, () => []), ...lines].map(line =>
        line.length ? line.map(s => ({ ...s, a: 'start' })) : [seg(' '.repeat(w), 'fg', { a: 'start' })],
    );
}
