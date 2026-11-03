import { roleColor } from './themes.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = text => text.replace(/[&<>"]/g, c => ESC[c]);

// A line as HTML: one span per segment, colored by ANSI index (c0-c15 in
// term.css), actions as data-a so a click or tap can find them.
export function lineHtml(line, th) {
    let html = '';
    for (const s of line) {
        if (!s.t) continue;
        const fg = roleColor(th, s.r);
        // reverse video: the color becomes the cell, the text takes the bg
        const cls = s.inv ? ['inv', `b${fg}`] : [`c${fg}`];
        if (s.bold) cls.push('bold');
        const act = s.a ? ` data-a="${esc(s.a)}"` : '';
        html += `<span class="${cls.join(' ')}"${act}>${esc(s.t)}</span>`;
    }
    return html;
}

// .c0-.c15 (text) and .b0-.b15 (reverse-video cells) from the 16 colors.
export const paletteCss = palette =>
    palette.map((hex, i) => `.c${i}{color:${hex}}.b${i}{background:${hex}}`).join('\n');

// Repaints only the rows that changed since the last paint.
export function createPainter(screen) {
    let shown = [];
    return (lines, th) => {
        const rows = lines.map(line => lineHtml(line, th));
        if (screen.children.length !== rows.length) {
            screen.replaceChildren(...rows.map(() => document.createElement('div')));
            shown = [];
        }
        rows.forEach((html, i) => {
            if (html !== shown[i]) screen.children[i].innerHTML = html;
        });
        shown = rows;
    };
}
