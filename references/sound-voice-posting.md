# Voice, sound and posting

## Contents
1. [Voices](#1-voices)
2. [Sound design](#2-sound-design)
3. [Posting kit](#3-posting-kit)
4. [Running the vote](#4-running-the-vote)
5. [Taste and safety](#5-taste-and-safety)

---

## 1. Voices

- **Narrator:** ElevenLabs **Liam** at **tempo 1.15**. It's a calm, young male voice and reads well at speed. Other good narrators: George (older, warm) and Lily (British, warm).
- **Model:** `eleven_v3`, which performs delivery tags at the start of a line: `[tense]`, `[whispers]`, `[urgent]`, `[shaky]`, `[quietly]`, `[low]`, `[cold]`, `[out of breath]`, `[shouting, crying]`, `[low, smug]`. Use one tag per line, and only where it changes the read. If v3 refuses a line, `reel.py` retries it on `eleven_multilingual_v2` without the tags.
- **Casting:** a parent → Brian / Bill / Sarah / Matilda. A teen or young adult → Jessica / Callum / Liam. An authority figure → Daniel / Roger. A cheerful recording or announcer → George with `fx: intercom`. There are **no child voices** among the premade ones: give young kids few or no lines (they act, write, text or point), use Jessica or Lily for an older kid, or use a voice from the ElevenLabs library by its id.
- **Filters:** `radio` (walkie-talkie, police radio), `phone` (calls), `intercom` (PA, train driver, building intercom), `muffled` (through a wall). The same character on and off the radio = two speaker keys with the same voice; only one has `fx`.
- **Caption tags:** give every non-narrator speaker a `tag` ("DAD · RADIO", "MOM · PHONE", "@LIGNE_ROUGE") and a `color`, so viewers know who's talking without a face.
- **Cost:** roughly 1,100–1,400 ElevenLabs characters per 85-second part. Re-running `voice` only regenerates lines whose text, voice or settings changed. Check the hook line by ear: if a word in line 1 could be misheard ("said up" sounded like "set up"), change the word.
- **Free draft:** `reel.py voice <dir> --draft` makes silent timing at real speed, so you can build, preview and fix the visuals before spending credits.

## 2. Sound design

What worked:
- **Hand-place every sound on a word.** One sound per story beat: a heartbeat on frame 1, a click when the creature stops, a whoosh on "faster", static on "crackles", a slam on "slams", a hit on the reveal. Don't put the same whoosh on every cut.
- **A signature sound for the threat** that repeats every part.
- **A bed under everything:** `drone` (dread), `wind` (outdoors), `pulse` (a heartbeat, for tension), `hum` (an electrical room). Change the levels on scene changes: wind outside, drop the wind and raise the hum inside, add pulse toward the vote, and fade it all to 0 after the clue.
- **Leave room for the voice.** Bed volume about 0.5, effects 0.3–0.6. `reel.py render` normalises the final mix to −14 LUFS, the level Reels, TikTok and Shorts play at.

The synthesized library (made by `reel.py sound`; no samples, no licences): `heartbeat` (lub-dub), `hit` (sub boom, for reveals), `pulse` (a soft thump), `whoosh` (speed), `click` (a stop or switch), `tap` (light wood), `knock` (three knocks), `slam` (a door), `static` (a radio squelch), `riser` (rising tension, 3 s), `sting` (a dissonant chord), `buzz` (a phone vibrating), `creak` (a door or floor), `squeak` (fingers on glass), `engine` (a truck), `glitch` (digital), `splash` (something hits water), `wave` (a wave washing in), `whistle` (a lifeguard or referee whistle). Bed layer `water` = lapping water.

## 3. Posting kit

`reel.py build` writes **POST.md** with everything to paste.

**The caption formula:**
```
<the hook in one line, no spoilers> <one emoji>

👉 Follow and comment your vote down below. The majority decides Part 2.

👀 Watch to the very end. <a hint at the clue, e.g. "Read Dad's rules very carefully.">

{vote_line}

#<genre> #<format> #stickman #animation #storytime #youdecide
```
- The first line is what shows before "more", so it must make people tap the reel, not summarise it.
- Keep `{vote_line}`. It becomes "🗳️ Voting closes Sun Oct 27, 7:00 PM IST · SUNDOWN · PART 1 · ON or OFF" (set `post.tz_label` to "IST", "ET" and so on; otherwise it prints the UTC offset). An exact close time creates urgency, and comment-tracking tools can read it.
- Part 2+: "Most of you voted <WINNER>." near the top. If many voted the other way, add: "A LOT of you chose <LOSER> 👀 Comment VARIATION and we'll release that version." It adds comments and tests demand. Only promise what you'll deliver, and don't promise a website or date you don't have.
- Use 4–7 hashtags. Fiction set during real events gets one line saying so: "A fictional story set during this month's protests in Paris."

**Pinned comment:** "👉 Follow and comment your vote: ON or OFF. One vote per account. Voting closes {closes}. Part 2 drops when it closes."

**Cover:** `renders/cover.png` (1080×1920). Pick it as the reel cover. Keep the title readable in the centre 3:4 crop, because that's what shows on the profile grid.

**Alt text:** describe the story plainly in 2–4 sentences, ending with the vote.

**Schedule:** post when your audience is awake, and close the vote 24–48 h later. Post the next part when the vote closes, so the promise in the caption holds.

## 4. Running the vote

- Count **one vote per account** (ignore repeats), ignore words that aren't votes, and note the counts in the bible.
- If a vote is called early, reply on the old reel: "Voting's closed: <WINNER> won! Part <N> is up now 👆".
- Write **only** the winning branch. Save the losing branch's one-line start in the bible: it's your VARIATION content.
- Next part: open on the consequence, pay off the clue, give a real answer, escalate, new vote (see `viral-script-playbook.md` §9).

## 5. Taste and safety

- No gore, no blood, no on-screen deaths. Bites are bruises, danger is implied, and the camera cuts away.
- No real people. For real events: invented characters, no claims about who caused real violence, both sides shown as people, and a fiction note in the caption.
- Kids in peril are the genre, but don't show a child being hurt; tension comes from what *might* happen.
- Don't make characters slurs or stereotypes. Stick figures make it easy to be inclusive: vary hair, clothes and colours.
- Voices are synthetic and premade; don't clone a real person's voice without their permission.
