import { space } from '../lib/grid.js';

// touch screens have no keys, so no key-label row under the swatches
const noKeys = matchMedia('(hover: none)');

// Swatch size in cells (across × down) so a grid `perRow` wide fills the card.
// Each swatch has a cell of padding either side (hanging past the card's
// edges at the ends), a key-label row under it (not on touch screens), then
// a gap row. One row is kept for a notice, and `extraRows` for the block
// under the swatches. Swatches take all the height, at most a 2:1 bar
// (a cell is half as wide as a row is tall, so across = 2 × down is square).
function fit({ cols, rows }, perRow, count, extraRows = 0) {
    const rowCount = Math.ceil(count / perRow);
    const labelRows = noKeys.matches ? 0 : 1;
    const wide = Math.floor((cols + 2 - 2 * labelRows * (perRow - 1)) / perRow) - 2;
    const tall = Math.floor((rows - (1 + labelRows) * rowCount - extraRows) / rowCount);
    const down = Math.max(1, tall);
    const across = Math.max(2, Math.min(wide, down * 4));
    return { across, down, perRow };
}

// Always three across, so the grid matches the pick keys.
export function layoutFor(card, count, extraRows) {
    return fit(space(card), Math.min(3, count), count, extraRows);
}
