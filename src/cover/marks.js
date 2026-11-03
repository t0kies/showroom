// showroom: the kit's marks, on the masthead and the back cover. TK · xoxn · 2026
import { $ } from '../lib/dom.js';

const mark = name => fetch(`vendor/xoxn/marks/${name}.svg`).then(r => r.text());
mark('xn').then(svg => { $('mast-mark').innerHTML = svg; });
Promise.all([mark('cat'), mark('xn')]).then(svgs => { $('marks').innerHTML = svgs.join(''); });
