/* Clippy Reborn — app.js
   Editor state, action dispatch, diff/accept flow, Manners System.
   Written from scratch for this project (Nov 2026). Vanilla JS, no
   dependencies. Documents live in localStorage; the only network call
   is the keyless Pollinations text API, and only for text the user
   explicitly asks Pip about. No API key anywhere. */
'use strict';

/* ------------------------------------------------------------------ */
/* Copy — all user-visible Pip lines live here (steering: self-aware,  */
/* brief, never condescending).                                        */
/* ------------------------------------------------------------------ */
const COPY = {
  greeting: 'Hi — I\u2019m Pip. I know, I used to pop up uninvited. I\u2019ve been in therapy since 2007.',
  backFromMute: 'I\u2019m back. I\u2019ll keep it brief.',
  emptyDoc: 'Give me something to work with first.',
  thinking: {
    summarize: 'On it — reading it over…',
    'rewrite-shorter': 'On it — tightening it up…',
    'rewrite-formal': 'On it — putting on a tie…',
    'rewrite-friendly': 'On it — warming it up…',
    'fix-grammar': 'On it — checking the commas…',
    'continue': 'On it — picking up where you left off…',
    'draft': 'On it — drafting…',
    'explain': 'On it — working out what it means…'
  },
  result: {
    summarize: 'Here\u2019s the short version. Keep it, copy it, or toss it.',
    'rewrite-shorter': 'Here\u2019s a tighter version — keep it or toss it?',
    'rewrite-formal': 'Here\u2019s the formal version — keep it or toss it?',
    'rewrite-friendly': 'Here\u2019s a friendlier version — keep it or toss it?',
    'fix-grammar': 'Fixed a few things — here\u2019s the diff. Nothing applied yet.',
    'continue': 'Here\u2019s a continuation — keep it or toss it?',
    'draft': 'Here\u2019s a draft — keep it or toss it?',
    'explain': 'Here\u2019s what it means, in plain words.'
  },
  accepted: 'Done. Want anything else?',
  discarded: 'Tossed it. No hard feelings.',
  inserted: 'Added at the end. Want anything else?',
  copied: 'Copied.',
  failed: 'The AI service didn\u2019t answer. Here\u2019s what I can do offline instead.',
  failedNoFallback: 'The AI service didn\u2019t answer. Want me to try again?',
  offlineUsed: 'This one\u2019s the offline version — no AI call was made.',
  staleText: 'The text moved under me — I\u2019ll leave it alone rather than guess.',
  noFixes: 'I looked it over and couldn\u2019t find anything to fix. It reads well.'
};

/* ------------------------------------------------------------------ */
/* Storage keys (all prefixed `pip-`, see design.md).                  */
/* ------------------------------------------------------------------ */
const LS = {
  doc: 'pip-doc',
  muted: 'pip-muted',
  noSuggest: 'pip-no-suggest',
  undo: 'pip-undo'
};

/* ------------------------------------------------------------------ */
/* Starter document — a cover letter (the demo genre, per parent).     */
/* The nostalgia hook lives in the first line.                         */
/* ------------------------------------------------------------------ */
const STARTER_DOC = [
  'Dear Hiring Manager,',
  'I am writing to apply for the product designer role at Northwind Studio. I have spent the last six years designing tools that people use every day, and I am drawn to Northwind because your team treats good design as a craft, not a coat of paint.',
  'In my current role, I lead a small team that rebuilt our onboarding flow from scratch. We cut the time to first value in half, and support tickets about getting started fell by a third. I did this by watching real users struggle, and then by removing steps instead of adding them.',
  'I would love to bring the same approach to Northwind. Thank you for considering my application. I look forward to hearing from you.',
  'Sincerely,\nAlex Rivera'
].join('\n\n');

