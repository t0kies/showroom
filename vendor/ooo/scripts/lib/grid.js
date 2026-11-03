import { place, space } from './cells.js';
import { line } from './dom.js';
import { watch } from './refit.js';

export { cellSize, space } from './cells.js';
export { onRefit } from './refit.js';

// A cols × rows block of █, one string with a line per row.
export const blocks = (cols, rows = 1) => Array.from({ length: rows }, () => '█'.repeat(cols)).join('\n');

// Replaces the card's column with these lines and centres it. The card must
// be in the page so it can be measured.
export function show(card, ...lines) {
    const column = line('round-column');
    column.append(...lines);
    card.querySelector('.round-column')?.remove();
    card.prepend(column);
    place(card, column);
    // the size it was laid out at, so refit only fires on a real change
    Object.assign(watch(card), space(card));
    return column;
}
