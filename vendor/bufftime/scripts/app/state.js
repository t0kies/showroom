import { read, write } from '../lib/storage.js';
import { MAX_NAME } from '../log/store.js';

export const TABS = ['LOG', 'HISTORY', 'BESTS'];
export const ROWS = ['exercise', 'weight', 'reps', 'feel', 'log'];
export const DAYS = [0, 1, 2, 5, 10];
const DRAFT = 'bufftime.draft';

// What each text field lets in, and how much.
const FIELDS = {
    exercise: v => v.replace(/[^\w\s.'/+-]/g, '').slice(0, MAX_NAME),
    weight: v => v.replace(/[^0-9.]/g, '').slice(0, 6),
    reps: v => v.replace(/\D/g, '').slice(0, 3),
    find: v => v.replace(/[^\w\s.'/+-]/g, '').slice(0, MAX_NAME),
};

// Everything on screen comes from here and the store. The log form is kept
// across reloads, since the next set is usually the last one again.
export function createState(store) {
    let draft = null;
    try {
        draft = JSON.parse(read('localStorage', DRAFT));
    } catch {}
    const [newest] = store.all();
    const from = draft ?? newest ?? {};
    return {
        splash: read('sessionStorage', 'bufftime.started') !== '1',
        frame: 0,
        tab: 0,
        theme: 0,
        help: false,
        log: {
            row: from.exercise ? 2 : 0,
            exercise: String(from.exercise ?? ''),
            weight: String(from.weight ?? ''),
            reps: String(from.reps ?? ''),
            feel: from.feel ?? 'ok',
            nameAt: -1,
        },
        hist: { sel: 0, top: 0, filter: '', days: 0, finding: false },
        best: { sel: 0, top: 0 },
        note: null,
    };
}

// The text field keys type into right now, or null.
export function editing(st) {
    if (st.splash || st.help) return null;
    if (st.tab === 0 && st.log.row < 3) return ROWS[st.log.row];
    if (st.tab === 1 && st.hist.finding) return 'find';
    return null;
}

export const fieldValue = (st, name) => (name === 'find' ? st.hist.filter : st.log[name]);

export function setField(st, name, value) {
    const clean = FIELDS[name](String(value));
    if (name === 'find') {
        st.hist.filter = clean;
        st.hist.sel = 0;
    } else {
        st.log[name] = clean;
        saveDraft(st);
    }
    return clean;
}

export function saveDraft(st) {
    const { exercise, weight, reps, feel } = st.log;
    write('localStorage', DRAFT, JSON.stringify({ exercise, weight, reps, feel }));
}

// The status line inside the box: what just happened, and what u undoes.
export function say(st, text, { tone = 'safe', undo = null, seconds = 8 } = {}) {
    st.note = { text, tone, undo, until: Date.now() + seconds * 1000 };
}
