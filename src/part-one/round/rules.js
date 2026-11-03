// showroom: the round's rules that need no page: the standings and the
// clock bar. TK · xoxn · 2026

// the cats are kloves' services, named after my cats; their scores are made up
export const CATS = [
  { id: 'pickles', nickname: 'pickles', score: 14, health: 3, questionIndex: 16, status: 'playing' },
  { id: 'firecat', nickname: 'firecat', score: 9, health: 2, questionIndex: 13, status: 'playing' },
  { id: 'buttercup', nickname: 'buttercup', score: 4, health: 0, questionIndex: 9, status: 'eliminated' },
];

export const standings = you => [...CATS, you].sort((a, b) => b.score - a.score);

// match/clock.js: a bar and the seconds, B, then Y under 15 s, R under 5
export const urgency = seconds => (seconds <= 5 ? 'danger' : seconds <= 15 ? 'warn' : 'calm');
export function clockBar(cells, seconds, total) {
  const left = Math.min(cells, Math.ceil((cells * seconds) / total));
  return '▆'.repeat(left) + '▁'.repeat(cells - left);
}
