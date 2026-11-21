# Clippy Reborn — Research Notes

Researched 2026-11-21. Sources are public web pages; URLs below are verbatim from search results.

## 1. What Clippy was

- **Clippit ("Clippy")**, the Office Assistant: an animated paperclip designed by illustrator Kevan Atteberry. One of ~250 characters designed for Microsoft Bob; focus groups rated Clippy the "number one most trustful and engaging and endearing character of them all," so it became the default. Other shipped assistants included Scribble the cat, The Dot, Hoverbot, The Genius, and Power Pup.
- **Lineage:** Microsoft Bob (1995, launched by Bill Gates), built on Stanford social science by Clifford Nass and Byron Reeves — the theory that people unconsciously respond to computers as if they were human. Bob tanked (Time: one of the 50 worst inventions of all time; Comic Sans was created for Bob) and was discontinued by 1996, but the assistants were ported into Office 97 (1996).
- **Life and death:** Office 97 (1996) → disabled by default in Office XP → not installed in Office 2003 → removed entirely in Office 2007. Its own creator was embarrassed by it and omits it from his portfolio. Microsoft executive Steven Sinofsky wrote the assistant was codenamed "TFC" during development ("The 'C' stood for clown").
- **The trigger:** typing "Dear" at the start of a letter made Clippy pop up with an unsolicited offer to help. Users' first reaction was often amusement; the hatred came from repetition.

Sources:
- https://www.artsy.net/article/artsy-editorial-life-death-microsoft-clippy-paper-clip-loved-hate
- https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/
- https://www.mentalfloss.com/technology/computers/tragic-life-clippy-worlds-most-hated-virtual-assistant
- https://www.theregister.com/offbeat/2023/06/12/clippy-creator-was-so-embarrassed-after-its-office-arrival/1349754

## 2. Why users hated it

- **Unsolicited interruption.** It appeared uninvited, mid-task, and repeated itself.
- **Never learned.** As users grew proficient, Clippy kept interrupting the same way. No adaptation to skill level.
- **"Leering" eyes.** Focus groups flagged the roving eyes as unsettling; it felt like surveillance — a voyeur into home computer use.
- **Suggested but never did anything.** The core functional failure: it offered help but could not execute. (A 2025 dev.to retrospective calls this "the original sin: Clippy suggested things but never actually did anything.")
- **Hard to turn off.** Office 97 users had to rename the "Actors" program folder to "NoActors" to silence it. No real mute existed.
- **Condescending tone.** The Bob heritage: software that infantilized new users.
- **Too basic.** Functionality never justified the intrusion.

## 3. Microsoft's own revivals (cosmetic only)

- **2019:** an employee-made Clippy sticker pack appeared on Microsoft's official Office developer GitHub page; pulled after one day. Microsoft: "no plans to bring Clippy to Teams."
- **2021:** Microsoft ran a Twitter/Instagram like-gate (20k likes → replace the paperclip emoji in Microsoft 365 with Clippy), then revealed it had already decided. Clippy became the paperclip emoji in the Windows 11 Fluent emoji refresh (1,800 emojis). Teams sticker pack launched Oct 28, 2021 (30+ animated stickers). Microsoft re-filed the Clippy trademark in June 2021.
- **Net:** Microsoft revived Clippy as decoration (emoji, stickers, wallpaper) and never as a functional assistant again.

Sources:
- https://www.theregister.com/software/2021/07/15/microsoft-solicits-clippy-comeback-later-reveals-it-had-already-decided-to-bring-back-the-peppy-paperclip/1190807
- https://comicbook.com/irl/news/clippy-returns-microsoft-emoji-release-date/
- https://www.digitaltrends.com/computing/microsoft-clippy-emoji-windows-11-preview/
- https://www.windowscentral.com/clippy-returns-microsoft-teams-vengeance-epic-sticker-pack
- https://www.pcworld.com/article/548995/clippys-back-to-troll-your-friends-on-teams.html
- https://windowsreport.com/microsoft-teams-clippy-sticker-pack/
- https://www.themarysue.com/clippy-emoji-microsoft-365/

