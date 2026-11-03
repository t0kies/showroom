// Themes pick from the 16 standard ANSI colors only, as punchathon's do
// (theme/palette.go), so a terminal shows the same thing with its own
// colors. Monochrome themes are one hue, like a real CRT: good, bad and
// warning collapse into it. BUFF is bufftime's first look: orange on black.
//
// Roles: bg, fg (text), accent (values, the open tab), dim (labels, hints),
// border, safe (:)), warn, danger (:( and deletes).
const theme = (name, mono, bg, fg, accent, dim, border, safe = fg, warn = fg, danger = fg) => ({
    name,
    mono,
    roles: { bg, fg, accent, dim, border, safe, warn, danger },
});

export const THEMES = [
    theme('BUFF', false, 0, 11, 15, 3, 11, 10, 11, 9),
    theme('AMBER-CRT', true, 0, 11, 11, 3, 3),
    theme('PHOSPHOR', true, 0, 10, 10, 2, 2),
    theme('WHITE-CRT', true, 0, 15, 15, 7, 7),
    theme('CYAN-CRT', true, 0, 14, 14, 6, 6),
    theme('SLATE', false, 0, 7, 15, 8, 8, 10, 11, 9),
    theme('HAZARD', false, 0, 11, 11, 3, 11, 10, 11, 9),
    theme('DOS-BLUE', false, 4, 15, 14, 7, 15, 10, 11, 9),
    theme('CYBER', false, 0, 13, 14, 5, 5, 10, 11, 9),
    theme('RED-ALERT', false, 0, 9, 9, 1, 1, 10, 11, 9),
];

// The browser's terminal colors for ANSI 0-15: a warm CRT set whose bright
// yellow is the original bufftime orange.
export const PALETTE = [
    '#0a0806',
    '#b3301c',
    '#2b9a45',
    '#a35f00',
    '#1d3a9e',
    '#93379e',
    '#25949a',
    '#b8b2a6',
    '#5f584d',
    '#ff513b',
    '#62ff70',
    '#ff9500',
    '#6a92ff',
    '#ff6cf0',
    '#52f2ff',
    '#f6f1e8',
];

// A role's ANSI index; a number is taken as an index already (the splash's fire).
export const roleColor = (th, role) => (typeof role === 'number' ? role : (th.roles[role] ?? th.roles.fg));
