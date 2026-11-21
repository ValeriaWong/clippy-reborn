# Clippy Reborn — Exploration Report

**Project:** Clippy Reborn (Kiroween 2026, Resurrection category)
**Character:** Pip — an original paperclip assistant. Pitch line: "Clippy went to therapy, changed his name to Pip, and learned manners."
**Status:** Built 2026-11-21 (local MVP — editor, all 8 actions, diff/accept, Manners System, Pip SVG + preview). Not yet pushed to GitHub (repo creation blocked on GitHub App permissions; local only) and not yet deployed.
**Starter document:** a cover letter (chosen for the demo — the parent's default; change the `STARTER_DOC` in `app.js` to swap genre).

## Running it locally

```sh
cd ~/workspace/kiroween-clippy
python3 -m http.server 8080   # then open http://localhost:8080/
node scripts/smoke-test.mjs   # offline checks + live Pollinations probes
```

## Recommendation: BUILD

Clippy is the stronger of the two candidates, for five reasons:

1. **Best demo narrative.** The joke lands in 5 seconds ("It looks like you're writing a letter…"), the redemption arc lands in the next 30, and real utility (edits you can accept or discard) fills the remaining 2 minutes of the demo video.
2. **Judge-friendly form.** A web app with a public URL and zero install beats the desktop revivals (Rieseberg's Electron app needs a download; ClippyGPT is a physical robot).
3. **A genuine product idea, not just a joke.** The Manners System — an assistant that knows when to shut up — is the product. No revival has done this.
4. **The stack is proven.** The sibling Reader project (built 2026-11-21) already verified the vanilla HTML/CSS/JS stack, the keyless Pollinations text API, and the GitHub Pages deploy path. Patterns transfer; code stays new.
5. **It fits the clock.** Refined estimate 7–9 days against ~12 days left after the Reader deploys. About 3 days of buffer if started promptly.

Condition: start within ~2 days of the Reader deploy. If the character is not charming by day 3 of the build, cut animation scope — never cut the editor.

## What Clippy was, and why people hated it

- **Origin:** Microsoft Bob (1995), built on Stanford social science (Nass & Reeves: people treat computers as social actors). Bob flopped; its animated assistants survived into Office 97 (1996). Of ~250 characters designed, Clippit — drawn by Kevan Atteberry — won focus groups as the "most trustful and engaging" and became the default.
- **Life:** Office 97 (1996) → disabled by default in Office XP → absent from Office 2003 → removed entirely in Office 2007. Time named it one of the 50 worst inventions of all time. Its own creator was embarrassed by it and omits it from his portfolio.
- **Why hated (the design failures our product must invert):**
  1. Unsolicited interruptions — popped up the moment you typed "Dear".
  2. Never learned — as users got proficient, it interrupted the same way, forever.
  3. "Leering" eyes — focus groups found them unsettling; it felt like surveillance.
  4. Suggested but never did anything — the original sin. All talk, no action.
  5. Hard to turn off — Office 97 users had to rename the "Actors" folder to "NoActors".
  6. Condescending, infantilizing tone (the Bob heritage).
  7. Functionality too basic and repetitive to justify any of the above.

## Prior art (and how we differentiate)

- **Felix Rieseberg, "Clippy" Desktop Assistant (May 2025).** Electron desktop app, original Clippy art/animations, local LLMs via llama.cpp (Gemma3-1B auto-download; also Llama 3.2, Phi-4, Qwen3), Win/Mac/Linux, Windows 98-styled chat. Nostalgia-first; the author says it "isn't trying to be your best chatbot." Covered by Tom's Hardware, XDA, How-To Geek. Ours differs: web (no install), usefulness-first, no local model download.
- **ClippyGPT, David Packman (~2022).** Raspberry Pi physical robot + ChatGPT + Azure speech, wiggling eyebrows. A hardware art piece, not a product.
- **"Clippy Reloaded", Kevin Soto, Kiroween 2025 (dev.to).** The closest prior art — and a Kiroween entry. Desktop agentic assistant built with Kiro: spec-driven, steering docs for personality, three MCP servers (filesystem, terminal, browser), "do things, don't just suggest them", self-deprecating humor, animation switches to "apologetic". Placement at Kiroween 2025 not confirmed. Ours differs: web app (not desktop), powers scoped to the document only (no filesystem/terminal — safer, more focused), the Manners System as the core idea, original character (Pip). All code new; the 2025 project is ineligible under the 2026 rules and must not be reused or copied.
- **Microsoft's own revivals (2019, 2021).** 2019 employee sticker pack on GitHub — pulled after a day. 2021: Twitter/Instagram like-gate, Clippy became the paperclip emoji in the Windows 11 Fluent refresh, Teams sticker pack (30+ animated stickers, Oct 28, 2021). All cosmetic. Microsoft never brought back the assistant function. Microsoft re-filed the Clippy trademark in June 2021.

Implication: "Clippy + AI" is not a novel idea. The execution must carry it. The demo leads with the Manners System and real edits; the mascot comes second.

## The product: Pip, the paperclip who learned manners

A web app: a built-in writing editor with an AI assistant that actually edits your text — and knows when to shut up.

**Core loop:** write in the editor → ask Pip for help (or accept one budgeted proactive suggestion) → Pip proposes an edit as a visible diff → you Accept or Discard. Pip never applies an edit silently.

**Actions (MVP):** Summarize, Rewrite (shorter / formal / friendly), Fix grammar, Continue writing, Draft from prompt, Explain selection.

**The Manners System (the differentiator):**
1. Never interrupts typing — waits for 30 seconds idle.
2. One proactive suggestion per session, maximum — and only a suggestion, never an action.
3. A real mute button ("Shh, Pip") that persists; when muted, Pip hides behind the page edge (only a wire tip visible) and never speaks.
4. "Ask first" is the default mode; "let Pip take initiative" is opt-in.
5. Self-aware copy: "I know. I used to pop up uninvited. I've been in therapy since 2007."

**The character (original — never Microsoft's art):** Pip is a bent-wire paperclip drawn from scratch as inline SVG: brushed-steel body with a warm copper accent stripe, two dot eyes that look at the document (not the user — fixing the "leering eyes" complaint), a small smile that appears only on a successful edit, wire limbs that fold/unfold for gestures (pointing at a sentence, thumbs-up, hiding behind the page when muted). Animations are CSS/SVG only: idle bob, typing bounce, thinking wiggle, apologetic slump, celebration flip, "shh" hide. All respect `prefers-reduced-motion`. Pip never moves on his own initiative except for the single budgeted proactive suggestion.

**Free-only:** keyless Pollinations text API (verified live by the sibling Reader project, 2026-11-21), graceful fallback to local template responses when the API fails; optional runtime user-supplied key as a stretch (never persisted server-side, never recorded). Free hosting on GitHub Pages. No login, no backend, docs in localStorage only.

**Demo story (<3 min video):** 0:00 nostalgia hook ("It looks like you're writing a letter…") → 0:20 the apology and the manners → 0:40 real edits with Accept/Discard → 1:30 the one proactive suggestion, done right → 2:00 mute and settings → 2:30 "Pip has learned."

## Refined estimate: 7–9 days (was 7–10)

| Phase | Days | Notes |
|---|---|---|
| Scaffold + Kiro setup | 0.5 | Patterns proven by Reader (vanilla stack, Pollinations, Pages) |
| Character (original SVG Pip + animations) | 1.5–2 | The swing factor; needs Allen's eyeball check early |
| Editor + actions + diff/accept | 2–2.5 | The core |
| Manners system + proactive engine | 1 | Idle detection, suggestion budget, mute |
| LLM integration | 0.5–1 | Pollinations pattern already proven by Reader |
| Deploy + debug | 1 | GitHub Pages |
| Video + submission | 1 | <3 min YouTube demo + Devpost form |
| **Total** | **7–9** | |

Clock: ~13 days left at exploration time (Nov 21); Reader deploy ~0.5 day once unblocked; Clippy starting ~Nov 22–23 leaves ~12 days, so ~3 days of buffer. If the character drags, cut animations to 3 core states (idle, thinking, success) and keep the editor.

## Top 3 risks

1. **Character quality.** A creepy or ugly Pip kills the demo — the pitch rides on charm. Mitigate: Allen eyeball-checks the SVG early; keep animations simple; respect reduced-motion.
2. **Pollinations stability / rate limits during judging.** Mitigate: cached fallback responses, a pre-recorded demo path, graceful-degradation copy.
3. **"Another Clippy" fatigue.** Judges may have seen the 2025 entry and Rieseberg's app. Mitigate: lead the demo with the Manners System and real edits, mascot second; the pitch is "the assistant that learned manners," not "look, Clippy."

## Compliance notes (Kiroween 2026)

- All code new, built inside the submission period (Oct 30 – Dec 4, 2026). The 2025 Clippy Reloaded project is ineligible and must not be reused or copied.
- Genuine `/.kiro` (specs, steering, hooks) at repo root, never gitignored — this exploration lays the skeleton; the build follows it.
- Public GitHub repo + MIT license + working app URL + <3 min public YouTube demo + Devpost form.
- Category: Resurrection.
- Trademark flag: Microsoft re-filed the Clippy trademark (June 2021). Using "Clippy" in the hackathon pitch title is nominative homage for a non-commercial entry; the in-app character (Pip) is original and uses no Microsoft art. Low risk for a hackathon demo; do not commercialize under that name.

## Files in this folder

- `research.md` — research notes with sources.
- `.kiro/specs/clippy-reborn/requirements.md` — EARS-style requirements.
- `.kiro/specs/clippy-reborn/design.md` — architecture and design.
- `.kiro/specs/clippy-reborn/tasks.md` — draft build plan (not implementation).
- `.kiro/steering/product.md` — vision, voice, manners.
- `.kiro/steering/tech.md` — stack and free-only rules.
- `.kiro/steering/structure.md` — file layout and conventions.