/* ------------------------------------------------------------------ */
/* DOM helpers                                                         */
/* ------------------------------------------------------------------ */
const $ = id => document.getElementById(id);
const editor = $('editor');
const dock = $('pipDock');
const bubbleText = $('pipBubbleText');
const bubbleActions = $('pipBubbleActions');
const diffPanel = $('diffPanel');
const diffTitle = $('diffTitle');
const diffBody = $('diffBody');
const noteBody = $('noteBody');
const diffNote = $('diffNote');
const btnAccept = $('diffAccept');
const btnDiscard = $('diffDiscard');
const btnCopy = $('noteCopy');
const btnInsert = $('noteInsert');
const btnRetry = $('diffRetry');
const btnOffline = $('diffOffline');
const muteBtn = $('muteBtn');
const mannersLine = $('mannersLine');
const undoBtn = $('undoBtn');
const wordCountEl = $('wordCount');

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */
const state = {
  muted: localStorage.getItem(LS.muted) === 'true',
  noSuggest: localStorage.getItem(LS.noSuggest) === 'true',
  suggestBudgetUsed: false,          // one proactive suggestion per session
  busy: false,                       // an AI call is in flight
  proposal: null,                    // current diff/note/failure proposal
  undoText: localStorage.getItem(LS.undo) || null,
  storedSel: null,                   // last non-collapsed selection in editor
  storedCaret: 0,                    // last caret offset in editor
  idleTimer: null
};

/* ------------------------------------------------------------------ */
/* Pip state + bubble                                                  */
/* ------------------------------------------------------------------ */
const PIP_STATES = ['idle', 'thinking', 'success', 'apologetic', 'hidden'];
function setPipState(next) {
  // While muted, Pip stays hidden whatever the action engine says.
  if (state.muted) next = 'hidden';
  PIP_STATES.forEach(s => dock.classList.remove('pip-state-' + s));
  dock.classList.remove('pip-gesture-point', 'pip-gesture-cheer');
  dock.classList.add('pip-state-' + next);
}

function setBubble(text, actions) {
  bubbleText.textContent = text;
  bubbleActions.innerHTML = '';
  if (actions && actions.length) {
    actions.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = a.label;
      if (a.quiet) b.className = 'quiet';
      b.addEventListener('click', a.onClick);
      bubbleActions.appendChild(b);
    });
    bubbleActions.hidden = false;
  } else {
    bubbleActions.hidden = true;
  }
}

function updateMannersLine() {
  mannersLine.textContent =
    'Pip asks first \u00b7 one suggestion per session: ' +
    (state.suggestBudgetUsed ? 'used' : 'unused') +
    ' \u00b7 Muted: ' + (state.muted ? 'yes' : 'no') +
    (state.noSuggest ? ' \u00b7 suggestions off' : '');
}

/* ------------------------------------------------------------------ */
/* Editor — plain text, single text node, autosave                    */
/* ------------------------------------------------------------------ */
function docText() {
  editor.normalize();
  return editor.textContent;
}

function setDocText(text) {
  editor.textContent = text;
  editor.normalize();
  updateWordCount();
}

const saveDoc = PipLib.debounce(() => {
  try { localStorage.setItem(LS.doc, docText()); } catch (e) { /* storage full/blocked: editing still works */ }
}, 500);

function updateWordCount() {
  wordCountEl.textContent = PipLib.wordCount(docText()) + ' words';
}

function pushUndo() {
  state.undoText = docText();
  try { localStorage.setItem(LS.undo, state.undoText); } catch (e) { /* ignore */ }
  undoBtn.disabled = false;
}

function doUndo() {
  if (state.undoText === null) return;
  const current = docText();
  setDocText(state.undoText);
  state.undoText = current; // undo is a toggle between the two states
  try { localStorage.setItem(LS.undo, state.undoText); } catch (e) { /* ignore */ }
  saveDoc();
  setBubble('Undone. The old version is back.');
  setPipState('idle');
}

function onDocInput() {
  updateWordCount();
  saveDoc();
  resetIdleTimer();
}

/* Keep the editor a single plain-text node: intercept Enter and paste. */
function insertTextAtCaret(text) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return;
  range.deleteFromDocument();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  editor.normalize();
  onDocInput();
}

editor.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    insertTextAtCaret('\n');
  }
});

editor.addEventListener('paste', e => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  if (text) insertTextAtCaret(text);
});

editor.addEventListener('input', onDocInput);

/* Track the last selection/caret inside the editor so action buttons
   (which steal focus) still know what the user had selected. */
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return;
  const info = selectionInfo();
  if (info) state.storedSel = info;
  else state.storedSel = null;
  const caret = caretOffset();
  if (caret !== null) state.storedCaret = caret;
});

