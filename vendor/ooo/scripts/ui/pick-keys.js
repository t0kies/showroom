import { isTyping } from '../lib/dom.js';

// Keys for the three options, left to right: q w e (or 1–3).
export const PICK_KEYS = 'qwe';

// The option a keypress picks, or -1.
export function pickIndex(event, count) {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return -1;
    const key = event.key.toLowerCase();
    const index = PICK_KEYS.includes(key) && key.length === 1 ? PICK_KEYS.indexOf(key) : parseInt(key, 10) - 1;
    return index >= 0 && index < count ? index : -1;
}
