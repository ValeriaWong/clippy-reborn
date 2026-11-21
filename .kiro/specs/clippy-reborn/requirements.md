# Requirements — Clippy Reborn (Kiroween 2026, Resurrection)

Project: a web app that revives Microsoft's Clippy as an AI office assistant that actually works — and has learned manners. Character: **Pip**, an original paperclip (never Microsoft's artwork). All code new, built inside the submission period (Oct 30 – Dec 4, 2026).

## Glossary

- **Pip:** the assistant character (original SVG paperclip). The pitch title is "Clippy Reborn"; the in-app character is Pip.
- **Editor:** the built-in writing surface (contenteditable with plain-text fallback).
- **Action:** an AI operation on the document or a selection (summarize, rewrite, fix grammar, continue, draft, explain).
- **Diff:** a proposed edit shown with changes highlighted; the user Accepts or Discards it. Nothing is applied silently.
- **Manners System:** the rules that govern when Pip may speak unprompted (idle time, one suggestion per session, persistent mute).
- **Suggestion budget:** at most one proactive suggestion per session.

## Functional requirements

### Editor
- REQ-1: WHEN the user opens the app, THE SYSTEM SHALL present a writing editor with a document that persists in localStorage across reloads.
- REQ-2: WHEN the user types, THE SYSTEM SHALL save the document to localStorage (debounced, no server).
- REQ-3: THE SYSTEM SHALL provide New, Clear, and word-count controls for the document.
- REQ-4: THE SYSTEM SHALL work fully offline for editing (no network needed to type, save, or reload a document).

### AI actions
- REQ-5: WHEN the user selects text and invokes an action, THE SYSTEM SHALL send the selection (plus minimal context) to the free LLM and display the result as a diff with Accept and Discard buttons.
- REQ-6: WHEN the user accepts a diff, THE SYSTEM SHALL apply the edit to the document and record it in local history; WHEN the user discards, THE SYSTEM SHALL leave the document unchanged.
- REQ-7: THE SYSTEM SHALL offer these actions: Summarize, Rewrite (shorter / formal / friendly), Fix grammar, Continue writing, Draft from prompt, Explain selection.
- REQ-8: WHEN the LLM request fails or times out, THE SYSTEM SHALL show a plain-language failure note and offer a local fallback (excerpt/template response) instead of failing silently or hanging.
- REQ-9: THE SYSTEM SHALL NOT send the document to any service other than the configured free LLM endpoint, and SHALL NOT store any API key anywhere (keyless Pollinations; optional runtime user-supplied key is a stretch goal, never persisted server-side).

### Pip (character)
- REQ-10: THE SYSTEM SHALL render Pip as original inline SVG (drawn from scratch; no Microsoft artwork, no raster images of Clippy).
- REQ-11: Pip SHALL have animation states: idle, thinking, success, apologetic, hidden (muted). Animations SHALL be CSS/SVG only and SHALL respect `prefers-reduced-motion`.
- REQ-12: Pip's eyes SHALL look at the document, not at the user (the historical "leering eyes" complaint is explicitly out of scope as a design).
- REQ-13: Pip SHALL speak through a speech bubble next to the character; the bubble SHALL show status (thinking / suggestion / result / apology) distinctly.

### Manners System
- REQ-14: Pip SHALL NOT interrupt while the user is typing; a proactive suggestion is only eligible after 30 seconds of idle time.
- REQ-15: THE SYSTEM SHALL allow at most one proactive suggestion per session (the suggestion budget); the suggestion SHALL be phrased as a question, never as an action taken.
- REQ-16: THE SYSTEM SHALL provide a mute control ("Shh, Pip") that persists in localStorage; WHEN muted, Pip SHALL hide behind the page edge (only a wire tip visible) and SHALL NOT speak proactively.
- REQ-17: "Ask first" SHALL be the default mode; an opt-in "let Pip take initiative" mode MAY be offered as a stretch goal.
- REQ-18: Pip's copy SHALL acknowledge the past with self-deprecating humor (e.g. "I know. I used to pop up uninvited. I've been in therapy since 2007.") and SHALL never use the original's condescending tone.

### Sharing, deploy, submission
- REQ-19: THE SYSTEM SHALL be a static web app (vanilla HTML/CSS/JS, zero build step, zero dependencies) deployable on GitHub Pages.
- REQ-20: The repository SHALL be public on GitHub under ValeriaWong, SHALL contain an MIT LICENSE at the top, and SHALL contain `/.kiro` at the root that is NOT gitignored.
- REQ-21: THE SYSTEM SHALL NOT require any login, account, or payment to use.

## Non-functional requirements

- NFR-1: First paint of the editor SHALL NOT depend on any network request (app shell renders offline; LLM calls are lazy).
- NFR-2: All document data SHALL stay client-side (localStorage only); no backend, no analytics, no tracking.
- NFR-3: The app SHALL be usable on desktop and mobile widths; the editor SHALL remain the primary surface on small screens (Pip docks to a corner).
- NFR-4: No copyrighted assets: no Microsoft Clippy artwork, no Office UI clones, no third-party images. All visuals are original SVG/CSS.
- NFR-5: All code SHALL be newly written for this hackathon (submission period Oct 30 – Dec 4, 2026). Frameworks/libraries/starter templates are allowed; any pre-existing code SHALL be disclosed in the README.