function caretOffset() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return null;
  editor.normalize();
  const node = editor.firstChild;
  if (!node) return 0;
  if (range.startContainer === node) return range.startOffset;
  if (range.startContainer === editor) return range.startOffset === 0 ? 0 : editor.textContent.length;
  return null;
}

function selectionInfo() {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null;
  editor.normalize();
  const node = editor.firstChild;
  if (!node || node.nodeType !== 3) return null;
  const pre = range.cloneRange();
  pre.selectNodeContents(node);
  try {
    pre.setEnd(range.startContainer, range.startOffset);
  } catch (e) {
    return null;
  }
  const start = pre.toString().length;
  const text = range.toString();
  if (!text) return null;
  return { text, start, end: start + text.length };
}

/* ------------------------------------------------------------------ */
/* LLM — keyless Pollinations text API (same call shape the sibling   */
/* Reader project verified live). 30 s timeout, plain-text reply.      */
/* ------------------------------------------------------------------ */
async function callLLM(prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(
      'https://text.pollinations.ai/' + encodeURIComponent(prompt),
      { signal: controller.signal }
    );
    if (!res.ok) return { ok: false, status: res.status };
    const text = (await res.text()).trim();
    if (!text) return { ok: false, status: 'empty' };
    return { ok: true, text: PipLib.truncate(text, 1500) };
  } catch (err) {
    return { ok: false, status: err && err.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */
const PROMPTS = {
  'summarize': t => 'Summarize the following text in two or three plain sentences. Reply with only the summary, no preamble, no quotation marks:\n\n' + t,
  'rewrite-shorter': t => 'Rewrite the following text to be shorter and tighter while keeping its meaning. Reply with only the rewritten text, no preamble:\n\n' + t,
  'rewrite-formal': t => 'Rewrite the following text in a formal, professional tone, keeping its meaning. Reply with only the rewritten text, no preamble:\n\n' + t,
  'rewrite-friendly': t => 'Rewrite the following text in a warm, friendly tone, keeping its meaning. Reply with only the rewritten text, no preamble:\n\n' + t,
  'fix-grammar': t => 'Fix the grammar, spelling, and punctuation in the following text. Change only what is wrong. Reply with only the corrected text, no preamble:\n\n' + t,
  'continue': t => 'Continue writing the following text in the same tone and style, for two or three sentences. Reply with only the continuation, no preamble:\n\n' + t,
  'explain': t => 'Explain the following text in plain language, in two or three sentences. Reply with only the explanation, no preamble:\n\n' + t
};

/* Which actions produce a diff (replace a span) vs a note (display only). */
const ACTION_KIND = {
  'summarize': 'note',
  'rewrite-shorter': 'diff',
  'rewrite-formal': 'diff',
  'rewrite-friendly': 'diff',
  'fix-grammar': 'diff',
  'continue': 'diff-insert',
  'draft': 'diff-insert',
  'explain': 'note'
};

/* Resolve the target span for an action from the stored selection/caret. */
function resolveTarget(actionId) {
  const text = docText();
  if (actionId === 'summarize') {
    return { text, anchor: { type: 'replace-all' } };
  }
  if (actionId === 'draft') {
    return { text: '', anchor: { type: 'insert', offset: state.storedCaret } };
  }
  if (actionId === 'continue') {
    const para = PipLib.paragraphAtOffset(text, state.storedCaret);
    if (!para) return null;
    return { text: para.text, anchor: { type: 'range', start: para.start, end: para.end } };
  }
  // rewrite / fix-grammar / explain: selection first, else paragraph at caret.
  if (state.storedSel && state.storedSel.text.trim()) {
    return { text: state.storedSel.text, anchor: { type: 'range', start: state.storedSel.start, end: state.storedSel.end } };
  }
  const para = PipLib.paragraphAtOffset(text, state.storedCaret);
  if (!para) return null;
  return { text: para.text, anchor: { type: 'range', start: para.start, end: para.end } };
}

async function runAction(actionId, extra) {
  if (state.busy) return;
  const target = resolveTarget(actionId);
  if (actionId === 'draft') {
    const prompt = (extra && extra.prompt ? String(extra.prompt) : '').trim();
    if (!prompt) { setBubble('Tell me what to draft first — one short line is enough.'); return; }
    state.busy = true;
    setActionButtonsDisabled(true);
    setPipState('thinking');
    setBubble(COPY.thinking['draft']);
    const res = await callLLM('Write the following, as requested: ' + PipLib.truncate(prompt, 200) + '. Reply with only the written text, no preamble.');
    state.busy = false;
    setActionButtonsDisabled(false);
    if (res.ok) {
      showDiffProposal({
        actionId, kind: 'diff-insert',
        oldText: '', newText: res.text,
        anchor: { type: 'insert', offset: state.storedCaret }
      });
    } else {
      showFailure(actionId, null);
    }
    return;
  }

  if (!target || !target.text.trim()) {
    setBubble(COPY.emptyDoc);
    setPipState('apologetic');
    setTimeout(() => { if (!state.muted) setPipState('idle'); }, 1200);
    return;
  }

  const sendText = PipLib.truncate(target.text, 2000);
  state.busy = true;
  setActionButtonsDisabled(true);
  setPipState('thinking');
  setBubble(COPY.thinking[actionId] || 'On it — working…');

  const res = await callLLM(PROMPTS[actionId](sendText));
  state.busy = false;
  setActionButtonsDisabled(false);

  if (res.ok) {
    const kind = ACTION_KIND[actionId];
    if (kind === 'note') {
      showNoteProposal({ actionId, text: res.text });
    } else if (kind === 'diff-insert') {
      // Continue: append the continuation to the target paragraph.
      showDiffProposal({
        actionId, kind: 'diff-insert',
        oldText: target.text, newText: target.text + ' ' + res.text,
        anchor: target.anchor
      });
    } else {
      showDiffProposal({
        actionId, kind: 'diff',
        oldText: target.text, newText: res.text,
        anchor: target.anchor
      });
    }
    return;
  }

  // Failure path: apologetic Pip, plain-language note, offline fallback
  // where one exists (summarize, fix-grammar).
  let fallback = null;
  if (actionId === 'summarize') fallback = { text: PipLib.localSummarize(target.text, 3) };
  if (actionId === 'fix-grammar') {
    const fixed = PipLib.localGrammarFix(target.text);
    if (fixed) fallback = { text: fixed.text, note: 'Offline fix: ' + fixed.fixes + ' small correction' + (fixed.fixes > 1 ? 's' : '') + '.' };
  }
  showFailure(actionId, fallback, target);
}

function setActionButtonsDisabled(disabled) {
  document.querySelectorAll('.action-btn').forEach(b => { b.disabled = disabled; });
}

/* ------------------------------------------------------------------ */
/* Proposals: diff / note / failure                                    */
/* ------------------------------------------------------------------ */
function hidePanel() {
  diffPanel.hidden = true;
  diffBody.innerHTML = '';
  noteBody.textContent = '';
  noteBody.hidden = true;
  diffBody.hidden = false;
  diffNote.hidden = true;
  btnAccept.hidden = false;
  btnDiscard.hidden = false;
  btnCopy.hidden = true;
  btnInsert.hidden = true;
  btnRetry.hidden = true;
  btnOffline.hidden = true;
  state.proposal = null;
}

function showDiffProposal(p) {
  state.proposal = p;
  hidePanelFields();
  diffTitle.textContent = 'Pip suggests — ' + actionLabel(p.actionId);
  diffBody.innerHTML = PipLib.renderDiffHtml(PipLib.wordDiff(p.oldText, p.newText));
  diffBody.hidden = false;
  btnAccept.hidden = false;
  btnDiscard.hidden = false;
  diffPanel.hidden = false;
  setPipState('success');
  setBubble(COPY.result[p.actionId] || 'Here\u2019s my suggestion — keep it or toss it?');
  resetIdleTimer();
}

function showNoteProposal(p) {
  state.proposal = { actionId: p.actionId, kind: 'note', text: p.text };
  hidePanelFields();
  diffTitle.textContent = actionLabel(p.actionId);
  noteBody.textContent = p.text;
  noteBody.hidden = false;
  diffBody.hidden = true;
  btnAccept.hidden = true;
  btnDiscard.hidden = true;
  btnCopy.hidden = false;
  btnInsert.hidden = false;
  diffPanel.hidden = false;
  setPipState('success');
  setBubble(COPY.result[p.actionId] || 'Here you go.');
  resetIdleTimer();
}

function showFailure(actionId, fallback, target) {
  state.proposal = { actionId, kind: 'failure', fallback: fallback || null, target: target || null };
  hidePanelFields();
  diffTitle.textContent = 'The AI service didn\u2019t answer';
  diffBody.hidden = true;
  noteBody.hidden = true;
  btnAccept.hidden = true;
  btnDiscard.hidden = true;
  btnRetry.hidden = false;
  if (fallback && fallback.text) btnOffline.hidden = false;
  diffNote.textContent = fallback
    ? 'I can do a simpler version offline instead — no AI call needed.'
    : 'Nothing was changed. Try again, or keep writing — I\u2019ll wait.';
  diffNote.hidden = false;
  diffPanel.hidden = false;
  setPipState('apologetic');
  setBubble(fallback ? COPY.failed : COPY.failedNoFallback);
  resetIdleTimer();
}

function hidePanelFields() {
  diffPanel.hidden = false;
  diffBody.innerHTML = '';
  noteBody.textContent = '';
  diffNote.hidden = true;
  btnAccept.hidden = true;
  btnDiscard.hidden = true;
  btnCopy.hidden = true;
  btnInsert.hidden = true;
  btnRetry.hidden = true;
  btnOffline.hidden = true;
}

function actionLabel(actionId) {
  const labels = {
    'summarize': 'Summary', 'rewrite-shorter': 'Shorter version',
    'rewrite-formal': 'Formal version', 'rewrite-friendly': 'Friendly version',
    'fix-grammar': 'Grammar fix', 'continue': 'Continuation',
    'draft': 'Draft', 'explain': 'Explanation'
  };
  return labels[actionId] || 'Suggestion';
}

function applyTextEdit(anchor, newText) {
  const text = docText();
  if (anchor.type === 'replace-all') {
    setDocText(newText);
    return true;
  }
  if (anchor.type === 'insert') {
    const offset = Math.max(0, Math.min(anchor.offset, text.length));
    setDocText(text.slice(0, offset) + newText + text.slice(offset));
    return true;
  }
  // range anchor: verify the old text is still where we expect it.
  const para = anchor;
  const current = docText();
  if (current.slice(para.start, para.end) !== para.oldText) {
    const idx = current.indexOf(para.oldText);
    if (idx === -1) return false;
    setDocText(current.slice(0, idx) + newText + current.slice(idx + para.oldText.length));
    return true;
  }
  setDocText(current.slice(0, para.start) + newText + current.slice(para.end));
  return true;
}

btnAccept.addEventListener('click', () => {
  const p = state.proposal;
  if (!p || (p.kind !== 'diff' && p.kind !== 'diff-insert')) return;
  pushUndo();
  // Range anchors need the old text so applyTextEdit can verify the span
  // is still where the proposal expects it (and recover by search if not).
  const anchor = p.anchor.type === 'range'
    ? { type: 'range', start: p.anchor.start, end: p.anchor.end, oldText: p.oldText }
    : p.anchor;
  const ok = applyTextEdit(anchor, p.newText);
  saveDoc();
  hidePanel();
  if (ok) {
    setPipState('success');
    setBubble(COPY.accepted);
  } else {
    setPipState('apologetic');
    setBubble(COPY.staleText);
  }
  setTimeout(() => { if (!state.muted) setPipState('idle'); }, 1400);
  resetIdleTimer();
});

btnDiscard.addEventListener('click', () => {
  hidePanel();
  setPipState('idle');
  setBubble(COPY.discarded);
  resetIdleTimer();
});

btnCopy.addEventListener('click', async () => {
  const p = state.proposal;
  if (!p || p.kind !== 'note') return;
  try {
    await navigator.clipboard.writeText(p.text);
    setBubble(COPY.copied);
  } catch (e) {
    setBubble('I couldn\u2019t copy it automatically — select the text above to copy it.');
  }
});

btnInsert.addEventListener('click', () => {
  const p = state.proposal;
  if (!p || p.kind !== 'note') return;
  pushUndo();
  const text = docText();
  const sep = text.trim() === '' ? '' : '\n\n';
  setDocText(text + sep + p.text);
  saveDoc();
  hidePanel();
  setPipState('success');
  setBubble(COPY.inserted);
  setTimeout(() => { if (!state.muted) setPipState('idle'); }, 1400);
  resetIdleTimer();
});

btnRetry.addEventListener('click', () => {
  const p = state.proposal;
  if (!p) return;
  hidePanel();
  runAction(p.actionId);
});

btnOffline.addEventListener('click', () => {
  const p = state.proposal;
  if (!p || !p.fallback || !p.fallback.text) return;
  if (p.actionId === 'summarize') {
    showNoteProposal({ actionId: 'summarize', text: p.fallback.text });
    diffNote.textContent = COPY.offlineUsed;
    diffNote.hidden = false;
    return;
  }
  // fix-grammar offline: show as a diff over the same target.
  if (p.target) {
    showDiffProposal({
      actionId: 'fix-grammar', kind: 'diff',
      oldText: p.target.text, newText: p.fallback.text,
      anchor: p.target.anchor
    });
    diffNote.textContent = (p.fallback.note || COPY.offlineUsed);
    diffNote.hidden = false;
  }
});

/* ------------------------------------------------------------------ */
/* Action buttons + draft row                                          */
/* ------------------------------------------------------------------ */
document.querySelectorAll('.action-btn[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const actionId = btn.getAttribute('data-action');
    if (actionId === 'draft') {
      const row = $('draftRow');
      row.hidden = !row.hidden;
      if (!row.hidden) $('draftPrompt').focus();
      return;
    }
    $('draftRow').hidden = true;
    runAction(actionId);
  });
});

