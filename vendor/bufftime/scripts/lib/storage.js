// Web storage that never throws (private mode, blocked cookies).
export function read(area, key) {
    try {
        return window[area].getItem(key);
    } catch {
        return null;
    }
}

export function write(area, key, value) {
    try {
        if (value == null) window[area].removeItem(key);
        else window[area].setItem(key, value);
    } catch {}
}
