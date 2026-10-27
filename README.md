# 🎬 Stickman Story Reels: a Claude skill

**Give Claude a one-line story idea, get back a finished animated reel.** It writes a script built for watch time, draws stick-figure shots in code, adds a voiceover with captions that light up word by word, sound design, an on-screen clock, and a "comment your vote" ending that turns viewers into co-writers.

> "You're fourteen, alone in a cabin 100 km from the nearest city. Every night, something eight feet tall comes out of the woods."
> → an 89-second, 1080×1920 MP4 ready for Instagram Reels, TikTok and YouTube Shorts, plus the cover, caption, pinned comment and alt text.

This is the workflow behind the **PlotVote** interactive stories (@plotvote), where every part ends with a vote and the audience decides what happens next. It covers everything we learned about hooks, retention and what makes people comment, turned into a skill anyone can use.

---

## What you get
- **Viral script writing:** a playbook of 13 writing rules, hook styles, retention devices (clocks, rules, "you only ever see them stop"), how to write a vote that splits the comments, and rewatch clues. It also pitches 3 options on request and continues a series part by part.
- **Stick-figure animation in code:** a drawing kit with people, eight-foot creatures, forests, cabins, rooms, phones, radios, smoke, highlight rings and the "what each choice costs" split screen. No image generation, no stock footage, the same look every time.
- **Voice + captions:** ElevenLabs voices (narrator plus characters, with radio/phone/intercom filters). The captions are timed from the voice itself, so every word lands.
- **Sound:** 19 effects and an ambient bed (drone, wind, heartbeat, water), all synthesized in code, so there are no licences to worry about. The final mix is levelled to −14 LUFS.
- **Posting kit:** cover image, caption with the vote close time, pinned comment, alt text.
- **Free drafts:** build and preview the whole reel with silent, real-speed timing before spending any voice credits.

## Install (Claude Code)
```bash
# 1. put the skill where Claude Code looks for skills
git clone https://github.com/QuantumCoderSys/stickman-story-reels.git ~/.claude/skills/stickman-story-reels
#    (or download stickman-story-reels.zip from the Releases page and unzip it into ~/.claude/skills/)

# 2. tools it needs
python3 --version   # 3.9+
ffmpeg -version     # brew install ffmpeg · sudo apt install ffmpeg · winget install ffmpeg
node --version      # 18+   (the first render downloads HyperFrames + a headless Chrome via npx)

# 3. voice (optional for drafts): in the folder where you'll make reels
echo "ELEVENLABS_API_KEY=your_key_here" > .env
```
Then open Claude Code in that folder and ask:
- *"Make a stickman reel: a boy alone in a cabin in the woods, the nearest city is 100 km away, and every night 8-foot monsters that are super fast hunt him."*
- *"Give me 3 script options for a horror story reel about a lighthouse, optimized for watch time."*
- *"Part 1 got 70% RUN. Make Part 2, the RUN branch."*
- *"Draft it free first, no ElevenLabs."*

It also works in other agents that support Agent Skills (a folder with `SKILL.md`). The rendering steps need a machine with Python, ffmpeg and Node. Where they're missing, it still writes the scripts and the files for you to render yourself.

## Run it by hand
```bash
R=~/.claude/skills/stickman-story-reels/scripts/reel.py
python3 $R new reels/my-story --title "My Story — Part 1"
python3 $R all reels/my-story --draft     # free: silent timing, draft render
python3 $R all reels/my-story             # real voice + full-quality render
```
See `SKILL.md` for the full workflow and `references/` for the writing playbook, the episode format and the drawing kit.

## What's inside
```
SKILL.md                         the workflow Claude follows
references/viral-script-playbook.md   hooks, retention, votes, clues, checklists
references/story-engines.md           premise formula, 14 premises, series bible, season arc
references/episode-format.md          the episode.json spec
references/drawing-kit.md             drawing stick-figure shots in code
references/sound-voice-posting.md     voices, sound design, captions, posting, safety
scripts/reel.py  scripts/synth.py     the pipeline (voice → sound → build → check → render)
assets/kit.js  runtime.js  base.css   drawing kit, captions/HUD, styles
examples/sundown-part1/               a complete 89 s Part 1 to learn from
examples/script-pitches.md            five more full Part 1 scripts
```

## Credits and licence
Made by **PlotVote** (@plotvote). MIT licence: use it, change it, share it, make money with it. A shout-out is appreciated.
Rendering uses [HyperFrames](https://hyperframes.heygen.com) (installed automatically with npx) and GSAP. Voices are from [ElevenLabs](https://elevenlabs.io) (your own account and plan terms apply).
