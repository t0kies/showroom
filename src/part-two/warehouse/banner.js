// showroom: the kit's cat banners, one for whoever is on shift. TK · xoxn · 2026
import { $, esc } from '../../lib/dom.js';
import { SHIFT } from './yard.js';

const banners = Object.fromEntries(SHIFT.map(n => [n, fetch(`vendor/xoxn/txt/${n}.txt`).then(r => r.text())]));
// the banners carry ${c1} ${c2} ${c4} ${NC} for the shell to fill in
const tint = t => esc(t).replace(/\$\{c(\d)\}/g, '<span class="b-c$1">').replace(/\$\{NC\}/g, '</span>');

// every banner as big as its glass allows, no side scrolling: measure at 10px, then scale
export function showBanner(name) {
  banners[name].then(t => {
    const pre = $('banner'), box = pre.parentElement;
    pre.innerHTML = tint(t.replace(/\t/g, '    ').replace(/\s+$/, ''));
    pre.style.fontSize = '10px';
    const room = [box.clientWidth - 32, box.clientHeight - 32];
    const scale = Math.min(room[0] / pre.scrollWidth, room[1] / pre.scrollHeight);
    pre.style.fontSize = `${(10 * scale).toFixed(2)}px`;
    $('banner-name').textContent = name;
  });
}
