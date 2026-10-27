---
name: stickman-story-reels
description: Write viral short-form story scripts and turn them into animated stick-figure vertical reels (1080×1920 MP4 for Instagram Reels, TikTok and YouTube Shorts) with ElevenLabs voiceover, word-timed captions, synthesized sound design, an on-screen clock and a "comment your vote" ending. Use this whenever someone wants a stickman or stick-figure animation, an animated story reel or short, a choose-what-happens-next or interactive voting series, a horror, thriller, survival or drama micro-story for social media, script options optimized for watch time (AVD, retention, hooks), or the next part of a voted series, even if they only give a one-line premise like "a boy alone in a cabin hunted by monsters every night".
compatibility: Python 3.9+, ffmpeg, Node 18+ (npx). An ElevenLabs API key for the voice (optional for free silent drafts).
---

# Stickman Story Reels

Turn a premise into a finished 60–90 s vertical reel: a hook-first script built for watch time, stick-figure shots drawn in code, voiceover with word-timed captions, sound design, and a two-option vote that makes people comment and come back for Part 2. Built from the workflow behind the PlotVote interactive stories (@plotvote).

The pipeline is deterministic: you write `episode.json` (script, timing, motion) and `scenes.js` (drawings), and `scripts/reel.py` does the rest (voice → sound → build → check → render). No image models, no stock footage, no paid tools except the voice.

## Setup (once per machine)

Check `python3 --version` (3.9+), `ffmpeg -version`, and `node --version` (18+). The first render downloads HyperFrames and a headless Chrome through `npx`; that's normal and takes a minute. For the voice, the user puts `ELEVENLABS_API_KEY=...` in a `.env` file in their project folder (or exports it). Never print the key. Without a key, everything still works in `--draft` mode (silent, timed at real speed).

Define this shell function once per terminal session (a function, not a string variable, so it works in both zsh and bash). The commands below use it:
```bash
reel() { python3 "<this skill's folder>/scripts/reel.py" "$@"; }
```

## Workflow

### 1. Understand the ask
- **"Make this story"** with a clear premise → write one strong script and build it.
- **"Give me options" or "script ideas"** → pitch 3 full options (see the playbook §10), let them pick, then build.
- **"Next part" or "X won the vote"** → continue the series: open on the consequence, pay off the last clue, give a real answer, escalate, new vote (playbook §9). Read the series bible if there is one.
- **Script only** (or no shell available) → deliver the script table, plus `episode.json` and `scenes.js` if they'll render it themselves.

### 2. Write the script
**Read `references/viral-script-playbook.md` first, every time.** It holds the rules that decide whether people stay past 3 seconds. When inventing a premise, a series or a season, also read `references/story-engines.md`.

Write the script as a table (# · voice · spoken · on screen), aiming for about 210–230 words (about 85 s at house pace). Run the playbook's pre-voice checklist. The ones people get wrong most: frame 1 must move; where, when and who by 5 s; every decision passes the 12-year-old test; characters say their own reveals in first person; the vote is two physical one-word actions with a cost on both sides; a whispered clue after the vote points at something planted earlier.

If the user asked for options, or might want to approve before credits are spent, show the script table and wait. Otherwise keep going.

### 3. Scaffold the reel
```bash
reel new reels/<slug>-part1 --title "<Title> — Part 1"
```
This creates `episode.json` and `scenes.js` from a small working starter. Replace both with your story.

### 4. Draw the shots (`scenes.js`)
**Read `references/drawing-kit.md`**, and open `examples/sundown-part1/scenes.js` as the pattern library (a creature leaning out, a pull-back map, a rules wall revealed line by line, stop-motion creatures, a window near miss, a talking radio, a flashlight in the trees, the choice split, a cover).

One function per shot from your script table. Each one returns a 1080×1920 SVG built from kit helpers (`defs()`, `sky()`, `forest()`, `cabin()`, `room()`, `water()`, `stick()`, `kid()`, `creature()`, `phone()`, `radio()`, `chip()`, `ring()`, `splitChoice()`…). A setting the kit doesn't have (a water park, a train, a desert) is normal: draw it from rects, paths and the helpers, following the drawing kit's "Building a new setting" section. Give an id to everything that should move or appear on a word. Keep faces out of the caption band (y 1180–1380) and the right 140 px. Add a `mode` for the cover (subject placed below the title) and for vote-card insets.

### 5. Wire the episode (`episode.json`)
**Read `references/episode-format.md`.** For every scene: `draw`, `say` lines, `kenburns`, and `animate` entries landing on spoken words (`"at": "faster"`). Then: voices (with `fx` and caption `tag`s for other characters), HUD pills with a clock, hand-placed `sfx` on words, `bed` cues, the vote scene (two options, insets, the clue line), `cover`, and `post` (caption with `{vote_line}`, pinned comment, `posts_at`). For voices, sounds and captions see `references/sound-voice-posting.md`.

### 6. Draft pass (free)
```bash
reel voice reels/<slug> --draft     # silent, real-speed timing
reel sound reels/<slug>
reel build reels/<slug>
reel check reels/<slug>
reel snap  reels/<slug> --at scenes  # two stills per shot (or --at 0.5,12,30.5 seconds)
```
Look at every still in `reels/<slug>/snaps/`. Fix what the drawing kit's readability rules warn about: things too dark to read, faces under captions, subjects too small, a mistimed reveal. `check` must say "Check passed" (`all` stops before rendering if it doesn't). These warnings are expected and fine: "nested structure", "track too dense", "composition file too large", and insets "overflowing" their crop.

