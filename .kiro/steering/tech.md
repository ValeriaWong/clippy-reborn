# Steering — Tech (Clippy Reborn)

## Stack
- Vanilla HTML/CSS/JS. Zero dependencies, zero build step, zero framework. Same stack the sibling Reader Reborn project verified end-to-end (2026-11-21).
- Static hosting on GitHub Pages. No server code, no database, no backend of any kind.
- Client-side storage only: localStorage. No cookies, no analytics, no tracking.

## Free LLM
- Primary: keyless Pollinations text API (GET with prompt as query parameter — the call shape the Reader project verified live on 2026-11-21).
- Timeout 30 s. On failure: plain-language note + local fallback offer. Never hang, never fail silently.
- No API key anywhere: not in code, not in files, not in chat, not in memory. Optional runtime user-supplied key is a stretch goal only, entered in the UI, kept in memory only, never persisted.
- Prompt/response caps: selection truncated to ~2,000 chars, response capped at ~1,500 chars. Send only the selection/paragraph — never the whole document when a selection will do.

## Character
- Original inline SVG, drawn from scratch. No raster images, no Microsoft artwork, no third-party images.
- Animations are CSS/SVG only. All animation respects `prefers-reduced-motion` (disabled when the user prefers it).
- States: idle, thinking, success, apologetic, hidden. State changes are driven by the action engine and the manners engine, never by timers.

## Quality bars
- Editor renders with no network (app shell is offline-first; LLM calls are lazy).
- Every user-visible failure has a message and a next step.
- Secret scan clean before every push. HTML/JS id cross-check before every push.
- Mobile width: editor stays primary; Pip docks to a corner.

## Compliance (Kiroween 2026)
- All code newly written inside the submission period (Oct 30 – Dec 4, 2026).
- Public GitHub repo, MIT LICENSE at the top, `/.kiro` at the root and NOT gitignored.
- The 2025 Clippy Reloaded project is ineligible and must not be reused or copied — ideas are studied, code is not.
