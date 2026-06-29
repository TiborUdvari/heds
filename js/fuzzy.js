// Fuzzy free-text matching: accept answers that are slightly misspelled or
// differ only in accents/case/punctuation. Works with French text.
//
//   fuzzyMatch(input, ["écologie", "l'écologie"])  ->  true / false
//
// Exposed on window so screen <script>s (which run as classic scripts, not
// modules) can call fuzzyMatch(...) directly.

// Fold a string to a comparable form: strip accents (é→e, ç→c), expand the
// French ligatures œ/æ, lowercase, drop punctuation, and collapse whitespace.
export function normalizeText(s) {
  return s
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD") // split accented letters into base + combining mark
    .replace(/[̀-ͯ]/g, "") // remove the combining marks
    .replace(/[^a-z0-9\s]/g, " ") // punctuation -> space
    .trim()
    .replace(/\s+/g, " ");
}

// Levenshtein edit distance (number of single-char insert/delete/substitutions).
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

// True if `input` is close enough to ANY accepted answer after normalization.
// `tolerance` is the max edit distance; if omitted it scales with the answer
// length (~1 typo per 4 characters), so short and long answers both behave.
export function fuzzyMatch(input, answers, tolerance) {
  const got = normalizeText(input);
  if (!got) return false;
  return answers.some((answer) => {
    const want = normalizeText(answer);
    const allowed = tolerance ?? Math.max(1, Math.round(want.length / 4));
    return levenshtein(got, want) <= allowed;
  });
}

window.normalizeText = normalizeText;
window.levenshtein = levenshtein;
window.fuzzyMatch = fuzzyMatch;