### 7. Voice and render
```bash
reel all reels/<slug>               # voice (ElevenLabs) → sound → build → check → render
reel frames reels/<slug> --every 2  # contact sheet of the whole reel, for review
```
Check the printed length (60–90 s; cut setup if it's over). Look at `renders/review.png`: the subject is readable, captions are clear, the thing named moves on its word, and the vote card and clue inset appear. Listen to line 1; if a word could be misheard, change the word and re-voice (only changed lines cost credits).

### 8. Deliver
Give the user `renders/<slug>.mp4`, `renders/cover.png` and `POST.md` (caption, pinned comment, alt text, vote close time). For a series, write or update `bible.md` next to the reel folder: cast, rules, canon, the clue, and one line per vote option for how the next part starts (story-engines §4).

## Commands

| Command | What it does |
|---|---|
| `reel new <dir> --title "…"` | scaffold a reel folder |
| `reel voice <dir> [--draft]` | voice + word timings → `timing.json`, `assets/audio/narration.wav` |
| `reel sound <dir>` | synthesize 19 sound effects + the ambient bed |
| `reel build <dir>` | compile `index.html`, `cover/`, `POST.md` |
| `reel check <dir>` | HyperFrames lint, layout and contrast gate (exits non-zero on failure) |
| `reel snap <dir> --at scenes` | PNG stills from the composition, two per shot (or `--at 1,5.5,9` seconds) |
| `reel render <dir> [--draft]` | MP4 at −14 LUFS + `cover.png` + contact sheet |
| `reel all <dir> [--draft]` | voice → sound → build → check → render (stops if check fails) |
| `reel frames <dir> --every 2` | review sheet of the whole rendered MP4 |

## Troubleshooting
- **`"word" isn't spoken there`:** the time reference uses the caption spelling and is searched only within that scene; the error prints what the scene says. Use `word#1` for the second occurrence, `sN:word` for another scene, `start+0.2` for an offset, or `12.5s` for an absolute time.
- **Voice not found:** use a premade name (Liam, Brian, George, Daniel, Callum, Bill, Roger, Chris, Eric, Will, Harry, Charlie, River, Adam, Sarah, Matilda, Jessica, Alice, Lily, Laura, Bella) or the voice id.
- **Credits ran out:** lines already voiced are cached; top up and re-run `voice`.
- **A blank or black shot:** a JavaScript error in that set. `check` shows it; test the function by building again after the fix.
- **Over 90 s:** cut setup lines and adjectives; keep the hook, the twist, the vote and the clue.
- **`npx` or `node` errors:** install Node 18+; on first run let `npx` download HyperFrames and Chrome.

## What's in this skill
- `scripts/reel.py`: the CLI. `scripts/synth.py`: 19 sound effects and the bed (drone, wind, pulse, hum, water), all synthesized.
- `assets/kit.js`: the drawing kit. `assets/runtime.js`, `assets/base.css`: captions, HUD and the vote card.
- `references/`: `viral-script-playbook.md` (always), `story-engines.md` (premises, series, bible), `episode-format.md` (the spec), `drawing-kit.md` (drawing), `sound-voice-posting.md` (voices, sound, captions, posting, safety).
- `examples/sundown-part1/`: a complete 89-second Part 1 (`episode.json` + `scenes.js`). `examples/starter/`: the 4-shot starter used by `new`. `examples/script-pitches.md`: five more full Part 1 scripts (THE WHEEL, LAST CAR, LOW TIDE, 3:33, ROW ONE).
