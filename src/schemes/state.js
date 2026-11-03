// showroom: the color scheme on screen, and the sections that repaint when it
// changes. TK · xoxn · 2026
const root = document.documentElement;
const hooks = [];
export const scheme = { at: 0, on: null }; // on: the scheme on screen, once there is one
export const label = s => (s.pinned ? `${s.name} ${s.mode}` : s.name);
export const slug = s => label(s).replace(' ', '-');

// a section drawn in the scheme's colors repaints on every change
export function onScheme(fn) {
  hooks.push(fn);
  if (scheme.on) fn(scheme.on, scheme.at);
}

export function screen(n) {
  scheme.at = (n + SKINS.length) % SKINS.length;
  const s = (scheme.on = SKINS[scheme.at]);
  root.dataset.skin = s.name;
  if (s.pinned) root.dataset.mode = s.mode;
  else delete root.dataset.mode;
  history.replaceState(null, '', `#${slug(s)}`);
  for (const fn of hooks) fn(s, scheme.at);
}

// auto: a new screen every four seconds, until someone picks one
let auto = 0;
export function setAuto(on) {
  clearInterval(auto);
  auto = on ? setInterval(() => screen(scheme.at + 1), 4000) : 0;
  document.getElementById('auto').setAttribute('aria-pressed', String(on));
}
export const isAuto = () => auto !== 0;
export const pick = n => { setAuto(false); screen(n); };
