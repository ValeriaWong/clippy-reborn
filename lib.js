/* Clippy Reborn — lib.js
   Pure helpers only: no DOM access, no network, no storage.
   Written from scratch for this project (Nov 2026). UMD-style so the
   Node smoke test can require() it while the browser loads it as a
   classic script (top-level `const PipLib` is visible to later scripts). */
const PipLib = (() => {
  'use strict';

  /** Run fn after `ms` of quiet; resets on every call. */
  function debounce(fn, ms) {
    let t = null;
    return function (...args) {
      if (t !== null) clearTimeout(t);
      t = setTimeout(() => { t = null; fn.apply(this, args); }, ms);
    };
  }

  /** Escape text for safe insertion into HTML. */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Word count of plain text. */
  function wordCount(text) {
    const t = String(text || '').trim();
    return t === '' ? 0 : t.split(/\s+/).length;
  }

  /** Truncate to maxChars, cutting at a word boundary with an ellipsis. */
  function truncate(text, maxChars) {
    const s = String(text || '');
    if (s.length <= maxChars) return s;
    const cut = s.slice(0, maxChars);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > maxChars * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
  }

  /** Split plain text into sentences (keeps the trailing punctuation). */
  function splitSentences(text) {
    const s = String(text || '').replace(/\s+/g, ' ').trim();
    if (!s) return [];
    const out = s.match(/[^.!?]+[.!?]+["')\]]*\s*/g) || [s];
    return out.map(x => x.trim()).filter(Boolean);
  }

  /** Extractive summary: first sentence + the longest informative sentences,
      in original order. Local fallback when the AI service is unreachable. */
  function localSummarize(text, maxSentences) {
    const sentences = splitSentences(text);
    if (sentences.length === 0) return '';
    const n = maxSentences || 3;
    if (sentences.length <= n) return sentences.join(' ');
    const picked = new Set([0]);
    const ranked = sentences
      .map((s, i) => ({ s, i, words: wordCount(s) }))
      .filter(x => x.i !== 0 && x.words >= 6)
      .sort((a, b) => b.words - a.words)
      .slice(0, n - 1);
    ranked.forEach(x => picked.add(x.i));
    return [...picked].sort((a, b) => a - b).map(i => sentences[i]).join(' ');
  }

  /** Safe, rule-based grammar fixes. Returns { text, fixes } or null when
      nothing could be fixed. Never guesses at meaning — only mechanical
      errors: spacing, repeated words, common typos, sentence case, "i". */
  function localGrammarFix(text) {
    let s = String(text || '');
    let fixes = 0;
    const apply = (re, replacement) => {
      const next = s.replace(re, replacement);
      if (next !== s) { fixes += 1; s = next; }
    };
    apply(/ {2,}/g, ' ');                                    // double spaces
    apply(/\b(\w+)(\s+\1\b)+/gi, '$1');                      // repeated word
    apply(/\bteh\b/g, 'the');
    apply(/\brecieve\b/g, 'receive');
    apply(/\badress\b/g, 'address');
    apply(/\bseperate\b/g, 'separate');
    apply(/\boccured\b/g, 'occurred');
    apply(/\bdefinately\b/g, 'definitely');
    apply(/\bwich\b/g, 'which');
    apply(/(^|[.!?]\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase()); // sentence case
    apply(/\bi\b/g, 'I');                                    // lone lowercase i
    apply(/ ,/g, ',');
    apply(/ \./g, '.');
    return fixes === 0 ? null : { text: s, fixes };
  }

  /** Paragraphs of plain text as { text, start, end } offsets (split on
      blank lines; single newlines stay inside a paragraph). */
  function paragraphs(text) {
    const s = String(text || '');
    const out = [];
    const re = /\n[ \t]*\n/g;
    let start = 0;
    let m;
    while ((m = re.exec(s)) !== null) {
      const chunk = s.slice(start, m.index).trim();
      if (chunk) out.push({ text: chunk, start: start + (s.slice(start, m.index).length - s.slice(start, m.index).trimStart().length), end: m.index });
      start = m.index + m[0].length;
    }
    const tail = s.slice(start).trim();
    if (tail) out.push({ text: tail, start: start + (s.slice(start).length - s.slice(start).trimStart().length), end: s.length });
    return out;
  }

  /** The paragraph containing character offset `pos` (or the nearest one). */
  function paragraphAtOffset(text, pos) {
    const paras = paragraphs(text);
    if (paras.length === 0) return null;
    const p = Math.max(0, Math.min(pos, String(text).length));
    for (const para of paras) {
      if (p >= para.start && p <= para.end) return para;
    }
    return paras[paras.length - 1];
  }

  /** Longest paragraph (by words); null when there is no text. */
  function longestParagraph(text) {
    const paras = paragraphs(text);
    if (paras.length === 0) return null;
    let best = paras[0];
    for (const para of paras) {
      if (wordCount(para.text) > wordCount(best.text)) best = para;
    }
    return best;
  }

  /** Word-level diff (LCS) between two texts.
      Returns [{ type: 'same' | 'add' | 'del', text }] tokens. Whitespace is
      normalized to single spaces in the diff view; the applied edit always
      uses the raw new text, never this rendering. */
  function wordDiff(oldText, newText) {
    const a = String(oldText || '').split(/\s+/).filter(Boolean);
    const b = String(newText || '').split(/\s+/).filter(Boolean);
    const n = a.length, m = b.length;
    // LCS lengths table (m+1 columns, built row by row; n is small: inputs
    // are capped at ~2,000 chars, so the table stays modest).
    const dp = [];
    for (let i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const tokens = [];
    let i = 0, j = 0;
    const push = (type, w) => {
      const last = tokens[tokens.length - 1];
      if (last && last.type === type) last.text += ' ' + w;
      else tokens.push({ type, text: w });
    };
    while (i < n && j < m) {
      if (a[i] === b[j]) { push('same', a[i]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { push('del', a[i]); i++; }
      else { push('add', b[j]); j++; }
    }
    while (i < n) { push('del', a[i]); i++; }
    while (j < m) { push('add', b[j]); j++; }
    return tokens;
  }

  /** Render wordDiff tokens as HTML spans (del = struck, ins = highlighted). */
  function renderDiffHtml(tokens) {
    return tokens.map(t => {
      const safe = escapeHtml(t.text);
      if (t.type === 'del') return '<del class="diff-del">' + safe + '</del>';
      if (t.type === 'add') return '<ins class="diff-ins">' + safe + '</ins>';
      return safe;
    }).join(' ');
  }

  return {
    debounce, escapeHtml, wordCount, truncate, splitSentences,
    localSummarize, localGrammarFix, paragraphs, paragraphAtOffset,
    longestParagraph, wordDiff, renderDiffHtml,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PipLib;
