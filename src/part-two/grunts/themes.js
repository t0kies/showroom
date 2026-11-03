// showroom: grunts' terminal themes (theme/palette.go, read by build.mjs),
// in bufftime's ANSI colors. Theme 0 is SCREEN: the page's own scheme.
// TK · xoxn · 2026
import { PALETTE } from '../../../vendor/bufftime/scripts/term/themes.js';

const ROLES = ['bg', 'fg', 'accent', 'dim', 'ok', 'warn', 'err'];
export const themes = fetch('samples/grunts-themes.json').then(r => r.json()).then(list => [{ name: 'SCREEN' }, ...list]);

// sets --g-<role> on el, or clears them so the page's scheme shows through
export function applyTheme(el, theme) {
  for (const role of ROLES) {
    if (theme.name === 'SCREEN') el.style.removeProperty(`--g-${role}`);
    else el.style.setProperty(`--g-${role}`, PALETTE[theme[role]]);
  }
}
