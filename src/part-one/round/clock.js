// showroom: the round's clock, ooo's match/clock.js: 35 s from the first pick.
// TK · xoxn · 2026
import { settings } from '../../../vendor/ooo/scripts/lib/settings.js';
import { $ } from '../../lib/dom.js';
import { urgency, clockBar } from './rules.js';

export function tick(st, finish) {
  if (st.over) return;
  const clock = $('clock');
  const seconds = st.end ? Math.max(0, Math.ceil((st.end - Date.now()) / 1000)) : settings.match.seconds;
  const cells = parseInt(getComputedStyle(clock).getPropertyValue('--clock-cells'), 10) || 24;
  clock.dataset.urgency = urgency(seconds);
  clock.querySelector('.game-hud-timer').textContent = `${seconds}s`;
  clock.querySelector('.game-clock-bar').textContent = clockBar(cells, seconds, settings.match.seconds);
  if (!seconds) finish('Time\'s up');
}
