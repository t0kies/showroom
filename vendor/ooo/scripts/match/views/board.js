import { line, mark } from '../../lib/dom.js';
import { settings } from '../../lib/settings.js';

const BAR_CELLS = 16;
const HEAD = ['', '#', 'player', 'right', 'health', 'picks', 'acc'];

function cells(row, ...items) {
    for (const item of items) row.append(typeof item === 'string' ? line('game-board-cell', item) : item);
}

function playerRow(player, rank, { winnerId, selfId }) {
    const row = line('game-board-row');
    row.setAttribute('role', 'row');
    row.dataset.out = String(player.status === 'eliminated');

    const flag = line('game-board-cell');
    if (player.id === winnerId) flag.append(mark('★', 'mark-busy'));
    else if (player.id === selfId) flag.append(mark('►', 'mark-busy'));
    const health = line('game-board-cell');
    const lost = Math.max(0, settings.match.startingHealth - player.health);
    health.append(mark('♥'.repeat(player.health), 'mark-hp'), mark('·'.repeat(lost), 'dim'));
    health.setAttribute('aria-label', `${player.health} health`);
    const name = player.id === selfId ? `${player.nickname} (you)` : player.nickname;
    const picks = player.questionIndex;
    const accuracy = picks ? `${Math.round((100 * player.score) / picks)}%` : '–';

    cells(row, flag, String(rank), line('game-board-cell is-name', name));
    cells(row, line('game-board-cell is-num', String(player.score)), health);
    cells(row, line('game-board-cell is-num', String(picks)), line('game-board-cell is-num', accuracy));
    return row;
}

// The results table: one row per player in fixed cell columns, then a bar of
// their score against the top score. ★ marks the winner, ► you.
export function board(result, selfId) {
    const table = line('game-board');
    table.setAttribute('role', 'table');
    const head = line('game-board-row game-board-head');
    head.setAttribute('role', 'row');
    cells(head, ...HEAD);
    table.appendChild(head);

    const top = Math.max(1, ...result.results.map(player => player.score));
    result.results.forEach((player, index) => {
        const cellsLong = Math.max(player.score ? 1 : 0, Math.round((BAR_CELLS * player.score) / top));
        const bar = line('game-board-bar', '▆'.repeat(cellsLong));
        bar.setAttribute('aria-hidden', 'true');
        table.append(playerRow(player, index + 1, { winnerId: result.winnerId, selfId }), bar);
    });
    return table;
}
