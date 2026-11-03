// Sums and summaries over sets (newest first). No DOM, so tests can run them.

const pad = n => String(n).padStart(2, '0');

// The local calendar day, YYYY-MM-DD. A session is one day's sets.
export function dayKey(at) {
    const d = new Date(at);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function byDay(entries) {
    const days = [];
    for (const entry of entries) {
        const key = dayKey(entry.at);
        if (days.at(-1)?.key !== key) days.push({ key, entries: [] });
        days.at(-1).entries.push(entry);
    }
    return days;
}

export const lastSessions = (entries, count) =>
    byDay(entries)
        .slice(0, count)
        .flatMap(day => day.entries);

export const today = (entries, now = new Date()) => entries.filter(e => dayKey(e.at) === dayKey(now));

export const volume = entries => entries.reduce((sum, e) => sum + e.weight * e.reps, 0);

// Estimated one-rep max (Epley). A single is its own max.
export const oneRepMax = ({ weight, reps }) => Math.round(reps === 1 ? weight : weight * (1 + reps / 30));

// Exercise names, most recently done first.
export const exercises = entries => [...new Set(entries.map(e => e.exercise))];

// The first known exercise that starts with `text` and is longer than it.
export function complete(text, names) {
    const start = text.toLowerCase();
    return start.trim() ? (names.find(name => name.startsWith(start) && name !== start) ?? null) : null;
}

export const lastOf = (entries, exercise) => entries.find(e => e.exercise === exercise) ?? null;

// One row per exercise: the top set (highest estimated max, then the heavier),
// how many sets and when it was last done. Most recent first.
export function bests(entries) {
    const rows = new Map();
    for (const entry of entries) {
        const row = rows.get(entry.exercise);
        if (!row) {
            rows.set(entry.exercise, { exercise: entry.exercise, top: entry, sets: 1, last: entry.at });
            continue;
        }
        row.sets += 1;
        const [a, b] = [oneRepMax(entry), oneRepMax(row.top)];
        if (a > b || (a === b && entry.weight > row.top.weight)) row.top = entry;
    }
    return [...rows.values()];
}

// Sets whose exercise contains the filter text.
export function matching(entries, filter) {
    const text = filter.trim().toLowerCase();
    return text ? entries.filter(e => e.exercise.includes(text)) : entries;
}
