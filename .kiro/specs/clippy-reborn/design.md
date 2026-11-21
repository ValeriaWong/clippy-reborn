# Design — Clippy Reborn

## Overview

A static single-page web app. Vanilla HTML/CSS/JS, zero dependencies, zero build step — the same stack the sibling Reader Reborn project verified end-to-end (2026-11-21). No backend, no login, no database. Documents live in localStorage. The AI layer is the keyless Pollinations text API, with a local fallback when it fails.

## Architecture

```
index.html          App shell: editor pane, Pip dock, speech bubble, toolbar, manners panel
styles.css          Layout, editor styling, Pip animation states, reduced-motion rules
app.js              Editor state, action dispatch, diff/accept flow, manners engine
lib.js              Small pure helpers: debounce, excerpt, diff rendering, relative time
pip.svg (inline)    Original Pip character as inline SVG inside index.html (no separate asset)
data/               (runtime only) cached suggestions; never shipped with secrets
```

No framework, no bundler, no server code. GitHub Pages serves the static files. A GitHub Actions workflow is out of scope for the MVP (no daily job needed; the Reader's digest workflow is not reused — different product).

## Components

### 1. Editor
- `contenteditable` region with a plain-text fallback path. Toolbar: New, Clear, word count (live), font-size toggle (stretch).
- Autosave to localStorage (debounced 500 ms). On load, restores the last document or a starter document ("It looks like you're writing a letter…" — the nostalgia hook, pre-filled as an editable demo text the user can clear in one tap).
- Selection handling: `window.getSelection()`; actions operate on the selection when present, otherwise on the whole document (for Summarize/Draft) or the paragraph at the cursor (for Continue).

### 2. Action engine
- One function per action; each builds a prompt from a fixed template + the user's text. Prompts are short, task-scoped, and never include document content beyond the selection/paragraph (privacy by minimization).
- Request path: `fetch` to the Pollinations text endpoint (GET with the prompt as a query parameter — same pattern the Reader verified live). Timeout 30 s. On failure: show the failure note and offer the local fallback (extractive excerpt for Summarize; rule-based grammar hints for Fix grammar; a "try again" for the rest).
- Result path: the response renders as a diff view (removed text struck through, added text highlighted) with Accept / Discard. Accept applies the edit, pushes the previous state to a local undo stack (undo = one step back, stretch: full history). Discard leaves the document untouched.

### 3. Pip (character)
- Inline SVG, drawn from scratch: a bent-wire paperclip, brushed-steel body, warm copper accent stripe, two dot eyes, wire limbs. No Microsoft art, no raster images.
- States (CSS classes on the SVG root): `idle` (gentle bob), `thinking` (wiggle), `success` (celebration flip + smile), `apologetic` (slump), `hidden` (slides behind the page edge, wire tip visible). State changes are driven by the action engine and the manners engine, never by timers.
- `prefers-reduced-motion`: all animation disabled; state changes are instant.
- Speech bubble: a single element next to Pip showing status text (thinking / suggestion / result / apology). Bubble copy follows the steering voice (self-aware, brief, never condescending).

### 4. Manners engine
- Idle detection: `input`/`keydown` events reset a 30 s timer. When the timer fires and the suggestion budget (1/session) is unspent and mute is off, the engine may surface one proactive suggestion — phrased as a question, with Accept ("Sure") / Dismiss ("Not now") / "Don't suggest again" controls. After the budget is spent, Pip never suggests proactively again that session.
- Mute: a "Shh, Pip" button; state persists in localStorage (`pip-muted`). While muted, Pip is `hidden` and the proactive engine is disabled; user-invoked actions still work.
- Mode: default "ask first". Stretch: opt-in "let Pip take initiative" (budget rises to 3/session, still never during typing).

### 5. LLM layer
- `callLLM(prompt)`: single wrapper. Primary: Pollinations keyless text API. No API key anywhere in code, files, or chat. Stretch: optional runtime user-supplied key for an alternate provider, entered in the UI, kept in memory only (never localStorage, never sent anywhere except that provider).
- Safety: prompts are capped in length (selection truncated to ~2,000 chars); responses capped (~1,500 chars). No document content is logged.

## Data model (localStorage)

| Key | Contents |
|---|---|
| `pip-doc` | Current document HTML/text |
| `pip-muted` | `true`/`false` |
| `pip-suggest-budget-used` | `true` once the session suggestion is spent (session-scoped; reset per load) |
| `pip-undo` | Last document state (one-step undo) |

No other persistence. No cookies, no analytics.

## Error handling

- LLM failure/timeout: inline failure note in the bubble + local fallback offer. Never a blank bubble, never a spinner that never ends.
- Empty document + action: bubble explains the action needs text ("Give me something to work with first.").
- Pollinations rate limit (429): bubble says so plainly and offers the local fallback; the demo path uses pre-written sample text so the video never depends on a live call.

## Demo story (drives the build order)

0:00 nostalgia hook (starter letter, "It looks like you're writing a letter…") → 0:20 apology + manners → 0:40 real edits with Accept/Discard → 1:30 the one proactive suggestion, done right → 2:00 mute + settings → 2:30 "Pip has learned." Build order follows this story: editor + one action first, then the rest.

## Open decisions (for the build phase, not this exploration)

- Exact Pollinations model/parameters (use the Reader's verified call shape as the starting point).
- Whether the starter document is a letter, a cover letter, or an essay (pick the one that demos best; Allen decides).
- Stretch scope: undo history depth, font-size toggle, "initiative" mode, BYOK.
