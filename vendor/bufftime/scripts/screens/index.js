import { bestsScreen } from './bests.js';
import { chrome, chromeRows } from './chrome.js';
import { historyScreen } from './history.js';
import { keysScreen } from './keys.js';
import { logScreen } from './log.js';
import { splashScreen } from './splash.js';

const SCREENS = [logScreen, historyScreen, bestsScreen];

// The whole screen, W x H cells, as lines of segments: the splash, or the
// open tab (or the ? list) in its frame. The box takes 6 columns: borders
// and 2 cells of air each side.
export function screenLines(st, { entries, W, H, frame, th }) {
    if (st.splash) return splashScreen(th, { w: W, h: H, frame });
    const inner = { entries, w: W - 6, h: H - chromeRows(H), frame };
    const { lines, help } = st.help ? keysScreen(inner) : SCREENS[st.tab](st, inner);
    const note = st.note && st.note.until > Date.now() ? st.note : null;
    return chrome(st, { w: W, h: H, th, body: lines, help, note });
}
