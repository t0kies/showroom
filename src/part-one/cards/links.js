// showroom: 08, a card goes to its project's part of the pamphlet. TK · xoxn · 2026
import { $, onKey } from '../../lib/dom.js';

for (const card of document.querySelectorAll('.project-card[data-go]')) {
  const go = () => $(card.dataset.go).scrollIntoView({ behavior: 'smooth' });
  card.addEventListener('click', go);
  onKey(card, go);
}
