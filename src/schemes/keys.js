// showroom: p and shift+p for the next and last scheme, the auto button, and
// the scheme named in the URL. TK · xoxn · 2026
import { $ } from '../lib/dom.js';
import { scheme, screen, setAuto, isAuto, slug } from './state.js';

$('auto').onclick = () => setAuto(!isAuto());
addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'p' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  setAuto(false);
  screen(scheme.at + (e.shiftKey ? -1 : 1));
});
// the scheme named in the URL, or xorxnor in whichever mode the system is in
const system = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'xorxnor-dark' : 'xorxnor-light');
const fromHash = () => {
  const named = SKINS.findIndex(s => slug(s) === location.hash.slice(1));
  screen(named >= 0 ? named : Math.max(0, SKINS.findIndex(s => slug(s) === system())));
};
addEventListener('hashchange', fromHash);
fromHash();
