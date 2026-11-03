// DOM helpers shared by every page. Importing this also applies the
// remembered skin (lib/skin.js), so every page gets it.

export const $ = (id) => document.getElementById(id);

// fromTemplate clones the first element of <template id="...">.
export const fromTemplate = (id) => $(id).content.firstElementChild.cloneNode(true);

// WebTUI attributes end in a dash (is-="button"); h() takes them
// without it: h('button', { is: 'button', variant: 'accent' }, 'Save').
const WEBTUI = new Set(['is', 'variant', 'size', 'box', 'cap', 'speed']);

// h builds an element. Props: WebTUI names above, on<event> handlers,
// class/className, dataset, text; anything else becomes an attribute.
export function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v === undefined || v === null || v === false) continue;
        if (WEBTUI.has(k)) el.setAttribute(k + '-', v);
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'class' || k === 'className') el.className = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k === 'text') el.textContent = v;
        else if (k in el && typeof v !== 'string') el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
    }
    el.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
    return el;
}

// button is the WebTUI button every page uses. kind: 'primary' (the
// page's main action), 'secondary', or 'danger'.
export function button(label, onclick, { kind = 'secondary', small = true, title } = {}) {
    const variant = { primary: 'accent', secondary: 'background2', danger: 'red' }[kind];
    return h('button', { type: 'button', is: 'button', variant, size: small ? 'small' : null, title, onclick }, label);
}
