// showroom: the DOM helpers every section shares. TK · xoxn · 2026
export const $ = id => document.getElementById(id);
export const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
// Enter or space on a focused control does what its click does
export const onKey = (el, fn) => el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
