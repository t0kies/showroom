// showroom: 07, ooo's settings bar. Sound blips on 06's swatches, theme is p,
// full puts 06 on the whole screen, solo plays it again. TK · xoxn · 2026
import { $ } from '../../lib/dom.js';
import { onScheme } from '../../schemes/state.js';

const flip = (el, on, value) => { el.setAttribute('aria-pressed', String(on)); if (value) el.querySelector('.setting-value').textContent = value; };
let sound = true, ac = null;

function blip() {
  if (!sound) return;
  ac ??= new AudioContext();
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.frequency.value = 660;
  g.gain.setValueAtTime(0.06, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + 0.12);
}

$('choices').addEventListener('click', blip);
$('sound-toggle').onclick = () => { sound = !sound; flip($('sound-toggle'), sound, sound ? 'on' : 'off'); };
$('theme-next').onclick = () => dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
$('fullscreen-toggle').onclick = () => (document.fullscreenElement ? document.exitFullscreen() : $('s6').requestFullscreen?.());
addEventListener('fullscreenchange', () => flip($('fullscreen-toggle'), !!document.fullscreenElement, document.fullscreenElement ? 'on' : 'off'));
$('solo').onclick = () => { $('s6').scrollIntoView({ behavior: 'smooth' }); if (!$('again').hidden) $('again').click(); };
onScheme(s => { $('ooo-theme').textContent = s.name; });