$('draftGo').addEventListener('click', () => {
  const prompt = $('draftPrompt').value;
  $('draftRow').hidden = true;
  runAction('draft', { prompt });
});

$('draftPrompt').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    $('draftGo').click();
  }
});

/* ------------------------------------------------------------------ */
/* Toolbar                                                             */
/* ------------------------------------------------------------------ */
$('newBtn').addEventListener('click', () => {
  pushUndo();
  setDocText('');
  saveDoc();
  hidePanel();
  setBubble('Fresh page. What are we writing?');
  resetIdleTimer();
});

$('clearBtn').addEventListener('click', () => {
  pushUndo();
  setDocText('');
  saveDoc();
  hidePanel();
  setBubble('Cleared. Fresh start.');
  resetIdleTimer();
});

undoBtn.addEventListener('click', doUndo);

$('fontBtn').addEventListener('click', () => {
  editor.classList.toggle('large-text');
});

/* ------------------------------------------------------------------ */
/* Manners System                                                      */
/* ------------------------------------------------------------------ */
function resetIdleTimer() {
  if (state.idleTimer) clearTimeout(state.idleTimer);
  state.idleTimer = null;
  if (state.muted || state.noSuggest || state.suggestBudgetUsed || state.busy) return;
  state.idleTimer = setTimeout(maybePropose, 30000);
}

