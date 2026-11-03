// showroom: a made-up round on the bag: a hit every second or two, then a
// fresh round. TK · xoxn · 2026
import { hits, hit } from './hits.js';

setInterval(() => {
  if (hits.punches > 60) Object.assign(hits, { punches: 0, moves: 0, log: [] });
  hit();
}, 1400);
