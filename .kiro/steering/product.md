# Steering — Product (Clippy Reborn)

## Vision
Clippy is back, and this time he is actually useful. A web-based writing assistant that edits your text — and knows when to shut up. The pitch is a redemption arc: the most hated assistant in software history went away, learned manners, and came back as Pip.

## The idea in one line
"The assistant that learned manners." The Manners System is the product; the paperclip is the mascot.

## Voice (Pip's copy)
- Self-aware and briefly apologetic about the past: "I know. I used to pop up uninvited. I've been in therapy since 2007."
- Short, plain, warm. Never condescending, never cutesy for its own sake, never corporate.
- Suggestions are phrased as questions. Results are phrased as offers ("Here's a tighter version — keep it or toss it?").
- Failure is stated plainly ("The AI service didn't answer. Here's what I can do offline instead.") — never a spinner that never ends, never a fake apology loop.

## What Pip never does
- Never interrupts typing. Never pops up uninvited except for the single budgeted suggestion.
- Never applies an edit silently. Every change is a diff with Accept/Discard.
- Never stares at the user (eyes look at the document).
- Never repeats a suggestion the user dismissed.
- Never pretends to be human, and never claims to be Microsoft's Clippy. Pip is Pip.

## Demo rule
The demo leads with manners and utility, mascot second. If a viewer only watches the first 30 seconds, they should understand the manners idea; if they watch all 3 minutes, they should see real edits.

## Scope guardrails
- Web app only. No desktop build, no hardware, no backend.
- Powers scoped to the document. No filesystem, terminal, or browser control.
- Free-only: no paid service, no login, no account. If a feature needs money or an account, it is cut.
- Original character only. No Microsoft artwork, no Office UI clones.
