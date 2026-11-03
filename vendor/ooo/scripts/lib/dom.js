export const $ = id => document.getElementById(id);

export function line(className, text) {
    const el = document.createElement('div');
    el.className = className;
    if (text != null) el.textContent = text;
    return el;
}

export function button(text, className, onClick) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.textContent = text;
    el.addEventListener('click', onClick);
    return el;
}

// An aria-hidden span, for decorative marks next to text.
export function mark(text, className) {
    const el = document.createElement('span');
    el.className = className;
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    return el;
}

// Screens re-render by replacing every button, which drops keyboard focus.
// Called before rebuilding; the returned function focuses the new element with
// the same data-focus key, or `fallback`.
export function holdFocus() {
    const key = document.activeElement?.dataset?.focus;
    return fallback => {
        const same = key && document.querySelector(`[data-focus="${CSS.escape(key)}"]`);
        (same || fallback)?.focus();
    };
}

// True for an editable text control (a read-only one doesn't count).
export function isTyping(target) {
    return /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName) && !target.readOnly;
}
