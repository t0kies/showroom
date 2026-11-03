// The one floating message. toast('Saved'); toast.error(err) for
// failures (an Error or a string), which stays up longer.

let el = null;
let timer = null;

function show(text, error) {
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        el.className = 'tui-window tui-shadow';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
    }
    el.textContent = text;
    el.dataset.title = error ? 'error' : 'stools';
    el.classList.toggle('error', error);
    el.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { el.hidden = true; }, error ? 6000 : 3500);
}

export function toast(text) { show(text, false); }
toast.error = (err) => show(err && err.message ? err.message : String(err), true);
