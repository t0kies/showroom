// Colors come from the server; only a plain hex value may reach a style.
export function safeColor(hex) {
    return /^#[0-9a-fA-F]{3,8}$/.test(hex) ? hex : 'currentColor';
}

export function hexToHsb(hex) {
    let digits = hex.replace('#', '');
    if (digits.length === 3) digits = [...digits].map(d => d + d).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    let hue = 0;
    if (delta) {
        if (max === r) hue = ((g - b) / delta + 6) % 6;
        else if (max === g) hue = (b - r) / delta + 2;
        else hue = (r - g) / delta + 4;
    }
    return [Math.round(hue * 60), max ? Math.round((delta / max) * 100) : 0, Math.round(max * 100)];
}

export function hsbToHex(hue, saturation, brightness) {
    const value = brightness / 100;
    const chroma = (value * saturation) / 100;
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const sectors = [
        [chroma, x, 0],
        [x, chroma, 0],
        [0, chroma, x],
        [0, x, chroma],
        [x, 0, chroma],
        [chroma, 0, x],
    ];
    const channels = sectors[Math.floor(hue / 60) % 6];
    return (
        '#' +
        channels
            .map(channel =>
                Math.round((channel + value - chroma) * 255)
                    .toString(16)
                    .padStart(2, '0'),
            )
            .join('')
    );
}
