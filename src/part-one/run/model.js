// showroom: 03, the plates in luna's 3D view and as dots beside it, turning
// together. TK · xoxn · 2026
import { toHTML } from '../../../vendor/luna/js/text.js';
import { rows } from '../../../vendor/luna/js/dots.js';
import { Mesh3D, View3D } from '../../../vendor/luna/js/gl3d.js';
import { $ } from '../../lib/dom.js';
import { LOOK, files, px, cols } from './files.js';

// turns on its own until someone drags it, like luna's preview
const rot = { yaw: 0.7, pitch: 0.5, auto: true };
let view = null;

export async function model() {
  const stl = await files.stl;
  const cv = $('view3d');
  if (!view) {
    view = View3D.create(cv);
    if (!view) return;
    view.setMesh(new Mesh3D(stl.v));
    let drag = null;
    cv.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); rot.auto = false; };
    cv.onpointermove = e => {
      if (!drag) return;
      rot.yaw += (e.clientX - drag.x) * 0.01;
      rot.pitch = Math.max(-1.5, Math.min(1.5, rot.pitch + (e.clientY - drag.y) * 0.01));
      drag = { x: e.clientX, y: e.clientY };
    };
    cv.onpointerup = cv.onpointercancel = () => { drag = null; };
    setInterval(() => { if (rot.auto) rot.yaw += 0.045; turn(stl); }, 100);
  }
  view.resize(Math.round(cv.clientWidth / px(cv)), Math.round(cv.clientHeight / px(cv)));
  view.recolor();
  turn(stl);
}

function turn(stl) {
  view?.draw(rot.yaw, rot.pitch, LOOK);
  const W = cols($('stl-text'));
  // dots() takes pitch the other way round from gl3d, so it gets -pitch to turn with it
  $('stl-text').innerHTML = toHTML(rows(stl.dots(W, Math.round(W / 3), rot.yaw, -rot.pitch), LOOK));
}
