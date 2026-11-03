// showroom: kloves run abfe417d373dbe87: its numbers, its files, and how big
// luna's cells are on this page. TK · xoxn · 2026
import { parseSTL, StlView, openPDF } from '../../../vendor/luna/js/viewers.js';

export const LOOK = { pal: 'tri', fill: false }; // luna's main.js
// one font pixel, and one cell across: Departure Mono's cell is 7×14 at 11px
export const px = el => parseFloat(getComputedStyle(el).fontSize) / 11;
export const cols = el => Math.floor(el.clientWidth / (px(el) * 7));

// the run's own numbers, from firmware1/main.h and receipt.pdf
export const HAND = [['PINKY', -0.4], ['RING', 0.4], ['MIDDLE', 1.2], ['INDEX A', 0.3], ['INDEX B', -0.9], ['POINTER', -0.9]];
export const FILES = [['plates.stl', '197K'], ['profile.svg', '754'], ['firmware1/main.c', '475'], ['receipt.pdf', '1.6K'], ['report.pdf', '2.2K']];
export const fmt = v => (v < 0 ? '-' : '+') + Math.abs(v).toFixed(1); // luna's screen.js

const bytes = name => fetch(`samples/${name}`).then(r => r.arrayBuffer());
export const files = {
  stl: bytes('plates.stl').then(b => new StlView(parseSTL(b))),
  svg: fetch('samples/profile.svg').then(r => r.text()),
  pdf: bytes('report.pdf').then(openPDF),
  c: fetch('samples/main.c').then(r => r.text()),
};
