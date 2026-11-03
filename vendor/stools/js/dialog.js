// Questions, in the TUI instead of the browser's prompt() and confirm():
// a framed <dialog> in the middle of the page. Enter answers, Esc
// cancels, everywhere — control pages and the overlay alike.
//
//   const name = await ask({ title: 'new scene', label: 'Name', value: 'New scene' })
//   if (await confirmAction({ title: 'delete', text: 'Delete "Main"?', ok: 'Delete', danger: true })) …
//   showText({ title: 'copy this', text: url })   (where the clipboard is off-limits)

import { h } from './dom.js';

function open({ title, body, ok, danger, cancel = 'Cancel', focus }) {
    return new Promise((resolve) => {
        const form = h('form', { method: 'dialog' }, body,
            h('div', { class: 'buttons' },
                cancel ? h('button', { type: 'button', is: 'button', size: 'small', variant: 'background2', value: 'cancel', onclick: () => dialog.close('cancel') }, cancel) : null,
                h('button', { type: 'submit', is: 'button', size: 'small', variant: danger ? 'red' : 'accent', value: 'ok' }, ok)));
        const dialog = h('dialog', { class: 'ask tui-window tui-shadow', dataset: { title } }, form);
        dialog.addEventListener('close', () => {
            resolve(dialog.returnValue === 'ok');
            dialog.remove();
        });
        document.body.append(dialog);
        dialog.showModal();
        (focus || form.querySelector('[value=ok]')).focus();
    });
}

// ask resolves to the trimmed text entered, or null when cancelled or empty.
export async function ask({ title, label, value = '', ok = 'OK', hint }) {
    const input = h('input', { type: 'text', value, autocomplete: 'off', spellcheck: 'false' });
    const body = h('div', { class: 'field' }, h('label', {}, label), input, hint ? h('p', { class: 'muted' }, hint) : null);
    const yes = await open({ title, body, ok, focus: input });
    const text = input.value.trim();
    return yes && text ? text : null;
}

// confirmAction resolves to true when the action was confirmed.
export const confirmAction = ({ title, text, ok, danger = false }) =>
    open({ title, body: h('p', {}, text), ok, danger });

// showText shows text to select and copy by hand.
export const showText = ({ title, text }) =>
    open({ title, body: h('p', { class: 'copyable' }, h('code', {}, text)), ok: 'Done', cancel: null });
