import { roleColor } from './themes.js';

// The same lines as ANSI text for a real terminal: 16 colors only, so the
// terminal's own palette decides the exact shades. The theme's background
// is left to the terminal unless `withBg`.
const fgCode = n => (n < 8 ? 30 + n : 90 + n - 8);
const bgCode = n => (n < 8 ? 40 + n : 100 + n - 8);

export function toAnsi(lines, th, { withBg = false } = {}) {
    const bg = withBg ? `;${bgCode(th.roles.bg)}` : '';
    return lines
        .map(line => {
            let out = '';
            for (const s of line) {
                if (!s.t) continue;
                const codes = [0, fgCode(roleColor(th, s.r))];
                if (s.bold) codes.push(1);
                if (s.inv) codes.push(7);
                out += `\x1b[${codes.join(';')}${bg}m${s.t}`;
            }
            return `${out}\x1b[0m`;
        })
        .join('\n');
}

// Plain text, for `curl` into a file or a terminal without color.
export const toText = lines =>
    lines
        .map(line =>
            line
                .map(s => s.t)
                .join('')
                .trimEnd(),
        )
        .join('\n');
