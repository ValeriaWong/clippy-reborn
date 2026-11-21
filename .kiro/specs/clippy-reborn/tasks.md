# Tasks — Clippy Reborn (draft build plan)

Draft plan only — no implementation in this exploration. Estimated 7–9 days total. Order follows the demo story: editor + one action first, character early (it is the swing factor), manners before polish.

## Phase 0 — Scaffold (0.5 day)
- [ ] Create public repo `clippy-reborn` under ValeriaWong (empty; MIT LICENSE at top; `.gitignore` that does NOT ignore `.kiro`)
- [ ] Scaffold `index.html`, `styles.css`, `app.js`, `lib.js`; local HTTP serve smoke check
- [ ] Copy this spec skeleton into the repo's `.kiro/` (requirements, design, tasks, steering)

## Phase 1 — Editor + first action (1.5 days)
- [ ] Editor: contenteditable surface, autosave to localStorage, New/Clear, live word count
- [ ] Starter document: the nostalgia-hook letter, one-tap clearable
- [ ] Action engine: prompt templates, `callLLM` wrapper (Pollinations keyless), 30 s timeout, failure note + local fallback
- [ ] First action end-to-end: Fix grammar with diff view + Accept/Discard + one-step undo
- [ ] Smoke test: offline editing works; action works live; failure path shows the fallback offer

## Phase 2 — Pip, the character (1.5–2 days; swing factor)
- [ ] Original Pip SVG (inline): bent-wire paperclip, brushed steel + copper accent, dot eyes, wire limbs
- [ ] Animation states: idle, thinking, success, apologetic, hidden (CSS/SVG only; `prefers-reduced-motion` respected)
- [ ] Speech bubble with status text; bubble copy per steering voice
- [ ] **Allen eyeball check on the SVG before proceeding** — if Pip is not charming, simplify (fewer limbs, fewer states) rather than polishing longer
- [ ] Fallback if the character drags: cut to 3 core states (idle, thinking, success), keep the editor

## Phase 3 — All actions (1–1.5 days)
- [ ] Summarize, Rewrite (shorter / formal / friendly), Continue writing, Draft from prompt, Explain selection
- [ ] Selection handling: selection → action; no selection → whole document or paragraph at cursor (per action)
- [ ] Prompt/length caps (selection ~2,000 chars, response ~1,500 chars); privacy by minimization (send only the selection/paragraph)

## Phase 4 — Manners System (1 day)
- [ ] Idle detection (30 s), one-suggestion-per-session budget, suggestion phrased as a question with Accept/Dismiss/"Don't suggest again"
- [ ] Mute ("Shh, Pip"), persisted in localStorage; muted Pip hides behind the page edge
- [ ] Default "ask first" mode; stretch: opt-in initiative mode (budget 3/session)
- [ ] Self-aware bubble copy (apology lines, never condescending)

## Phase 5 — Hardening + deploy (1 day)
- [ ] Offline-first check: editor renders with no network; LLM failure paths all covered
- [ ] Secret scan (no keys anywhere), HTML/JS id cross-check, reduced-motion check, mobile-width check
- [ ] Push to GitHub; enable GitHub Pages; verify the live URL in a clean browser
- [ ] Pre-written sample text so the demo never depends on a live LLM call

## Phase 6 — Video + submission (1 day)
- [ ] <3 min demo video (public YouTube) following the demo story in design.md
- [ ] Devpost submission form: category Resurrection, repo URL, app URL, video URL, Kiro write-up (specs, steering, hooks)
- [ ] Final compliance pass: all code new, `.kiro` at root and not gitignored, MIT LICENSE detectable

## Explicitly out of scope for the MVP
- Filesystem/terminal/browser powers (unlike the 2025 Clippy Reloaded entry — powers stay scoped to the document)
- Accounts, backends, analytics, collaboration
- BYOK (stretch only), undo history beyond one step (stretch), font-size toggle (stretch)