## 4. Third-party revivals (the competitive landscape)

### Felix Rieseberg — "Clippy" Desktop Assistant (May 2025)
- Electron desktop app (Windows, Mac, Linux) with the original Clippy art and animations and a Windows 98-styled chat/settings window. Local LLMs via llama.cpp / node-llama-cpp; auto-downloads Google Gemma3-1B on install; one-click setup for Llama 3.2, Phi-4, Qwen3. A lengthy system prompt makes the model imitate the original Clippy tone. Author calls it "a love letter" to Clippy and 90s aesthetics and says "this project isn't trying to be your best chatbot." Covered by Tom's Hardware, XDA Developers, How-To Geek.
- Our differentiation: web app (no install, judge-friendly URL), usefulness-first, no local model download.

Sources:
- https://www.tomshardware.com/tech-industry/artificial-intelligence/clippy-resurrected-as-ai-assistant-project-turns-infamous-microsoft-mascot-into-llm-interface
- https://www.xda-developers.com/dreaded-windows-clippy-assistant-llm-to-him/
- https://www.howtogeek.com/microsoft-clippy-someone-brought-back-with-ai/
- https://www.high-tech-mag.com/clippy-returns-the-nostalgic-paperclip-meets-modern-ai/

### David Packman — ClippyGPT (~2022)
- Raspberry Pi 3 robot + ChatGPT + Azure speech (free tier), 3D-printed case with a 5-inch display, wiggling-eyebrow animatronics. A physical art/robotics piece, not a product.

Source:
- https://magazine.raspberrypi.com/articles/clippygpt?mc_cid=f243d9c7c5

### Kevin Soto — "Clippy Reloaded", Kiroween 2025 (dev.to)
- The closest prior art, and a Kiroween entry. A desktop agentic assistant built with Kiro: spec-driven development, steering docs for Clippy's personality (self-deprecating humor), three MCP servers (filesystem, terminal, browser) giving it real capabilities, window/process monitoring, animation switching to "apologetic". Thesis: "do things, don't just suggest them." The article says "Built with Kiro for Kiroween 2025."
- Placement at Kiroween 2025: **not confirmed** (a follow-up search of the Kiroween 2025 recap found no winner list naming it; the recap names "Clippy 2.0" only as a generic Resurrection example).
- Our differentiation: web app (not desktop), powers scoped to the document only (no filesystem/terminal — safer and more focused), the Manners System as the core idea, original character (Pip). All code new; the 2025 project is ineligible under the 2026 rules and must not be reused or copied.

Source:
- https://dev.to/kevin_soto_2d5c72bb78c86d/i-resurrected-microsofts-most-hated-mascot-heres-what-happened-46nb
- https://dev.to/ignaciah/code-in-the-dark-459j (Kiroween 2025 recap; no placement confirmation)

### Also noted
- A physical "REBUILT Clippy" hackathon robot (Raspberry Pi, OLED eyes, servos, 3D-printed paperclip frame) exhibited at a hackathon, Instagram Oct 2026. Hardware, not a web app.

Source:
- https://www.instagram.com/reel/DeJu2r8SxuS/

## 5. What this means for our entry

- "Clippy + AI" is not a novel idea. The execution must carry it: web form factor, the Manners System, and real in-document edits (Accept/Discard diffs).
- The demo must lead with manners and utility, mascot second.
- The character must be original (Pip) — never Microsoft's artwork — and the pitch title "Clippy Reborn" is nominative homage for a non-commercial hackathon entry (trademark re-filed by Microsoft June 2021; do not commercialize under that name).
- Free-LLM route: keyless Pollinations text API, verified live by the sibling Reader Reborn project on 2026-11-21.
