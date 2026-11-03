import { hexToHsb, hsbToHex } from './color.js';
import { settings } from './settings.js';

// Same curve as the server's stepFor (backend/game/puzzles.js): the odd
// swatch gets closer to the rest each level, down to minStep.
function stepFor(index) {
    const { startStep, minStep, rampRounds } = settings.difficulty;
    if (rampRounds <= 1) return minStep;
    const progress = Math.min(index, rampRounds - 1) / (rampRounds - 1);
    return Math.max(minStep, Math.round(startStep - (startStep - minStep) * progress));
}

// The color one step away from `hex` for this level (1-based): same hue,
// brightness moved up or down.
export function oddOf(hex, level) {
    const [hue, saturation, brightness] = hexToHsb(hex);
    const step = stepFor(level - 1);
    const direction = brightness > 80 ? -1 : brightness < 20 ? 1 : Math.random() < 0.5 ? -1 : 1;
    return hsbToHex(hue, saturation, Math.max(0, Math.min(100, brightness + direction * step)));
}
