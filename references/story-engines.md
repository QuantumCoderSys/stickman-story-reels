# Story engines: premises that hook, and how to run a series

## Contents
1. [The formula](#1-the-formula)
2. [Premise dials](#2-premise-dials)
3. [14 ready premises](#3-14-ready-premises)
4. [The series bible](#4-the-series-bible)
5. [A 6-part season arc](#5-a-6-part-season-arc)

---

## 1. The formula

The premises that perform best share one shape:

> **One person (you), far from help, with the distance as a number + one threat with simple rules + a clock that only moves one way + someone you love who makes it harder + a choice with a cost on both sides.**

Test a premise by saying it in one breath. If a stranger can repeat it back, it works:
- "You're fourteen, alone in a cabin 100 km from the nearest city, and every night something eight feet tall comes out of the woods." ✔
- "A story about trust and memory in a post-collapse society." ✘ (nothing to see, no clock, no threat)

## 2. Premise dials

Turn one or two dials at a time to get a new story:

| Dial | Options |
|---|---|
| **Place (isolated)** | cabin in the woods · lighthouse on a rock · top of a Ferris wheel · last subway car in a tunnel · desert gas station · farm with one neighbor 30 km away · hospital roof · ice-road truck · research boat · empty mall after closing · flooding prison cell · apartment during a blackout |
| **Threat rule** | only at night · only when you look away · hunts by light · hunts by sound · can't climb · can't cross water · moves one step closer every night · mimics voices you love · goes dark wherever it touches · obeys written rules nobody remembers writing |
| **The clock** | sunset/sunrise · the tide · the hour (a backup motor turns the wheel) · a countdown on a phone · the number of rows/cars/floors left · viewers on a livestream · temperature dropping · fuel/oxygen/battery |
| **The person who complicates it** | a parent on the radio asking you to break their own rule · a little sibling who acts on their own · a friend who knows more than they say · a stranger who might be lying · someone who isn't who they seem in the reflection |
| **The season mystery** | someone knew in advance · the rules were written by someone else · you were chosen on purpose · the voice on the radio isn't who it sounds like · the threat is protecting something |

**Genres that work with stick figures:** survival horror, creature features, rules horror, disaster (heatwave → snow, floods), crime thrillers (the getaway, the heist), family drama under pressure (a protest, an evacuation), mystery (a body in the backyard, a camera that shows the future).

**Real events as a backdrop:** allowed, with care. Keep it fiction set inside the event: invented characters only, no real people, no claims about who caused real violence, both sides shown as people, no injuries shown, and a line in the caption saying it's fiction inspired by the event.

## 3. 14 ready premises

Each has a hook line, a clock and a Part 1 vote. Build any of them.

| # | Title | Hook (line 1) | Clock | Part 1 vote |
|---|---|---|---|---|
| 1 | **SUNDOWN** | Every night, something eight feet tall comes out of these woods. And it runs faster than a car. | NIGHT 7 · sundown | ON / OFF (the porch light) |
| 2 | **THE WHEEL** | It's eleven at night. You're at the top of a Ferris wheel. And the carnival below you just closed. | TO THE GROUND 6 → 0 (one car per hour) | CLIMB / STAY |
| 3 | **LAST CAR** | Tap. Tap. Tap. Something is knocking on the windows of your train. | DARK CARS 1 → 7 | RUN / STAY |
| 4 | **LOW TIDE** | Every night at low tide, the sea pulls back. And things walk out of it. | TIDE 2.1 m → 0.0 m | FIX / CROSS |
| 5 | **3:33** | At three thirty-three every night, a car with no headlights pulls into your gas station. | 3:31 → 3:34 AM | GO / DARK |
| 6 | **ROW ONE** | Every night, the scarecrow in your grandpa's cornfield moves one row closer to the house. | ROWS LEFT 1 · sunset | DRAG / BURN |
| 7 | **IMMUNE** | Three days ago, a zombie bit you. You never turned. | DAY 9 | GO / HIDE (to the soldiers) |
| 8 | **WHITEOUT** | It's July 14th. Ninety-eight degrees. In one hour, it will be snowing. | TEMP 98°F → 9°F | OPEN / LOCK (the lobby doors) |
| 9 | **3:07 AM** | Your doorbell camera shows someone at your door at 3:07 AM. It's you. | the clock on the camera | OPEN / HIDE |
| 10 | **THE LINE** | You're a riot police officer. And the girl in front of your shield is your little sister. | TIME 4:00 PM · GAS IN 10 | HOLD / STEP |
| 11 | **HIGH WATER** | Your prison cell is flooding at midnight. Your cellmate can't climb. | WATER LEVEL | PULL / DROP |
| 12 | **TEN MINUTES AHEAD** | On your first night shift, Camera Three shows what happens ten minutes from now. | the camera's clock vs the real clock | STAY / RUN |
| 13 | **THE GETAWAY** | Your brother offers you a million dollars to keep driving. The cop who pulls you over is your dad. | the cop walking to the window | DRIVE / STOP |
| 14 | **THE BACKYARD** | A man was just found dead in your backyard. You're the detective on the case. | time since the body was found | (two suspects to question first) |

Full line-by-line Part 1 scripts for THE WHEEL, LAST CAR, LOW TIDE, 3:33 and ROW ONE are in `examples/script-pitches.md`. The complete, buildable SUNDOWN Part 1 is in `examples/sundown-part1/`.

## 4. The series bible

Keep one `bible.md` per story, and update it every part:

```markdown
# <Title> — series bible

**Logline:** <one breath>
**Tone:** <e.g. quiet dread, no gore; creatures are silhouettes; bites are bruises>
**Style:** stick figures (kit.js). "You" = <look, e.g. red beanie>. Threat = <look>.
**Voices:** narrator Liam (tempo 1.15). <CHARACTER> = <voice> (<fx>), caption tag <TAG>.

## Cast
| Key | Look | Role |

## Rules of the world
- <how the threat works, in plain sentences>

## Canon (what viewers have seen)
- Part 1 (<vote result + counts>): <beats, the clue>
- Part 2 …

## Writers' room only (not revealed yet)
- <the answers you're building toward>

## Branch starts (for the vote that's open now)
- **OPTION A:** <first beat of next part>
- **OPTION B:** <first beat of next part>

## Season arc
| Part | Tentpole | Vote |
```

## 5. A 6-part season arc

| Part | Job |
|---|---|
| 1 | The premise, the rules, the person you love, the first impossible choice. Plant the season mystery. |
| 2 | The consequence. The first real answer. A new ally or suspect. |
| 3 | The world gets bigger (you're not the only one). A betrayal or a lie revealed. |
| 4 | The midpoint twist: what you believed about the threat or the rules is wrong. |
| 5 | The worst choice: the cure or your family, freedom or the person you love. |
| 6 | The finale: the clock hits zero; the season mystery is answered; one door left open. |

Plan the arc loosely and write only the winning branch, part by part. The audience is your co-writer.
