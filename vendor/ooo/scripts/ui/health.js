import { line } from '../lib/dom.js';
import { settings } from '../lib/settings.js';

// HUD hearts. `lost` animates the heart just taken.
export function healthIndicator(health, { lost = false } = {}) {
    const indicator = line('game-health');
    indicator.setAttribute('role', 'img');
    indicator.setAttribute('aria-label', `Health ${health} of ${settings.match.startingHealth}`);
    indicator.dataset.low = String(health <= 2);
    indicator.append(line('game-health-label', 'hp'));

    const pips = line('game-health-pips');
    pips.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < settings.match.startingHealth; index++) {
        const pip = line('game-health-pip', '♥');
        if (index < health) pip.classList.add('is-full');
        else if (lost && index === health) pip.classList.add('is-lost');
        pips.appendChild(pip);
    }
    indicator.appendChild(pips);
    return indicator;
}

// Damage feedback: a hit sound and .damage-hit on <body> (the HUD is in the
// top row, outside the game) for 520 ms.
export function createDamageEffect(sound) {
    const target = document.body;
    let timeout = null;

    function clear() {
        clearTimeout(timeout);
        timeout = null;
        target.classList.remove('damage-hit');
    }

    return {
        clear,
        get active() {
            return target.classList.contains('damage-hit');
        },
        hit() {
            sound.damage();
            clear();
            void target.offsetWidth; // restart the CSS animation
            target.classList.add('damage-hit');
            timeout = setTimeout(clear, 520);
        },
    };
}
