import { place, space } from './cells.js';

// When a card changes size by whole cells (rotation, fullscreen, window
// resize), each part registered with onRefit redraws, then the column is
// centred again. At most once a frame; sub-cell changes (the address bar
// sliding away) are ignored.
const fitted = new Map(); // card → { cols, rows, parts: Map(element → refit) }
let frame = 0;
const watcher =
    typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
              if (!frame) frame = requestAnimationFrame(refitAll);
          })
        : null;

function refitCard(card, fit) {
    const { cols, rows } = space(card);
    if (cols === fit.cols && rows === fit.rows) return;
    Object.assign(fit, { cols, rows });
    for (const [el, refit] of fit.parts) {
        if (!card.isConnected) break; // a refit redrew the whole screen
        if (card.contains(el)) refit();
        else fit.parts.delete(el);
    }
    const column = card.isConnected && card.querySelector('.round-column');
    if (column) place(card, column);
}

function refitAll() {
    frame = 0;
    for (const [card, fit] of fitted) {
        if (card.isConnected) {
            refitCard(card, fit);
            continue;
        }
        watcher.unobserve(card);
        fitted.delete(card);
    }
}

// The card's fit record; starts watching it on first use.
export function watch(card) {
    if (!fitted.has(card)) {
        fitted.set(card, { ...space(card), parts: new Map() });
        watcher?.observe(card);
    }
    return fitted.get(card);
}

// Runs `refit` when the card changes size, while `el` is still in it.
export function onRefit(card, el, refit) {
    watch(card).parts.set(el, refit);
}