function maybePropose() {
  state.idleTimer = null;
  if (state.muted || state.noSuggest || state.suggestBudgetUsed || state.busy) return;
  const text = docText();
  if (PipLib.wordCount(text) < 40) { resetIdleTimer(); return; }

  const longest = PipLib.longestParagraph(text);
  let question, actionId, target;
  if (longest && PipLib.wordCount(longest.text) > 60) {
    // paragraphs() builds fresh objects per call, so match by offsets,
    // not by reference (indexOf would return -1).
    const paras = PipLib.paragraphs(text);
    const idx = paras.findIndex(p => p.start === longest.start && p.end === longest.end) + 1;
    question = 'Your paragraph ' + idx + ' runs a bit long — want a tighter version?';
    actionId = 'rewrite-shorter';
    target = { text: longest.text, anchor: { type: 'range', start: longest.start, end: longest.end } };
  } else if (PipLib.localGrammarFix(text)) {
    question = 'I spotted a couple of small typos — want me to fix them?';
    actionId = 'fix-grammar';
    target = { text, anchor: { type: 'replace-all' } };
  } else {
    const first = PipLib.paragraphs(text)[0];
    question = 'Want me to give the opening a once-over?';
    actionId = 'rewrite-shorter';
    target = { text: first.text, anchor: { type: 'range', start: first.start, end: first.end } };
  }

  state.suggestBudgetUsed = true;
  updateMannersLine();
  dock.classList.add('pip-gesture-point');
  setPipState('idle');
  setBubble(question, [
    { label: 'Sure', onClick: () => {
      dock.classList.remove('pip-gesture-point');
      runActionWithTarget(actionId, target);
    } },
    { label: 'Not now', quiet: true, onClick: () => {
      dock.classList.remove('pip-gesture-point');
      setBubble('No problem — I\u2019ll keep quiet.');
      setPipState('idle');
    } },
    { label: 'Don\u2019t suggest again', quiet: true, onClick: () => {
      dock.classList.remove('pip-gesture-point');
      state.noSuggest = true;
      try { localStorage.setItem(LS.noSuggest, 'true'); } catch (e) { /* ignore */ }
      updateMannersLine();
      setBubble('Got it. I\u2019ll only speak when you ask.');
      setPipState('idle');
    } }
  ]);
}

