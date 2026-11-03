import { dayKey } from './stats.js';
import { FACE } from './store.js';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAY_MS = 86_400_000;

export const UNIT = 'lb';

export const num = n => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

// "135 × 8", or "bw × 12" for a bodyweight set.
export const setText = ({ weight, reps }) => `${weight ? num(weight) : 'bw'} × ${reps}`;

export const face = ({ feel }) => FACE[feel] ?? FACE.ok;

export function clock(at) {
    const d = new Date(at);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Whole calendar days from `at` to `now`.
const daysAgo = (at, now) => Math.round((Date.parse(dayKey(now)) - Date.parse(dayKey(at))) / DAY_MS);

// "today", "yesterday", "thu 29 oct" (with the year when it isn't this one).
export function dayName(at, now = new Date()) {
    const ago = daysAgo(at, now);
    if (ago === 0) return 'today';
    if (ago === 1) return 'yesterday';
    const d = new Date(at);
    const year = d.getFullYear() === new Date(now).getFullYear() ? '' : ` ${d.getFullYear()}`;
    return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${year}`;
}

// "today", "3d", "2w", "5mo", "1y": short enough for a table column.
export function ago(at, now = new Date()) {
    const days = daysAgo(at, now);
    if (days < 1) return 'today';
    if (days < 14) return `${days}d`;
    if (days < 60) return `${Math.floor(days / 7)}w`;
    if (days < 730) return `${Math.floor(days / 30)}mo`;
    return `${Math.floor(days / 365)}y`;
}

// "3 sets · 2,760 lb"
export function summary(entries, total) {
    const sets = `${entries.length} ${entries.length === 1 ? 'set' : 'sets'}`;
    return total ? `${sets} · ${num(total)} ${UNIT}` : sets;
}
