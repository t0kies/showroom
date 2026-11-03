// showroom: stools' own <stools-alert-box>, toast and dialog
// (overlay/public/js), on a stage the size of the stream. The raid is made up.
// TK · xoxn · 2026
import '../../../vendor/stools/js/alert-box.js';
import { toast } from '../../../vendor/stools/js/toast.js';
import { ask, confirmAction } from '../../../vendor/stools/js/dialog.js';
import { $ } from '../../lib/dom.js';
import { onScheme } from '../../schemes/state.js';

const ANIMS = ['pop', 'fade', 'slide']; // alert-box.js
const RAIDS = [['pickles', 12], ['fire-cat', 40], ['catio', 3], ['luna', 27]]; // made up
let scene = 'just chatting', n = 0;

const box = document.createElement('stools-alert-box');
$('stage').append(box);

// the editor places the box; here it's the stage's middle half
function place() {
  const s = $('stage');
  const w = s.clientWidth / 2, h = s.clientHeight / 2;
  box.layout({ baseWidth: w, baseHeight: h, scale: 1, x: w / 2, y: h / 2 });
}

function raid() {
  const [who, viewers] = RAIDS[n % RAIDS.length], animation = ANIMS[n % ANIMS.length];
  n++;
  place();
  box.show({ text: `${who} raided with ${viewers}`, mediaUrl: 'samples/stool.svg', duration: 3500, animation });
  $('raid-log').textContent = `alert · ${animation} · 3.5 s`;
}

$('raid').onclick = raid;
$('save').onclick = () => toast(`Saved "${scene}"`);
$('rename').onclick = async () => {
  const name = await ask({ title: 'rename scene', label: 'Name', value: scene, hint: 'Its address becomes localhost:3000/<name>.' });
  if (!name) return;
  scene = name;
  $('scene').dataset.title = `scene: ${name}`;
  toast(`Renamed to "${name}"`);
};
$('end').onclick = async () => {
  if (await confirmAction({ title: 'end stream', text: `End the stream on "${scene}"?`, ok: 'End', danger: true })) {
    toast.error('Not ending anything: this is a pamphlet');
  }
};
addEventListener('resize', place);
onScheme(s => { $('stage').dataset.skin = s.name; }); // the stream stays dark, in this scheme
// a raid when the stage comes into view, then one every 8 s while it's there
let every = 0;
new IntersectionObserver(([e]) => {
  clearInterval(every);
  if (e.isIntersecting) { raid(); every = setInterval(raid, 8000); }
}, { threshold: 0.5 }).observe($('stage'));
