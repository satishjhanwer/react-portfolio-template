function scoreTerm(term: string, text: string): number {
  const idx = text.indexOf(term);
  if (idx !== -1) {
    const wordStart = idx === 0 || /\W/.test(text[idx - 1]);
    return 100 + (wordStart ? 50 : 0) - Math.min(idx, 40);
  }

  const maxSpan = Math.max(term.length * 3, term.length + 4);
  let best = -1;
  for (let start = text.indexOf(term[0]); start !== -1; start = text.indexOf(term[0], start + 1)) {
    let score = 0;
    let prev = start - 2;
    let pos = start;
    let ok = true;
    for (const ch of term) {
      const found = text.indexOf(ch, pos);
      if (found === -1 || found - start >= maxSpan) {
        ok = false;
        break;
      }
      if (found === prev + 1) {
        score += 5;
      }
      if (found === 0 || /\W/.test(text[found - 1])) {
        score += 3;
      }
      score += 1;
      prev = found;
      pos = found + 1;
    }
    if (ok) {
      best = Math.max(best, score);
    }
  }
  return best;
}

export function fuzzyScore(query: string, label: string, keywords = "") {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return 0;
  }

  const l = label.toLowerCase();
  const k = keywords.toLowerCase();
  let total = 0;
  for (const term of terms) {
    const inLabel = scoreTerm(term, l);
    const inKeywords = k ? scoreTerm(term, k) : -1;
    const best = Math.max(inLabel * 1.5, inKeywords);
    if (best < 0) {
      return -1;
    }
    total += best;
  }
  return total;
}
