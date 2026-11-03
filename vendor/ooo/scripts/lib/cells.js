// The page is a grid of character cells (styles/base/fonts.css).

// One cell's width and one row's height in pixels.
export function cellSize() {
    const fontSize = parseFloat(getComputedStyle(document.body).fontSize);
    return { cw: (fontSize * 7) / 11, lh: (fontSize * 14) / 11 };
}

// The card's size in whole cells and rows.
export function space(card) {
    const { cw, lh } = cellSize();
    return { cols: Math.floor(card.clientWidth / cw), rows: Math.floor(card.clientHeight / lh) };
}

// Centres a screen's column in the card on whole cells: its width in cells
// (--w) and the rows above it (--top); the CSS does the rest.
export function place(card, column) {
    const { cw, lh } = cellSize();
    // measure without the fit from a previous size
    column.style.removeProperty('--w');
    column.style.removeProperty('--top');
    const widest = Math.max(0, ...[...column.children].map(el => el.getBoundingClientRect().width));
    column.style.setProperty('--w', Math.ceil(widest / cw - 0.01));
    const free = card.clientHeight - column.getBoundingClientRect().height;
    column.style.setProperty('--top', Math.max(0, Math.floor(free / lh / 2)));
}
