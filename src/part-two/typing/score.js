// showroom: typing-speed's score: the letters typed right, in place. TK · xoxn · 2026
export const rightLetters = (typed, prompt) => [...typed].filter((c, i) => c === prompt[i]).length;
