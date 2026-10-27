# The drawing kit: stick-figure shots in code

Every shot is a JavaScript function in the reel's `scenes.js` that returns one 1080×1920 SVG string built from `assets/kit.js`. No image models and no stock art, which keeps it fast, consistent, free and yours. Study `examples/sundown-part1/scenes.js`: its eleven shots use almost everything below.

## Contents
1. [Frame and safe zones](#1-frame-and-safe-zones)
2. [A shot, start to finish](#2-a-shot-start-to-finish)
3. [The API](#3-the-api)
4. [Posing a stick figure](#4-posing-a-stick-figure)
5. [Motion patterns that work](#5-motion-patterns-that-work)
6. [Building a new setting](#6-building-a-new-setting)
7. [Readability rules](#7-readability-rules)
8. [Previewing without a render](#8-previewing-without-a-render)

---

## 1. Frame and safe zones

The frame is **1080 × 1920** (x right, y down).

| Zone | y range | Use |
|---|---|---|
| HUD pills | 150–230 (left) | time, day, counters (drawn by the build) |
| Part tag / chips | 260–420 | "6 DAYS AGO", "LAST NIGHT", "THAT'S YOU" |
| **Main picture** | 300–1170 | faces, the threat, the clue |
| **Captions** | **1180–1380** | keep faces and key props **out** of this band |
| Lower picture | 1380–1780 | hands, phones, floors, the person "you" from behind |
| App UI | right 140 px · bottom ~140 px | Instagram/TikTok buttons and text sit here, so leave it empty |

## 2. A shot, start to finish

```js
// s1 (hook): dusk at the edge of the woods; one of them leans out from behind a trunk
function myHook(mode) {
  let s = defs() + sky("dusk");                                          // 1. gradients + background
  s += forest(1170, -60, 1160, 80, 180, 300, "#3A2238", 61);             // 2. far → near layers
  s += forest(1230, -80, 1180, 95, 240, 380, "#120E16", 62);
  s += ground(1220, "#0E0C12");
  s += `<g id="tall"${mode === "cover" ? "" : ' transform="translate(-230 0)"'}>`
     + creature({ x: 470, y: 1560, h: 1080, pose: "hunch", eyesId: "eyes" }) + `</g>`;   // 3. the subject, with ids to animate
  s += `<rect x="190" y="200" width="110" height="1420" fill="#08070B"/>`;                  // 4. foreground (the trunk it hides behind)
  if (mode !== "cover") s += streak("zip", 520, 520, 1180, 520);                            // 5. hidden extras for later beats
  return s + vignette(0.7);                                                                 // 6. darken the edges
}
```
Then in `episode.json`: `"draw": "myHook('scene')"` plus animations on `tall`, `eyes` and `zip`.

**Conventions**
- Start with `defs()` and end with `vignette()`.
- Prefix ids per story (`hk`, `nt`, `rd`…) so they're readable. The build adds a per-scene suffix, so the same set can appear in two scenes.
- Give a set a `mode` argument when it's reused: `"scene"`, `"cover"` (no hidden bits, subject placed under the title), `"inset"` (no cards), `"clue"` (ring visible).
- Hidden things are drawn with `style="opacity:0"` and revealed by an animation on a word.

## 3. The API

**Setup:** `defs()` (every gradient), `vignette(op)`, `sky("night"|"dusk"|"day"|"overcast", seed)`, `ground(y, colour)`.

**People**
- `stick(o)`: a stick figure (see §4). `stick.last` = `{head, r, neck, sh, handL, handR, hip}` for attaching props.
- `kid(o)`: the same figure in a red beanie, an easy "you" to spot in every shot.
- `creature({x, y, h, pose, id, eyesId, hidden, rim, ink})`: an eight-foot thing. `x` is between the feet, `y` the ground, `h` the height. `pose`: `stand` | `hunch` | `run` | `reach`. It has two white pinprick eyes and a moonlit rim (`rim: false` to drop it, or a colour). For scale, 8 ft ≈ 1.25× a door.
- `bandana(head, r, s)`: a red bandana on a head (`stick.last.head`, `stick.last.r`).
- `lnFace(head, r, expr, look, strokeWidth, ink)`: a face, for drawing one on a helmet with the visor up.

**Water:** `water(y, {color, deep, id, lines})` (a pool, lake or sea surface from y down; drift the wave lines by animating `x` on its `id`), `splash(id, x, y, k)` (a white burst, hidden), `ripple(id, x, y, k)` (rings, hidden).

**Places**
- `forest(baseY, x0, x1, step, hMin, hMax, colour, seed)` and `pine(x, y, h, colour)`. Layer 2–3 rows; nearer rows are darker and taller.
- `cabin(x, y, k, {lampOn, lampId, winLit, wall, wallDk})`, a log cabin front; `(x, y)` = bottom centre.
- `facade(x, y, w, h, seed)`: a city building front with windows.
- `room({wall, floor, floorY, planks, window: {x, y, w, h, inside}})`: an interior.
- `windowFrame(x, y, w, h, {inside, glass, frame, id})`: a window. `inside` is drawn through the glass, clipped to it.
- `smoke(id, x, y, k, seed, op)` / `puff(id, x, y, k, seed, op, hidden)`: smoke, fog and gas. Drift them with `x` or `attr.transform`.
- `sdNightSky(seed)`, `sdStars(seed)`.

**Things:** `phone(id, x, y, w, h, inner, bg)` (a phone; `inner` is drawn in screen coordinates, `(w-40)×(h-40)`), `glove(cx, bottom, w)` (a hand holding it), `radio(x, y, k, {led: id})` (a handheld radio; the LED shows while someone talks), `arm(points, colour, width, hand)`.

**Labels and highlights**
- `label(x, y, text, size, fill, {anchor, font, weight})`: SVG text (IBM Plex Mono bold by default; `font: "Archivo Black"` for posters).
- `chip(x, y, text, {id, hidden, fg, bg, anchor, size})`: a rounded tag.
- `ring(cx, cy, rx, ry, colour, id)`: a dashed highlight, hidden until animated. Use it on the clue.
- `streak(id, x0, y0, x1, h)`: speed lines, hidden until animated.
- `cam(k, cx, cy)`: the transform that frames `(cx, cy)` at zoom `k`.

**The choice frame:** `splitChoice({left, right, labels: ["A", "B"], cards: [[title, lineA, lineB], [...]], inset, cropL, cropR})`. Two half-panels (each a full 1080×1920 drawing, cropped to its middle) and two cost cards with ids `chA` / `chB` that you reveal on their words. Card lines must be ≤ 19 characters. Don't animate inside the halves.

**Palette constants:** `KIT` (ink, skin, navy, yellow, red, amber, cream, light, moon), `LN`, `SD`, `IM`.

**Small helpers:** `f(n)` (a number to 1 decimal, for SVG strings), `rng(seed)` (a seeded random function, so the same set always draws the same way), `polar(cx, cy, r, deg)`, `lnPt(point, angle, length)` (a point along an angle), and `lnP(points)` (points to a path string).

**Two names for the same thing.** The SUNDOWN example uses the engine's original names; the friendly API wraps them:

| In `examples/sundown-part1` | Friendly name |
|---|---|
| `sfig` | `stick` |
| `sdBoy` | `kid` |
| `sdTall` | `creature` |
| `sdForest`, `sdPine` | `forest`, `pine` |
| `sdCabin` | `cabin` |
| `sdStreak` | `streak` |
| `sdNightSky` | `sky("night")` |
| `imChip`, `imText`, `imRing`, `imCam` | `chip`, `label`, `ring`, `cam` |
| `ln2Phone`, `ln2Hand` | `phone`, `glove` |
| `imRadioDev` | `radio` |
| `lnFacade`, `lnSmoke`, `ln2Puff`, `ln2Bandana` | `facade`, `smoke`, `puff`, `bandana` |
| `sdDefs()` + `lnDefs()` | `defs()` |
| `SD.*`, `LN.*`, `IM.*` colours | `KIT.*` |

## 4. Posing a stick figure

`stick({ x, y, s, expr, look, back, hair, helmet, visor, mask, scarf, vest, armor, pose, phone, sign, flag, shield, armL, armR, id })`

- `(x, y)` is the **hips**. At `s: 1` the figure is about 320 px tall: about 138 px of legs below the hips, the torso and head above.
- `expr: "sleep"` draws closed eyes. `back: true` draws a plain head with no face; add a hood, hair or a hat so it reads as "from behind".
- `expr`: `neutral` (slight smile), `worry`, `fear` (big eyes, O mouth), `shout`, `stern`. `look`: −1..1 moves the eyes. `back: true` = seen from behind (no face).
- `pose` angles are in degrees: **0 = straight down, 90 = right, 180 = up, −90 = left**. `la`/`ra` = [upper arm, forearm] for the image-left and image-right arms; `ll`/`rl` = [thigh, shin]. **`lean`: positive tilts the head to the image-LEFT, negative to the right** (a figure running right leans right, so it uses a negative lean).

| Pose | `pose` |
|---|---|
| standing, arms down | `{}` (default) |
| waving (right arm) | `{ ra: [150, 168] }` |
| arms up, cheering / fist up | `{ la: [-150, -168], ra: [148, 170] }` |
| hands together on the lap (seated, zip-tied) | `{ la: [-30, 60], ra: [30, -60] }` |
| running left | `{ lean: 18, la: [-60, -20], ra: [60, 20], ll: [-40, -10], rl: [40, 80] }` |
| running right | `{ lean: -18, la: [-60, -20], ra: [60, 20], ll: [-40, -80], rl: [40, 10] }` |
| lying down / asleep | draw it standing with `expr: "sleep"` inside `<g transform="rotate(-90 x y)">` around the hips, or show only the head above a blanket (see SUNDOWN's `sdWindow`) |
| diving / falling | wrap a running pose in `<g transform="rotate(60 x y)">` and add a `streak` |
| holding a phone up | `{ ra: [160, 170] }` plus `phone: {}` |

Props: `phone: { live: "liveDotId" }`, `sign: { text, w, h }`, `flag: true`, `shield: "POLICE"`, `helmet: true, visor: "down"|"up"`, `scarf: "#F2C230"`, `vest: true`, `hair: "pony"`.

## 5. Motion patterns that work

| Pattern | How |
|---|---|
| **Frame 1 already moving** | the subject group starts offset (`transform="translate(-230 0)"`) and animates `x: 0` at `"start-0.3"`; or a streak, flicker or camera push from 0 s |
| **Reveal on the word** | draw it with `style="opacity:0"`, then `{ "el": "rule2", "to": {"opacity": 1}, "at": "Two" }` |
| **Too fast to see** | draw the creature in 3–4 spots, all hidden; on each word hide the last one and show the next one, closer. Add one `click` sound per stop and a `streak` flash on "fast". |
| **Exit at speed** | `{ "to": {"x": 1300}, "dur": 0.14, "ease": "power4.in" }` plus the `whoosh` sound plus a streak |
| **Camera push / pan** | wrap the set in `<g id="cam" transform="${cam(1, 540, 960)}">` and animate `attr.transform` to `cam(2.3, x, y)`'s string. Write the target as the literal `"translate(X Y) scale(K)"`, where X = 540 − K·x and Y = 960 − K·y. |
| **Shake / buzz** | `{ "to": {"x": 8, "repeat": 9, "yoyo": true}, "dur": 0.04, "ease": "none" }` |
| **Flicker** | `{ "to": {"opacity": 0.2, "repeat": 7, "yoyo": true}, "dur": 0.1, "ease": "steps(1)" }` |
| **Door opening** | `{ "to": {"scaleX": 0.04}, "origin": "<hinge x> <y>" }` |

**About `origin`:** it's the pivot in the coordinate system the element is drawn in, which is frame coordinates for anything drawn directly in the set. If the element sits inside a translated or scaled `<g>`, give the pivot in that group's own (local) coordinates, e.g. a shoulder at `"-34 10"`.
| **Talking** | a hidden mouth, radio LED or waveform group; `"talk": [{"el": "mouth", "speaker": "jade"}]` |
| **Bob / walk** | `{ "to": {"y": -12, "repeat": 13, "yoyo": true}, "dur": 0.2, "ease": "sine.inOut" }` |
| **Point at the clue** | a `ring(...)` with an id, opacity 1 on the word; a `chip` label |
| **Two moments of one place** | the same set called twice with a different `mode` (Mom at the truck → the tailgate empty) |

## 6. Building a new setting

Most stories need a place the kit doesn't have (a water park, a subway car, a desert gas station, a lighthouse). Build it from the same layers every time:
1. **Background:** `sky()` or `room()`, or flat colour bands for walls, floors and ceilings.
2. **Big shapes:** `rect`s and `path`s for the architecture: platforms, slides, pumps, counters, tracks. Use 2–4 flat colours plus a darker shade for depth, and `stroke="${KIT.ink}" stroke-width="8"` outlines to match the stick figures.
3. **Depth:** repeat the shape smaller and darker further back (rows of windows, lockers, seats, lamps). Use `rng(seed)` for natural variation.
4. **Light:** one light source per shot (a lamp, a screen, a moon, a flashlight) with a soft radial gradient (`url(#sdLampG)`, `url(#warmGlow)`) and the subject placed in it.
5. **People and the threat** go on top. Then the foreground (a railing, a door frame, a hand), then `vignette()`.
6. Write each prop as a small function of its own (`slide(x, y, k)`, `lifeguardChair(x, y)`) so you can reuse it across shots and later parts. Keep them in `scenes.js`.

## 7. Readability rules

These come from renders that failed.
- **Black on dark doesn't read.** Put the creature's body against the sky or a lit wall, lighten the ground (moonlit `#1A2632`, not `#0B120E`), and keep the rim on.
- **One subject per shot, big.** If you have to squint at the contact sheet, it's too small. Use `cam()` to push in.
- **Faces out of the caption band** (y 1180–1380). Move people down (seated at y ≈ 1530) or up.
- **Text inside drawings** needs at least 3:1 contrast; `reel.py check` lists anything below that.
- **Covers:** the title sits at y ≈ 290–700, so draw the cover mode with the subject lower (move the creature's ground y down by ~260).
- **Proportions:** keep a person shorter than a door and a creature taller than one. Foreground people are bigger; don't put a tiny cabin next to a giant creature at the same depth.

## 8. Previewing without a render

- `reel voice <dir> --draft` gives free, silent timing at real speed (about ±5%).
- `reel build <dir>` then `reel snap <dir> --at scenes` saves two PNG stills per shot in `<dir>/snaps/` (or `--at 0.5,6,14` for exact seconds). Look at them before rendering.
- `reel check <dir>` reports JavaScript errors, overflowing text and low contrast. Warnings about "nested structure", "track too dense", "composition file too large" and insets "overflowing" their crop are expected.
- After a render, `reel frames <dir> --every 2` makes a contact sheet of the whole reel. Look at every frame: is the subject readable, is the face clear of the captions, does the thing the narrator names move on its word?
