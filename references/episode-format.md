# episode.json: the reel spec

One reel = one folder with `episode.json` (what's said, when things move, the vote) and `scenes.js` (the drawings). `reel.py` turns the folder into an MP4. The complete working example is `examples/sundown-part1/episode.json`.

## Contents
1. [Top level](#1-top-level)
2. [Scenes](#2-scenes)
3. [Time references](#3-time-references)
4. [Animations](#4-animations)
5. [The vote scene](#5-the-vote-scene)
6. [HUD, sound, bed, cover, post](#6-hud-sound-bed-cover-post)
7. [Folder after a build](#7-folder-after-a-build)

---

## 1. Top level

```json
{
  "title": "Sundown — Part 1: Rule Two",
  "tag": "SUNDOWN · PART 1",                // gold pill, top-left, during the first shot
  "wordmark": "SUNDOWN · @YOURHANDLE",      // small text on the vote card
  "theme": { "accent": "#F2A33A", "alert": "#E5484D", "cream": "#F2EEE6", "bg": "#0D1018", "bg_hi": "#1E2A3A", "bg_lo": "#05070B" },
  "voices": {
    "narrator": { "voice": "Liam" },
    "dad":      { "voice": "Brian", "tag": "DAD · 6 DAYS AGO", "color": "#F2A33A" },
    "dadradio": { "voice": "Brian", "fx": "radio", "tag": "DAD · RADIO", "color": "#F2A33A" }
  },
  "pace": { "tempo": 1.15, "gap": 0.25, "scene_gap": 0.4, "end": 2.0 },
  "captions": { "fourteen.": "14.", "a hundred kilometers away.": "100 km away." },
  "hud": [ … ], "sfx": [ … ], "bed": { … },
  "scenes": [ … ],
  "cover": { … }, "post": { … }
}
```

(Comments are shown for explanation. Real JSON can't contain `//` comments, so leave them out.)

- **voices:** one entry per speaker. `voice` is an ElevenLabs premade name (Liam, Brian, George, Daniel, Callum, Bill, Roger, Chris, Eric, Will, Harry, Charlie, River, Adam, Sarah, Matilda, Jessica, Alice, Lily, Laura, Bella), a voice id, or the exact name of a voice in your account. `fx`: `radio` | `phone` | `intercom` | `muffled`. `tag` and `color` style that speaker's captions. `stability` (default 0.5) and `model` (default `eleven_v3`) are optional. The same person on a radio is a second speaker key with the same voice plus `fx`.
- **pace:** `tempo` speeds the voice up without changing pitch (1.15 is the house pace). `gap` is the pause after a line, `scene_gap` the pause after a scene's last line, `end` the hold after the very last line, and `lead` the silence before the first line (default 0.3).
- **tts_model** (optional, top level): the ElevenLabs model for every line (default `eleven_v3`). A voice can override it with its own `model`.
- **captions:** turn spoken words into display tokens. Match the spoken text exactly, including punctuation.

## 2. Scenes

```json
{ "id": "s5", "draw": "sdNight()", "kenburns": [1.0, 1.04, "50% 60%"], "lead": 0.3,
  "animate": [ { "el": "ntT1", "to": { "opacity": 1 }, "at": "trees", "dur": 0.05 } ],
  "talk": [ { "el": "rdLed, rdWave", "speaker": "dadradio" } ],
  "chip": { "text": "LAST NIGHT", "at": "start", "x": 80, "y": 330 },
  "stamp": { "text": "CURE", "at": "cure", "x": 600, "y": 400, "rot": -6, "solid": true },
  "say": [
    "When the sun goes down, they come out of the trees. Thin as branches. Taller than your door.",
    { "text": "And they move so fast, you only ever see them stop.", "pause": 0.4 }
  ] }
```

| Field | Meaning |
|---|---|
| `id` | `s1`, `s2`… (used by time references and the per-scene id suffix) |
| `draw` | A JavaScript call that returns the shot's SVG: a function in your `scenes.js`, e.g. `"sdHook('scene')"`. |
| `say` | One or more lines. A string = narrator. An object = `{text, speaker, pause}`. The scene lasts as long as its lines. |
| `kenburns` | `[fromScale, toScale, "originX% originY%"]`, a slow push over the scene. Default `[1, 1.06, "50% 50%"]`. |
| `lead` | Cut to this shot this many seconds before its first line (let an image land, or let a sound play first). |
| `animate` | A list of moves, see §4. |
| `talk` | Show these element ids only while that speaker's words are spoken: mouths, radio LEDs, waveforms. |
| `chip` / `stamp` | An HTML label popped in at `at` (chip: a rounded tag; stamp: a slammed rubber stamp). |
| `type: "vote"` | The vote card, see §5. |

## 3. Time references

Anywhere an `at` is accepted:

| Reference | Means |
|---|---|
| `"start"` / `"end"` | when this scene starts / ends |
| `"faster"` | the moment the word *faster* is spoken in this scene (case and punctuation are ignored) |
| `"run#1"` | the **second** time *run* is spoken in this scene (`#0` = first) |
| `"stop+0.2"`, `"start-0.3"` | plus or minus seconds |
| `"s7:crackles"` | a word in another scene (top-level `sfx` and `bed` cues use this form) |
| `"0"` | the very first frame |
| `"12.5s"` | 12.5 seconds into the reel (absolute) |

Use the **caption** spelling: if `captions` turns "fourteen." into "14.", reference `"14"`. If a word isn't found, the build tells you exactly what that scene says.

## 4. Animations

```json
{ "el": "hkTall", "to": { "x": 1300 }, "at": "faster", "dur": 0.14, "ease": "power4.in" }
{ "el": "rfDoor", "to": { "scaleX": 0.04 }, "origin": "100 1000", "at": "start-0.45", "dur": 0.55 }
{ "el": "cam", "to": { "attr": { "transform": "translate(-700 -1120) scale(2)" } }, "at": "sitting", "dur": 0.9 }   // "sitting" = a word this scene says
{ "el": "c4You", "to": { "y": -16, "repeat": 13, "yoyo": true }, "at": "start", "dur": 0.2, "ease": "sine.inOut" }
{ "el": "ntT1, ntT2", "to": { "opacity": 0 }, "at": "branches", "dur": 0.05 }
```

- `el`: one or more ids from the set (comma-separated). The build adds the scene suffix for you.
- `to`: any GSAP property: `x`, `y`, `rotation`, `scale`, `scaleX`, `opacity`, `attr.transform`, plus `repeat`/`yoyo` for loops.
- `origin`: the SVG pivot point `"x y"` for rotation and scaling (e.g. a door's hinge).
- Hidden-until-revealed elements are drawn with `style="opacity:0"` in the set; animate `opacity` to 1 on the word.
- A move that starts from an initial transform (e.g. `transform="translate(-230 0)"` on the group) animates `x`/`y` toward 0.
- Default `dur` is 0.6 and default `ease` is `power2.inOut`. Use `steps(1)` for flicker and `none` for steady drifts.

## 5. The vote scene

```json
{ "id": "s11", "type": "vote",
  "title": ["FOLLOW &", "COMMENT BELOW"],
  "options": ["ON", "OFF"], "subs": ["TURN THE LIGHT ON", "KEEP IT OFF"],
  "options_at": "Do", "option_words": ["on#1", "off#1"],
  "insets": [
    { "draw": "sdInsetSwitch()", "box": [190, 200, 700, 500], "viewBox": "0 560 1080 771", "label": "THE PORCH · NOW", "border": "#F2A33A" },
    { "draw": "sdRules('clue')", "box": [190, 200, 700, 500], "viewBox": "60 380 980 700", "label": "DAD'S RULES", "border": "#E5484D", "at": "look" }
  ],
  "say": [
    "[urgent] Follow, and comment your vote down below. Do you turn the porch light on, or keep it off? On, or off. The majority decides Part Two.",
    "[whispers] And look at the rules again. Rule two is in different handwriting."
  ] }
```

- Exactly two `options`. **Quote "ON"/"OFF"/"YES"/"NO"**: in JSON they're plain strings, but if you ever convert to YAML, unquoted ON/OFF become true/false.
- `options_at`: the word where both buttons pop in. `option_words`: where each one pulses (usually the second time it's said: `"on#1"`).
- `insets`: up to two pictures above the vote, each a drawn set cropped by `viewBox` (`"x y w h"` in the set's 1080×1920 space, with w:h ≈ 1.4). The one with `at` replaces the earlier one on that word, so use it for the clue. Each inset gets its own id suffix; to animate something inside one, use `"el": "in1:ringId"` (in0 = the first inset).
- Optional: `kicker` (a small line above the title), `wordmark` (overrides the top-level one), `title` (`[]` for none).

## 6. HUD, sound, bed, cover, post

```json
"hud": [
  { "label": "NIGHT", "value": "7" },
  { "label": "TIME", "steps": [ ["11:59 PM", "0"], ["12:00 AM", "s2:start", "flash"] ] },
  { "label": "FLOOR", "steps": [ ["1", "0"], { "count": [1, 6, "s1:start+0.4", "s1:end"] }, ["ROOF", "s3:start"] ] },
  { "label": "INÈS", "show_at": "s2:her", "steps": [ ["IN A VAN", "s2:her", "hot"] ] }
],
```
Pills auto-size to their longest value (`width` sets a minimum). `flash` blinks red and pulses, `hot` turns the value red, `count` ticks integers between two times, and `show_at` makes the pill appear later. The HUD hides during the vote card.

```json
"sfx": [ { "sound": "heartbeat", "at": "0", "vol": 0.5 }, { "sound": "whoosh", "at": "s1:faster-0.05", "vol": 0.6 } ],
"bed": { "volume": 0.5, "cues": [ { "at": "0", "drone": 0.4, "wind": 0.45, "pulse": 0.2, "ramp": 0.5 },
                                  { "at": "s11:handwriting+0.4", "drone": 0, "wind": 0, "pulse": 0, "ramp": 2.0 } ] },
```
Sounds (all synthesized, no licences needed): `heartbeat hit pulse whoosh click tap knock slam static riser sting buzz creak squeak engine glitch splash wave whistle`. A custom `.wav` in the reel folder works too (`"sound": "assets/my-scream.wav"`). The bed layers are `drone`, `wind`, `pulse`, `hum` and `water` (0–1), and each cue ramps to its levels over `ramp` seconds.

```json
"cover": { "draw": "sdCover()", "big": "SUNDOWN", "tag": "PART 1", "kicker": "100 KM FROM ANYONE.", "line": "IT'S <b>8 FEET TALL.</b>", "options": ["ON", "OFF"] },
"post": { "posts_at": "2026-10-25T19:00:00+05:30", "vote_hours": 48,
          "caption": "Hook line 🌲\n\n👉 Follow and comment your vote down below.\n\n{vote_line}\n\n#horror #stickman",
          "pinned": "👉 Comment ON or OFF. One vote per account. Voting closes {closes}.", "alt": "…" }
```
`<b>…</b>` in the cover `line` turns red, and `big_size` sets the title's px size (default 140). `{vote_line}` becomes "🗳️ Voting closes <time> · <tag> · ON or OFF". `{closes}` becomes the close time. Use `vote_closes` instead of `posts_at` to give the exact close time. Times are ISO 8601 with an offset; add `"tz_label": "IST"` (or "ET", "GMT"…) to print a friendly zone name instead of "UTC+05:30".

## 7. Folder after a build

```
my-reel/
├── episode.json  scenes.js           ← you write these
├── timing.json   vo/                 ← reel.py voice (cache: re-running only voices changed lines)
├── assets/audio/narration.wav  bed.wav   assets/sfx/*.wav
├── index.html    cover/              ← reel.py build (HyperFrames compositions)
├── POST.md                           ← caption, pinned comment, alt text, script
└── renders/<name>.mp4  cover.png  contact-sheet.png
```
