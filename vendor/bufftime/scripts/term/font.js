// A 3x5 dot font, as in punchathon's panel/digitfont.go, with the letters
// the banner needs. bigText() scales each dot to scale x scale █ cells.
const GLYPHS = {
    0: ['###', '#.#', '#.#', '#.#', '###'],
    1: ['.#.', '##.', '.#.', '.#.', '###'],
    2: ['###', '..#', '###', '#..', '###'],
    3: ['###', '..#', '.##', '..#', '###'],
    4: ['#.#', '#.#', '###', '..#', '..#'],
    5: ['###', '#..', '###', '..#', '###'],
    6: ['###', '#..', '###', '#.#', '###'],
    7: ['###', '..#', '.#.', '.#.', '.#.'],
    8: ['###', '#.#', '###', '#.#', '###'],
    9: ['###', '#.#', '###', '..#', '###'],
    '.': ['...', '...', '...', '...', '.#.'],
    '×': ['...', '#.#', '.#.', '#.#', '...'],
    ' ': ['...', '...', '...', '...', '...'],
    B: ['##.', '#.#', '##.', '#.#', '##.'],
    U: ['#.#', '#.#', '#.#', '#.#', '###'],
    F: ['###', '#..', '##.', '#..', '#..'],
    T: ['###', '.#.', '.#.', '.#.', '.#.'],
    I: ['###', '.#.', '.#.', '.#.', '###'],
    M: ['#.#', '###', '###', '#.#', '#.#'],
    E: ['###', '#..', '##.', '#..', '###'],
    W: ['#.#', '#.#', '###', '###', '#.#'],
};

// One string per row; glyphs a scale-wide gap apart.
export function bigText(text, scale = 1) {
    const glyphs = [...String(text).toUpperCase()].map(c => GLYPHS[c]).filter(Boolean);
    const rows = [];
    for (let y = 0; y < 5; y++) {
        const row = glyphs
            .map(g => [...g[y]].map(dot => (dot === '#' ? '█' : ' ').repeat(scale)).join(''))
            .join(' '.repeat(scale));
        for (let i = 0; i < scale; i++) rows.push(row);
    }
    return rows;
}

export const bigWidth = (text, scale = 1) => {
    const n = [...String(text)].length;
    return n ? n * 3 * scale + (n - 1) * scale : 0;
};
