// showroom: litterbox's live grid view (internal/view/web/index.html), fed
// by a made-up shift instead of the sym stream. One cat per delivery.
// TK · xoxn · 2026
import { SHIFT, CAP, bins, arm, home, drop, tally } from './yard.js';
import { build, render } from './grid.js';
import { showBanner } from './banner.js';

// moves a quarter cell a tick, x first then y, like a gantry
function* go(to, state) {
  arm.state = state;
  for (const k of ['x', 'y']) while (arm[k] !== to[k]) { arm[k] += Math.sign(to[k] - arm[k]) * 0.25; yield; }
}
const wait = function* (ticks) { for (let i = 0; i < ticks; i++) yield; };

function* shift() {
  for (;;) {
    const full = bins.filter(b => b.qty);
    const empty = bins.filter(b => !b.qty);
    for (const b of full.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2))) {
      yield* go(b, 'moving');
      arm.state = 'picking';
      while (b.qty && arm.held.length < CAP && Math.random() > 0.3) { b.qty--; arm.held.push(b.label); yield* wait(2); }
    }
    yield* go(drop, 'moving');
    arm.state = 'dropping';
    yield* wait(4);
    tally.delivered += arm.held.length;
    arm.held = [];
    if (empty.length) { yield* go(empty[0], 'replacing'); empty[0].qty = empty[0].max; yield* wait(3); }
    yield* go(home, 'homing');
    arm.state = 'idle';
    tally.cat = (tally.cat + 1) % SHIFT.length;
    showBanner(SHIFT[tally.cat]);
    yield* wait(6);
  }
}

build();
showBanner(SHIFT[0]);
addEventListener('resize', () => showBanner(SHIFT[tally.cat]));
const ticks = shift();
setInterval(() => { ticks.next(); render(); }, 120);
render();
