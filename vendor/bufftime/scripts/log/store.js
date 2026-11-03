import { read, write } from '../lib/storage.js';

const KEY = 'bufftime.log';
export const FEELS = ['good', 'ok', 'bad'];
export const FACE = { good: ':)', ok: ':|', bad: ':(' };
export const MAX_WEIGHT = 2000;
export const MAX_REPS = 999;
export const MAX_NAME = 24;

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// A clean set, or null. Used for the form and for imports, so anything odd
// in a file is dropped rather than stored. Exercise names are lowercased so
// "Squats" and "squats " are one exercise.
export function clean(raw) {
    const exercise = String(raw?.exercise ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .slice(0, MAX_NAME);
    const weight = Math.round(Number(raw?.weight) * 10) / 10;
    const reps = Number(raw?.reps);
    const at = new Date(raw?.at ?? Date.now());
    if (!exercise || !(weight >= 0 && weight <= MAX_WEIGHT)) return null;
    if (!Number.isInteger(reps) || reps < 1 || reps > MAX_REPS || Number.isNaN(at.getTime())) return null;
    const feel = FEELS.includes(raw?.feel) ? raw.feel : 'ok';
    const id = typeof raw?.id === 'string' && raw.id ? raw.id.slice(0, 40) : newId();
    return { id, at: at.toISOString(), exercise, weight, reps, feel };
}

const newestFirst = (a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0);

function parse(text) {
    try {
        const list = JSON.parse(text);
        return Array.isArray(list) ? list.map(clean).filter(Boolean).sort(newestFirst) : [];
    } catch {
        return [];
    }
}

// Every set, newest first, kept in web storage. One step of undo covers a
// delete; adding a set forgets it.
export function createStore(area = 'localStorage') {
    let entries = parse(read(area, KEY));
    let before = null;
    const listeners = new Set();
    const commit = next => {
        entries = next;
        write(area, KEY, JSON.stringify(entries));
        for (const listener of listeners) listener(entries);
    };

    return {
        all: () => entries,
        on: listener => listeners.add(listener),
        canUndo: () => before !== null,
        add(raw) {
            const entry = clean({ ...raw, id: undefined, at: raw.at ?? new Date() });
            if (!entry) return null;
            before = null;
            commit([entry, ...entries].sort(newestFirst));
            return entry;
        },
        remove(id) {
            const entry = entries.find(e => e.id === id);
            if (!entry) return null;
            before = entries;
            commit(entries.filter(e => e !== entry));
            return entry;
        },
        undo() {
            if (!before) return false;
            commit(before);
            before = null;
            return true;
        },
        // Adds the sets whose ids aren't here yet; returns how many.
        merge(list) {
            const known = new Set(entries.map(e => e.id));
            const fresh = (Array.isArray(list) ? list : []).map(clean).filter(e => e && !known.has(e.id));
            if (fresh.length) commit([...fresh, ...entries].sort(newestFirst));
            return fresh.length;
        },
    };
}
