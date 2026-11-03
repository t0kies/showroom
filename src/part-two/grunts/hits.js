// showroom: one hit count for grunts' terminal demo and its OLED, so both
// show the same hits. A hit is a punch or a move, as the firmware decides:
// a spike that peaks fast is a punch (Config.h CFG_PUNCH_MAX_RISE_MS).
// TK · xoxn · 2026
const MAX_RISE = 40; // in ms
const listeners = new Set();
export const hits = { punches: 0, moves: 0, ppm: 0, last: null, log: [] };

// riseMs: how long the spike took to peak; a demo hit picks one at random
export function hit(riseMs = 10 + Math.random() * 60) {
  const kind = riseMs <= MAX_RISE ? 'PUNCH' : 'MOVE';
  if (kind === 'PUNCH') hits.punches++;
  else hits.moves++;
  hits.ppm = Math.min(140, 40 + hits.punches * 3);
  hits.last = kind;
  hits.log.unshift([kind === 'PUNCH' ? hits.punches : 0, kind]);
  hits.log.length = Math.min(hits.log.length, 4);
  for (const fn of listeners) fn(kind, Math.round(riseMs));
}

export const onHit = fn => listeners.add(fn);
