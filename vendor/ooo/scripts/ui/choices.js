import { safeColor } from '../lib/color.js';
import { button, line } from '../lib/dom.js';
import { blocks, onRefit } from '../lib/grid.js';
import { layoutFor } from './choice-fit.js';
import { PICK_KEYS } from './pick-keys.js';

export { pickIndex } from './pick-keys.js';

// Marks an answered pick: G shadow under `right`, R under `wrong` (-1 for none).
export function markChoices(buttons, right, wrong = -1) {
    buttons.forEach((choice, index) => {
        choice.classList.toggle('is-right', index === right);
        choice.classList.toggle('is-wrong', index === wrong);
    });
}

function choiceButton(option, index, { across, down }, { picked, disabled, onPick }) {
    const choice = button('', index === picked ? 'game-choice is-picked' : 'game-choice', () => onPick(index));
    const keys = `${index + 1} ${PICK_KEYS[index].toUpperCase()}`;
    choice.disabled = disabled;
    choice.setAttribute('aria-label', `option ${index + 1}`);
    choice.setAttribute('aria-keyshortcuts', keys);
    choice.dataset.focus = `choice-${index}`;

    const swatch = line('blocks', blocks(across, down));
    swatch.style.color = safeColor(option.hex_code);
    const label = line('key', keys);
    label.setAttribute('aria-hidden', 'true');
    choice.append(swatch, label);
    return choice;
}

// The options as block swatches with their keys underneath, resized when the
// card changes size. The card must be in the page to be measured.
// between: { el, rows } placed under the row of swatches.
// right / wrong: mark an answered pick (as in markChoices).
export function choiceRow(card, options, onPick, opts = {}) {
    const { picked = -1, disabled = false, between = null, right = -1, wrong = -1 } = opts;
    const extraRows = between ? between.rows + 1 : 0;
    const size = layoutFor(card, options.length, extraRows);

    const grid = line('game-choices');
    grid.style.setProperty('--per-row', size.perRow);
    const buttons = options.map((option, index) => {
        const choice = choiceButton(option, index, size, { picked, disabled, onPick });
        grid.appendChild(choice);
        if (extraRows && index === size.perRow - 1) grid.appendChild(between.el);
        return choice;
    });
    markChoices(buttons, right, wrong);
    onRefit(card, grid, () => {
        const { across, down } = layoutFor(card, options.length, extraRows);
        const swatch = blocks(across, down);
        for (const el of grid.querySelectorAll('.blocks')) el.textContent = swatch;
    });
    return { grid, buttons };
}
