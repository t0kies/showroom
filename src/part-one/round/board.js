// showroom: the round's HUD and standings, in ooo's board and as a plain
// table beside it. TK · xoxn · 2026
import { healthIndicator } from '../../../vendor/ooo/scripts/ui/health.js';
import { board } from '../../../vendor/ooo/scripts/match/views/board.js';
import { $ } from '../../lib/dom.js';
import { standings } from './rules.js';

export function showStandings(st) {
  const you = { id: 'you', nickname: $('nick').value || 'you', score: st.right, health: st.hp, questionIndex: st.picks, status: st.hp > 0 ? 'playing' : 'eliminated' };
  const results = standings(you);
  $('board').replaceWith(Object.assign(board({ results, winnerId: results[0].id }, 'you'), { id: 'board' }));
  $('board-ls').innerHTML = results.map(p =>
    `<tr><td>${p.id === 'you' ? `${p.nickname} (you)` : p.nickname}</td><td>${p.score}</td><td>${'♥'.repeat(p.health) || '—'}</td></tr>`).join('');
}

export function hud(st, lost = false) {
  $('level').textContent = `level ${st.level}`;
  $('score').textContent = `${st.right} right`;
  $('health').replaceChildren(healthIndicator(st.hp, { lost }));
  showStandings(st);
}
