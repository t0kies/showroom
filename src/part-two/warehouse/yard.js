// showroom: litterbox's warehouse: the bins, the picker arm and the cats on
// shift. The stock is made up. TK · xoxn · 2026
export const COLS = 6, ROWS = 3, CAP = 5; // grid in containers; picker capacity in items
export const SHIFT = ['fire-cat', 'catio', 'luna']; // buttercup's banner says RIP, so not on the rota
const STOCK = [['kibble', 8], ['litter', 6], ['yarn', 4], ['treats', 10], ['catnip', 3], ['mice', 5]];

export const bins = Array.from({ length: COLS * ROWS }, (_, i) => {
  const [label, max] = STOCK[i % STOCK.length];
  return { x: i % COLS, y: Math.floor(i / COLS), label, max, qty: Math.floor(Math.random() * (max + 1)), kind: i % 4 ? 'passive' : 'active' };
});
export const arm = { x: 0, y: ROWS, held: [], state: 'idle' };
export const home = { x: 0, y: ROWS }, drop = { x: COLS - 1, y: ROWS };
export const tally = { delivered: 0, cat: 0 }; // cat: who's on shift, in SHIFT
