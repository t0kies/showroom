import { $ } from '../lib/dom.js';
import { oddOf } from '../lib/odd.js';

// The logo, typed in █ so it follows the theme. 'big': three rows (home).
// 'small': the site name (top row), from the page's SITE_NAME.
const MARK = ['▟█▙ ▟█▙ ▟█▙', '█ █ █ █ █ █', '▜█▛ ▜█▛ ▜█▛'];

// One of the three O's is the odd one out, shifted from the ink color by a
// level-1 step (lib/odd.js). Re-picked on load and on each theme change.
let odd = 0;

// Any CSS color as #rrggbb, read back from a 1px canvas (the theme's ink
// is a color-mix(), so the computed value isn't always hex).
function hex(color) {
    const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    paint.fillStyle = color;
    paint.fillRect(0, 0, 1, 1);
    return `#${[...paint.getImageData(0, 0, 1, 1).data.slice(0, 3)].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

function pickOdd() {
    odd = Math.floor(Math.random() * 3);
    document.documentElement.style.setProperty('--logo-odd', oddOf(hex(getComputedStyle(document.body).color), 1));
    for (const o of document.querySelectorAll('.logo-o')) o.classList.toggle('is-odd', Number(o.dataset.o) === odd);
}

export function setupLogo() {
    pickOdd();
    $('theme').addEventListener('load', pickOdd);
}

const siteName = () => document.querySelector('meta[name="application-name"]')?.content || document.title;

export function logo(size = 'small') {
    const el = document.createElement('div');
    el.className = `logo logo-${size}`;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', siteName());
    if (size !== 'big') {
        el.textContent = siteName();
        return el;
    }
    // each O is 3 cells wide with a 1-cell gap
    MARK.forEach((row, index) => {
        if (index) el.append('\n');
        [0, 1, 2].forEach(o => {
            if (o) el.append(' ');
            const span = document.createElement('span');
            span.className = o === odd ? 'logo-o is-odd' : 'logo-o';
            span.dataset.o = o;
            span.textContent = row.slice(o * 4, o * 4 + 3);
            el.append(span);
        });
    });
    return el;
}