/* Run an action against a pre-resolved target (used by the proactive
   suggestion). Mirrors runAction but skips target resolution. */
async function runActionWithTarget(actionId, target) {
  if (state.busy) return;
  state.busy = true;
  setActionButtonsDisabled(true);
  setPipState('thinking');
  setBubble(COPY.thinking[actionId] || 'On it — working…');
  const res = await callLLM(PROMPTS[actionId](PipLib.truncate(target.text, 2000)));
  state.busy = false;
  setActionButtonsDisabled(false);
  if (res.ok) {
    showDiffProposal({
      actionId, kind: 'diff',
      oldText: target.text, newText: res.text,
      anchor: target.anchor
    });
    return;
  }
  let fallback = null;
  if (actionId === 'fix-grammar') {
    const fixed = PipLib.localGrammarFix(target.text);
    if (fixed) fallback = { text: fixed.text, note: 'Offline fix: ' + fixed.fixes + ' small correction' + (fixed.fixes > 1 ? 's' : '') + '.' };
  }
  showFailure(actionId, fallback, target);
}

/* ------------------------------------------------------------------ */
/* Mute — persists; muted Pip hides behind the page edge.             */
/* ------------------------------------------------------------------ */
function applyMute() {
  muteBtn.setAttribute('aria-pressed', String(state.muted));
  muteBtn.textContent = state.muted ? 'Wake Pip' : 'Shh, Pip';
  if (state.muted) {
    setPipState('hidden');
    if (state.idleTimer) clearTimeout(state.idleTimer);
    state.idleTimer = null;
  } else {
    setPipState('idle');
    setBubble(COPY.backFromMute);
    resetIdleTimer();
  }
  updateMannersLine();
}

muteBtn.addEventListener('click', () => {
  state.muted = !state.muted;
  try { localStorage.setItem(LS.muted, String(state.muted)); } catch (e) { /* ignore */ }
  applyMute();
});

/* Clicking the hidden wire tip wakes Pip back up. */
dock.addEventListener('click', e => {
  if (!state.muted) return;
  if (e.target.closest('.pip-bubble')) return;
  state.muted = false;
  try { localStorage.setItem(LS.muted, 'false'); } catch (e2) { /* ignore */ }
  applyMute();
});

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */
(function init() {
  const saved = localStorage.getItem(LS.doc);
  if (saved !== null && saved !== '') {
    setDocText(saved);
  } else {
    setDocText(STARTER_DOC);
    try { localStorage.setItem(LS.doc, STARTER_DOC); } catch (e) { /* ignore */ }
  }
  undoBtn.disabled = state.undoText === null;
  updateWordCount();
  updateMannersLine();
  if (state.muted) {
    applyMute();
  } else {
    setPipState('idle');
    setBubble(COPY.greeting);
    resetIdleTimer();
  }
})();
