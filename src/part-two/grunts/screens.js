// showroom: grunts' panel screens (tools/demo/internal/panel), ported line for
// line to text: HEART, PUNCH and AIM. The heart rate is made up. TK · xoxn · 2026
import { hits } from './hits.js';
import { span, pad, center, bigDigits } from './text.js';

export const st = { tab: 1, theme: 0, aim: [0, 0], bpm: 96, beat: false, flash: false };
const hrZone = bpm => (bpm >= 160 ? ['g-err', 'HIGH'] : bpm >= 110 ? ['g-warn', 'ELEVATED'] : ['g-ok', 'RESTING']);

// a punch or not, nothing else: the count, the last hit, the last four
function punch() {
  const lines = [...bigDigits(hits.punches, st.flash ? 'g-flash' : 'g-fg'), '', center('PUNCHES', 'g-dim'), ''];
  const last = hits.last ?? '—';
  lines.push(pad(`LAST ${last}   MOVES ${hits.moves}   ${hits.ppm}/min`) + span('g-dim', 'LAST ') + span(last === 'PUNCH' ? 'g-ok' : 'g-dim', last)
    + span('g-dim', `   MOVES ${hits.moves}   ${hits.ppm}/min`), '');
  for (const [n, kind] of hits.log) lines.push(pad('#00  PUNCH') + span('g-dim', n ? `#${String(n).padStart(2, '0')}  ` : '     ') + span(kind === 'PUNCH' ? 'g-ok' : 'g-dim', kind.padEnd(5)));
  return lines;
}

// aim_grid_cell.go: rings by distance (×2 down, a cell is twice as tall), + in the middle, X on the hit
function aim() {
  const gw = 31, gh = 13, cx = (gw - 1) / 2, cy = (gh - 1) / 2;
  const px = Math.round(cx + (st.aim[0] / 30) * cx), py = Math.round(cy + (st.aim[1] / 30) * cy);
  const rows = [];
  for (let y = 0; y < gh; y++) {
    let row = pad('x'.repeat(gw));
    for (let x = 0; x < gw; x++) {
      if (x === px && y === py) { row += span('g-hit', 'X'); continue; }
      const r = Math.hypot(x - cx, (y - cy) * 2) / Math.hypot(cx, cy * 2);
      row += span(r > 0.66 ? 'g-err' : r > 0.33 ? 'g-warn' : 'g-ok', x === Math.round(cx) && y === Math.round(cy) ? '+' : '.');
    }
    rows.push(row);
  }
  return [...rows, '', center(`${Math.abs(st.aim[0]).toFixed(0)}° ${st.aim[0] < 0 ? 'LEFT' : 'RIGHT'}  ${Math.abs(st.aim[1]).toFixed(0)}° ${st.aim[1] < 0 ? 'HIGH' : 'LOW'}`, 'g-dim')];
}

function heart() {
  const [cls, label] = hrZone(st.bpm);
  return [center('● CONNECTED', 'g-ok'), '', center('DEVICE   Polar H10', 'g-dim'), '', center('♥', st.beat ? cls : 'g-dim'),
    ...bigDigits(st.bpm, cls), pad('BPM  ' + label) + span('g-dim', 'BPM  ') + span(cls, label)];
}

export const SCREENS = [heart, punch, aim]; // in tab order
