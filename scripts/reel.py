#!/usr/bin/env python3
"""reel.py — turn an episode.json into an animated stick-figure story reel (1080×1920 MP4, ready for Reels/TikTok/Shorts).

  python3 reel.py new    <dir> [--title "My Story — Part 1"]   scaffold a reel folder (episode.json + scenes.js starter)
  python3 reel.py voice  <dir> [--draft]                      voiceover + word timings (ElevenLabs; --draft = free, silent)
  python3 reel.py sound  <dir>                                synthesize the sound effects + the ambient bed
  python3 reel.py build  <dir>                                compile index.html + cover + POST.md
  python3 reel.py check  <dir>                                HyperFrames lint / layout / contrast gate
  python3 reel.py snap   <dir> --at 1,5.5,12                  PNG stills straight from the composition (no render needed)
  python3 reel.py render <dir> [--draft]                      MP4 at -14 LUFS + renders/cover.png + renders/contact-sheet.png
  python3 reel.py all    <dir> [--draft]                      voice → sound → build → check → render
  python3 reel.py frames <dir> [--every 2]                    a contact sheet from the rendered MP4, for review

Needs Python 3.9+, ffmpeg/ffprobe, Node 18+ (npx downloads HyperFrames the first time).
ElevenLabs key: ELEVENLABS_API_KEY in the environment or in a .env file next to the reel (or any folder above it).
"""
import argparse, base64, hashlib, html, json, math, os, re, shutil, subprocess, sys, urllib.error, urllib.request, wave
from array import array
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
ASSETS = SKILL / "assets"
sys.path.insert(0, str(HERE))
import synth  # noqa: E402

HF = os.environ.get("REEL_HYPERFRAMES", "hyperframes@0.8.174")   # pinned so a reel re-renders the same way next month
NPX = shutil.which("npx") or shutil.which("npx.cmd") or "npx"       # npx.cmd on Windows
GSAP = "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"
FONTS = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;700&family=Montserrat:wght@600;900&display=block"
SR = 44100
E = html.escape

# ElevenLabs premade voices (any account). Custom/library voices: put the voice id, or the exact name (looked up via the API).
PREMADE = {"roger": "CwhRBWXzGAHq8TQ4Fs17", "sarah": "EXAVITQu4vr4xnSDxMaL", "laura": "FGY2WhTYpPnrIDTdsKH5", "charlie": "IKne3meq5aSn9XLyUdCD",
           "george": "JBFqnCBsd6RMkjVDRZzb", "callum": "N2lVS1w4EtoT3dr4eOWO", "river": "SAz9YHcvj6GT2YYXdXww", "harry": "SOYHLrjzK2X1ezoPC6cr",
           "liam": "TX3LPaxmHKxFdv7VOQHJ", "alice": "Xb7hH8MSUJpSbSDYk0k2", "matilda": "XrExE9yKIg1WjnnlVkGX", "will": "bIHbv24MWmeRgasZH58o",
           "jessica": "cgSgspJ2msm6clMCkdW9", "eric": "cjVigY5qzO86Huf0OWal", "bella": "hpp4J3VqNfWAUOO0d1Us", "chris": "iP95p4xoKVk53GoZ742B",
           "brian": "nPczCjzI2devNBz1zQrb", "daniel": "onwK4e9ZLuTAKqWW03F9", "lily": "pFZP5JQG7iQjIQuC4Bku", "adam": "pNInz6obpgDQGcFmaJgB",
           "bill": "pqHfZKP75CvOlQylNhV4"}
FX = {"phone": "highpass=f=350,lowpass=f=3200,acompressor=threshold=-20dB:ratio=3,volume=1.2",
      "intercom": "highpass=f=300,lowpass=f=3600,equalizer=f=1900:t=q:w=1.1:g=4,acompressor=threshold=-22dB:ratio=3:attack=5:release=80,volume=1.25",
      "radio": "highpass=f=450,lowpass=f=2700,equalizer=f=1500:t=q:w=1.0:g=6,acrusher=bits=10:mix=0.25,acompressor=threshold=-24dB:ratio=4:attack=3:release=60,volume=1.35",
      "muffled": "lowpass=f=900,volume=1.4"}
TAG = re.compile(r"\[[^\]]*\]\s*")
PACE = {"tempo": 1.15, "gap": 0.25, "scene_gap": 0.4, "end": 2.0, "lead": 0.3}


def die(msg):
    sys.exit("✗ " + msg)


def run(cmd, cwd=None, quiet=False):
    env = dict(os.environ)
    r = subprocess.run([str(c) for c in cmd], cwd=cwd, env=env, text=True,
                       stdout=subprocess.PIPE if quiet else None, stderr=subprocess.STDOUT if quiet else None)
    if r.returncode:
        die(f"command failed: {' '.join(map(str, cmd))}" + (f"\n{(r.stdout or '')[-1500:]}" if quiet else ""))
    return r.stdout or ""


def load(d):
    p = d / "episode.json"
    if not p.exists():
        die(f"{p} not found (start with: python3 reel.py new {d})")
    try:
        return json.loads(p.read_text())
    except json.JSONDecodeError as e:
        die(f"episode.json is not valid JSON: {e}")


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def pace(ep):
    return {**PACE, **ep.get("pace", {})}


# ---------------------------------------------------------------- lines
def lines_of(ep):
    out = []
    for k, sc in enumerate(ep.get("scenes", [])):
        sc.setdefault("id", f"s{k + 1}")
        says = sc.get("say", [])
        says = [says] if isinstance(says, (str, dict)) else says
        if not says:
            die(f"scene {sc['id']} needs at least one line in \"say\"")
        sc["_lines"] = []
        for j, s in enumerate(says):
            s = {"text": s} if isinstance(s, str) else dict(s)
            lid = f"L{len(out) + 1:02d}"
            out.append({"id": lid, "scene": sc["id"], "text": s["text"].strip(), "speaker": s.get("speaker", "narrator"),
                        "pause": s.get("pause"), "last_in_scene": j == len(says) - 1})
            sc["_lines"].append(lid)
    if not out:
        die("episode.json has no scenes")
    return out


def voice_cfg(ep, speaker):
    v = ep.get("voices", {}).get(speaker)
    if v is None and speaker != "narrator":
        die(f"speaker '{speaker}' isn't in episode.json \"voices\"")
    return {"voice": "Liam", **(v or {})}


# ---------------------------------------------------------------- voice
def el_key(d):
    k = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("XI_API_KEY")
    if k:
        return k
    for folder in [d, *d.parents, Path.cwd(), *Path.cwd().parents]:
        f = folder / ".env"
        if f.exists():
            for row in f.read_text().splitlines():
                m = re.match(r"\s*(?:export\s+)?(ELEVENLABS_API_KEY|XI_API_KEY)\s*=\s*['\"]?([^'\"\s#]+)", row)
                if m:
                    return m.group(2)
    return None


def el_api(path, key, body=None):
    req = urllib.request.Request("https://api.elevenlabs.io" + path, data=json.dumps(body).encode() if body else None,
                                 headers={"xi-api-key": key, "Content-Type": "application/json"}, method="POST" if body else "GET")
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


_custom = {}


def voice_id(name, key):
    if re.fullmatch(r"[A-Za-z0-9]{20}", name):
        return name
    if name.lower() in PREMADE:
        return PREMADE[name.lower()]
    if not _custom:
        try:
            _custom.update({v["name"].lower(): v["voice_id"] for v in el_api("/v1/voices", key)["voices"]})
        except urllib.error.HTTPError as e:
            die(f"voice '{name}' isn't a premade voice, and the key can't list your voices ({e.code}). Use the voice id instead.")
    hit = _custom.get(name.lower()) or next((i for n, i in _custom.items() if n.startswith(name.lower())), None)
    return hit or die(f"voice '{name}' not found. Premade: {', '.join(sorted(PREMADE))}")


def words_from_alignment(al):
    chars, starts = al.get("characters", []), al.get("character_start_times_seconds", [])
    words, cur, t0, depth = [], "", 0.0, 0
    for c, t in zip(chars, starts):
        if c == "[":
            depth += 1; continue
        if c == "]":
            depth = max(0, depth - 1); continue
        if depth:
            continue
        if c.isspace():
            if cur:
                words.append([cur, t0]); cur = ""
            continue
        if not cur:
            t0 = t
        cur += c
    if cur:
        words.append([cur, t0])
    return words


def draft_words(text):
    toks, t, out = TAG.sub("", text).split(), 0.05, []
    for w in toks:
        out.append([w, t])
        t += 0.113 + 0.049 * len(re.sub(r"\W", "", w))   # ≈ ElevenLabs Liam at tempo 1.0 (draft runs within a few % of real)
        t += 0.3 if w[-1] in ".?!" else 0.17 if w[-1] in ",;:—" else 0
    return out, t + 0.1


def apply_captions(words, repl):
    """spoken tokens -> display tokens, e.g. {"fourteen.": "14.", "a hundred kilometers": "100 km"}"""
    for spoken, shown in repl.items():
        sp, sh = spoken.split(), shown.split()
        i = 0
        while i + len(sp) <= len(words):
            if [w for w, _ in words[i:i + len(sp)]] == sp:
                times = [t for _, t in words[i:i + len(sp)]]
                words[i:i + len(sp)] = [[tok, times[min(k, len(times) - 1)]] for k, tok in enumerate(sh)]
                i += len(sh)
            else:
                i += 1
    return words


def chunks(words):
    out, cur = [], []
    for w, t in words:
        cur.append({"w": w, "t": round(t, 3)})
        if len(cur) >= 3 or re.search(r"[.?!,;:—]$", w):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return out


def wav_frames(path):
    with wave.open(str(path)) as w:
        if w.getnchannels() != 1 or w.getframerate() != SR or w.getsampwidth() != 2:
            die(f"{path}: expected 44.1 kHz mono 16-bit")
        return w.readframes(w.getnframes())


def cmd_voice(d, draft=False):
    ep = load(d); lines = lines_of(ep); P = pace(ep)
    tempo, model = float(P["tempo"]), ep.get("tts_model", "eleven_v3")
    key = None if draft else el_key(d)
    if not draft and not key:
        die("no ElevenLabs key. Put ELEVENLABS_API_KEY=... in a .env file next to the reel (or export it), or run with --draft for a free silent timing pass.")
    vo = d / "vo"; (vo / "cache").mkdir(parents=True, exist_ok=True); (vo / "lines").mkdir(exist_ok=True)
    (d / "assets/audio").mkdir(parents=True, exist_ok=True)
    spent = 0
    for item in lines:
        v = voice_cfg(ep, item["speaker"])
        settings = {"stability": v.get("stability", 0.5), "similarity_boost": 0.75}
        if draft:
            words, dur = draft_words(item["text"])
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{dur / tempo:.3f}", "-ac", "1", "-ar", str(SR), vo / "lines" / f"{item['id']}.wav"])
            item["_words"] = [[w, t / tempo] for w, t in words]
            print(f"  {item['id']} draft {dur / tempo:5.2f}s  {item['speaker']}")
            continue
        sig = hashlib.sha1(json.dumps({"t": item["text"], "v": v.get("voice", "Liam"), "m": v.get("model", model), "s": settings}, sort_keys=True).encode()).hexdigest()[:14]
        mp3, aj = vo / "cache" / f"{sig}.mp3", vo / "cache" / f"{sig}.json"
        if not (mp3.exists() and aj.exists()):
            vid = voice_id(v.get("voice", "Liam"), key)
            body = {"text": item["text"], "model_id": v.get("model", model), "voice_settings": settings}
            try:
                r = el_api(f"/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128", key, body)
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:300]
                if "quota" in msg:
                    die(f"ElevenLabs credits ran out at {item['id']}. Lines already voiced are cached; top up and run voice again.")
                print(f"  {body['model_id']} refused ({e.code}); retrying {item['id']} with eleven_multilingual_v2, delivery tags removed")
                body = {"text": TAG.sub("", item["text"]), "model_id": "eleven_multilingual_v2", "voice_settings": settings}
                r = el_api(f"/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128", key, body)
            mp3.write_bytes(base64.b64decode(r["audio_base64"]))
            aj.write_text(json.dumps(r.get("alignment") or r.get("normalized_alignment") or {}))
            spent += len(body["text"])
        af = ",".join(x for x in [FX.get(v.get("fx", "")), f"atempo={tempo}"] if x)
        run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af", af, "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", vo / "lines" / f"{item['id']}.wav"])
        words = words_from_alignment(json.loads(aj.read_text()))
        if not words:   # no alignment: spread the words by length across the clip
            dw, _ = draft_words(item["text"]); words = dw
        item["_words"] = [[w, t / tempo] for w, t in words]
        print(f"  {item['id']} {v.get('voice', 'Liam'):8s} {item['speaker']}")
    # join the lines with pauses into one narration track + timing.json
    P_gap, P_scene, P_end, lead = float(P["gap"]), float(P["scene_gap"]), float(P["end"]), float(P["lead"])
    out, t, tl = bytearray(), lead, []
    out += bytes(2 * int(lead * SR))
    repl = ep.get("captions", {})
    for k, item in enumerate(lines):
        fr = wav_frames(vo / "lines" / f"{item['id']}.wav")
        dur = len(fr) / 2 / SR
        words = apply_captions([[w, t + wt] for w, wt in item["_words"]], repl)
        tl.append({"id": item["id"], "scene": item["scene"], "speaker": item["speaker"], "start": round(t, 3), "end": round(t + dur, 3), "chunks": chunks(words)})
        out += fr; t += dur
        gap = item["pause"] if item["pause"] is not None else (P_end if k == len(lines) - 1 else P_scene if item["last_in_scene"] else P_gap)
        if k == len(lines) - 1:
            gap = max(gap, P_end)
        out += bytes(2 * int(gap * SR)); t += gap
    with wave.open(str(d / "assets/audio/narration.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(out))
    (d / "timing.json").write_text(json.dumps({"total": round(t, 3), "draft": draft, "lines": tl}, indent=1, ensure_ascii=False))
    print(f"✓ voice: {len(lines)} lines · {t:.1f}s{' (draft timing, silent)' if draft else ''}{f' · ~{spent} ElevenLabs characters spent' if spent else ''}")
    if t > 90.5:
        print(f"  ⚠ {t:.1f}s is over 90 s: cut lines (the playbook's limit for one part)")


# ---------------------------------------------------------------- timing references
class Clock:
    """'start' | 'end' | 'word' | 'word#2' (+0.3 / -0.2); 'sID:...' points into another scene; '0' = the very start; '12.5s' = 12.5 s into the reel"""

    def __init__(self, ep, d):
        tp = d / "timing.json"
        if not tp.exists():
            die("timing.json missing: run `reel.py voice` (or `voice --draft`) first")
        self.timing = json.loads(tp.read_text())
        self.lines = {l["id"]: l for l in self.timing["lines"]}
        self.END = math.ceil(self.timing["total"] * 10) / 10 + 0.1
        self.scenes = ep["scenes"]
        self.SC = {s["id"]: s for s in self.scenes}
        for k, sc in enumerate(self.scenes):
            sc["_start"] = 0.0 if k == 0 else max(0.0, self.lines[sc["_lines"][0]]["start"] - 0.08 - float(sc.get("lead", 0)))
        for k, sc in enumerate(self.scenes):
            sc["_end"] = self.scenes[k + 1]["_start"] if k + 1 < len(self.scenes) else self.END

    def at(self, sc, spec, default="start"):
        spec = str(spec if spec is not None else default).strip()
        if re.fullmatch(r"\d+(?:\.\d+)?s", spec):   # absolute seconds from the start of the reel
            return round(float(spec[:-1]), 3)
        if ":" in spec:
            sid, spec = spec.split(":", 1)
            sc = self.SC.get(sid) or die(f"no scene '{sid}' (in a time reference)")
        m = re.fullmatch(r"(.+?)([+-]\d+(?:\.\d+)?)?", spec)
        base, off = m.group(1).strip(), float(m.group(2) or 0)
        if base == "0":
            t = 0.0
        elif base == "start":
            t = sc["_start"]
        elif base == "end":
            t = sc["_end"]
        else:
            word, _, nth = base.partition("#")
            n = int(nth or 0)
            hits = [w for lid in sc["_lines"] for c in self.lines[lid]["chunks"] for w in c if norm(w["w"]) == norm(word)]
            if len(hits) <= n:
                said = " ".join(w["w"] for lid in sc["_lines"] for c in self.lines[lid]["chunks"] for w in c)
                die(f"scene {sc['id']}: \"{word}\"{f' #{n}' if n else ''} isn't spoken there (use the caption spelling). It says: {said}")
            t = hits[n]["t"]
        return round(max(0.0, t + off), 3)


# ---------------------------------------------------------------- sound
def cmd_sound(d):
    ep = load(d); lines_of(ep); clk = Clock(ep, d)
    lib = d / "assets/sfx"; lib.mkdir(parents=True, exist_ok=True)
    synth.library(lib)
    b = ep.get("bed")
    if b:
        cues = []
        for c in b.get("cues", [{"at": "0", "drone": 0.4, "wind": 0.3}]):
            at = str(c.get("at", "0"))
            sc = clk.SC[at.split(":", 1)[0]] if ":" in at else clk.scenes[0]
            cues.append({**{k: v for k, v in c.items() if k != "at"}, "t": clk.at(sc, at.split(":", 1)[1] if ":" in at else at)})
        synth.bed(d / "assets/audio/bed.wav", clk.END, cues)
    print(f"✓ sound: {len(synth.SOUNDS)} effects in assets/sfx" + (f" · bed {clk.END:.1f}s" if b else " · no bed (add \"bed\" to episode.json)"))


# ---------------------------------------------------------------- build
def hf_project(d, name):
    d.mkdir(parents=True, exist_ok=True)
    files = {"hyperframes.json": {"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"assets": "assets"}},
             "meta.json": {"id": name, "name": name},
             "package.json": {"name": re.sub(r"[^a-z0-9-]", "-", name.lower()) or "reel", "private": True, "type": "module",
                              "scripts": {"check": f"npx --yes {HF} check", "render": f"npx --yes {HF} render"}}}
    for f, v in files.items():
        if not (d / f).exists():
            (d / f).write_text(json.dumps(v, indent=2))


def theme_css(ep):
    th = ep.get("theme", {})
    m = {"accent": "--gold", "alert": "--red", "cream": "--cream", "ink": "--ink", "bg": "--bg", "bg_hi": "--bg-hi", "bg_lo": "--bg-lo"}
    return ":root{" + "".join(f"{m[k]}:{v};" for k, v in th.items() if k in m) + "}"


def scripts_js(d):
    own = d / "scenes.js"
    return (ASSETS / "kit.js").read_text() + "\n" + (own.read_text() if own.exists() else "") + "\n"


def wav_dur(p):
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


def cmd_build(d):
    ep = load(d); lines = lines_of(ep); clk = Clock(ep, d)
    hf_project(d, d.name)
    sections, motion, audio = [], [], []
    for k, sc in enumerate(clk.scenes):
        sid, a, b = sc["id"], sc["_start"], sc["_end"]
        S = a
        if sc.get("type") == "vote":
            opts, subs = sc.get("options", []), sc.get("subs", [])
            if len(opts) != 2:
                die(f"scene {sid}: a vote needs exactly two options")
            title = "".join(f"<div>{E(t)}</div>" for t in sc.get("title", ["FOLLOW &", "COMMENT BELOW"]))
            longest = max(len(o) for o in opts)
            fs = 68 if longest <= 6 else max(40, int(68 * 6.5 / longest))
            btns = "".join(f'<div class="btn" id="{sid}-o{q}" style="font-size:{fs}px;">{E(o)}{f"<div class=bsub>{E(subs[q])}</div>" if q < len(subs) else ""}</div>' for q, o in enumerate(opts))
            insets = ""
            for qi, ins in enumerate(sc.get("insets", [])):
                iid = f"{sid}-in{qi}"
                x, y, w, h = ins.get("box", [190, 200, 700, 500])
                col = ins.get("border", "var(--gold)")
                lbl = f'<div class="inlbl" style="color:{col}" data-layout-allow-overlap>{E(ins["label"])}</div>' if ins.get("label") else ""
                insets += (f'<div class="inset" id="{iid}" style="left:{x}px; top:{y}px; width:{w}px; height:{h}px; border-color:{col};">'
                           f'<svg id="{iid}-svg" viewBox="{ins.get("viewBox", "0 560 1080 771")}" preserveAspectRatio="xMidYMid slice"></svg>{lbl}</div>')
                motion.append(f'document.getElementById("{iid}-svg").innerHTML = uniq({ins["draw"]}, "{sid}in{qi}");')
                if ins.get("at"):
                    t = clk.at(sc, ins["at"])
                    motion.append(f'tl.fromTo("#{iid}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.25 }}, {t});')
                    for qp in range(qi):
                        motion.append(f'tl.to("#{sid}-in{qp}", {{ opacity: 0, duration: 0.2 }}, {t + 0.25});')
            wm = sc.get("wordmark", ep.get("wordmark", ""))
            inner = (f'<div class="end" id="{sid}-end">{insets}<div class="k" id="{sid}-k">{E(sc.get("kicker", ""))}</div><div class="t" id="{sid}-t">{title}</div>'
                     f'<div class="btns">{btns}</div><div class="wordmark" id="{sid}-wm">{E(wm)}</div></div>')
            motion.append(f'rise("#{sid}-k", {S}); rise("#{sid}-t", {S} + 0.1); tl.fromTo("#{sid}-wm", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.5 }}, {S} + 0.8);')
            early = clk.at(sc, sc["options_at"]) if sc.get("options_at") else None
            words = sc.get("option_words", [o.lower() for o in opts])
            for q in range(2):
                t = clk.at(sc, words[q])
                if early is not None:
                    motion.append(f'pop("#{sid}-o{q}", {early + 0.12 * q}); tl.to("#{sid}-o{q}", {{ scale: 1.06, duration: 0.3, repeat: 1, yoyo: true, ease: "sine.inOut" }}, {t - 0.05});')
                else:
                    motion.append(f'pop("#{sid}-o{q}", {t - 0.05});')
        else:
            draw = sc.get("draw") or die(f"scene {sid}: needs \"draw\" (a set function from scenes.js, e.g. \"myHook('scene')\") or \"type\": \"vote\"")
            kb = sc.get("kenburns", [1.0, 1.06, "50% 50%"])
            inner = f'<div class="kb" id="{sid}-kb"><svg id="{sid}-svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice"></svg></div>'
            motion.append(f'document.getElementById("{sid}-svg").innerHTML = uniq({draw}, "{sid}");')
            motion.append(f'kb("#{sid}-kb", {a}, {b}, {kb[0]}, {kb[1]}, "{kb[2] if len(kb) > 2 else "50% 50%"}");')
        if "chip" in sc:
            c = sc["chip"]; t = clk.at(sc, c.get("at"), "start+0.15")
            inner += f'<div class="chip" id="{sid}-chip" style="left:{c.get("x", 80)}px; top:{c.get("y", 330)}px;">{E(c["text"])}</div>'
            motion.append(f'pop("#{sid}-chip", {t}, {{ rotation: {c.get("rot", -3)} }});')
        if "stamp" in sc:
            st = sc["stamp"]; t = clk.at(sc, st.get("at"), "start+0.5")
            bg = "background:var(--cream);" if st.get("solid") else ""
            inner += f'<div class="stamp" id="{sid}-stamp" style="left:{st.get("x", 240)}px; top:{st.get("y", 380)}px; {bg}">{E(st["text"])}</div>'
            motion.append(f'stampIn("#{sid}-stamp", {t} - 0.2, {st.get("rot", -7)});')
        for an in sc.get("animate", []):
            t = clk.at(sc, an.get("at"), "start")
            to = dict(an.get("to", {}))
            to.update({"duration": an.get("dur", 0.6), "ease": an.get("ease", "power2.inOut"), "immediateRender": False})
            if an.get("origin"):
                to["svgOrigin"] = an["origin"]
            sel = ", ".join(f"#{e.split(':', 1)[1].strip()}-{sid}{e.split(':', 1)[0].strip()}" if ":" in e else f"#{e.strip()}-{sid}"
                            for e in str(an["el"]).split(","))   # "in1:ringId" = an element inside the vote's second inset
            motion.append(f'tl.to("{sel}", {json.dumps(to)}, {t});')
        for tk in sc.get("talk", []):
            ids = [l for l in sc["_lines"] if next(x for x in lines if x["id"] == l)["speaker"] == tk.get("speaker", "narrator")]
            for e in str(tk["el"]).split(","):
                motion.append(f'talk("#{e.strip()}-{sid}", {json.dumps(ids)});')
        sections.append(f'<section id="{sid}" class="scene clip" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1">{inner}</section>')

    # sound: hand-placed effects + the bed
    for n, cue in enumerate(ep.get("sfx", [])):
        at = str(cue["at"])
        sc = clk.SC[at.split(":", 1)[0]] if ":" in at else clk.scenes[0]
        t = clk.at(sc, at.split(":", 1)[1] if ":" in at else at)
        src = d / "assets/sfx" / f"{cue['sound']}.wav"
        if not src.exists():
            src = d / cue["sound"] if (d / cue["sound"]).exists() else die(f"sound '{cue['sound']}' not found (run `reel.py sound`; names: {', '.join(synth.SOUNDS)})")
        rel = src.relative_to(d).as_posix()
        audio.append(f'<audio id="sfx{n:02d}" src="{rel}" data-start="{t:.3f}" data-duration="{wav_dur(src):.3f}" data-track-index="{12 + n % 4}" data-volume="{cue.get("vol", 0.5)}"></audio>')
    bed = ""
    if (d / "assets/audio/bed.wav").exists() and ep.get("bed"):
        bed = f'<audio id="bed" src="assets/audio/bed.wav" data-start="0" data-duration="{clk.END:.3f}" data-track-index="11" data-volume="{ep["bed"].get("volume", 0.5)}"></audio>'

    # HUD pills (times resolve against the first scene unless prefixed with a scene id)
    hud_html, hud_js = "", []
    first = clk.scenes[0]
    if ep.get("hud"):
        pills = ""
        for q, p in enumerate(ep["hud"]):
            pid = f"hud{q}"
            late = ' style="opacity:0"' if p.get("show_at") else ""
            pills += f'<div class="pill{" late" if late else ""}" id="{pid}"{late}><div class="flash"></div><div class="l">{E(p["label"])}</div><div class="v" style="width:{p.get("width", 140)}px;"></div></div>'
            if p.get("show_at"):
                hud_js.append(f'tl.fromTo("#{pid}", {{ opacity: 0, y: -30 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: false }}, {clk.at(first, p["show_at"])});')
            steps = []
            for st in p.get("steps", [[p.get("value", ""), "0"]]):
                if isinstance(st, dict) and "count" in st:
                    c0, c1, at0, at1 = st["count"]
                    t0, t1 = clk.at(first, at0), clk.at(first, at1)
                    nn = abs(int(c1) - int(c0)); dr = 1 if c1 >= c0 else -1
                    for kk in range(nn + 1):
                        steps.append([f"{int(c0) + dr * kk}{st.get('suffix', '')}", round(t0 + (t1 - t0) * kk / max(1, nn), 3), {"hot": bool(st.get("hot"))}])
                    continue
                val, at, *fl = st
                steps.append([str(val), clk.at(first, at), {"flash": "flash" in fl, "hot": "hot" in fl or "flash" in fl}])
            hud_js.append(f'hudSteps("{pid}", {json.dumps(steps)});')
            need = max(len(x[0]) for x in steps) * 22 + 10   # IBM Plex Mono 36 px ≈ 22 px a character
            pills = pills.replace(f'id="{pid}"{late}><div class="flash"></div><div class="l">{E(p["label"])}</div><div class="v" style="width:{p.get("width", 140)}px;">',
                                  f'id="{pid}"{late}><div class="flash"></div><div class="l">{E(p["label"])}</div><div class="v" style="width:{max(p.get("width", 0), need)}px;">')
        b = clk.scenes[-1]["_start"] if clk.scenes[-1].get("type") == "vote" else clk.END
        hud_html = f'<div id="hudWrap" class="clip" data-start="0" data-duration="{b:.3f}" data-track-index="5" style="position:absolute; inset:0;"><div id="hud">{pills}</div></div>'
        hud_js.insert(0, 'tl.fromTo("#hud .pill:not(.late)", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power3.out" }, 0.2);')
    tag_html = ""
    if ep.get("tag"):
        t1 = clk.scenes[1]["_start"] if len(clk.scenes) > 1 else clk.END
        tag_html = f'<div id="partTag" class="clip tag" data-start="0" data-duration="{t1:.3f}" data-track-index="6">{E(ep["tag"])}</div>'

    cfg = {"speakers": {k: {"color": v.get("color"), "tag": v.get("tag")} for k, v in ep.get("voices", {}).items() if k != "narrator"}}
    page = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>{E(ep.get('title', d.name))}</title>
    <link href="{FONTS}" rel="stylesheet" />
    <script src="{GSAP}"></script>
    <style>
{(ASSETS / 'base.css').read_text()}
{theme_css(ep)}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{clk.END:.3f}" data-width="1080" data-height="1920">
{chr(10).join('      ' + s for s in sections)}
      {hud_html}
      {tag_html}
      <div id="captions" class="clip" data-start="0" data-duration="{clk.END:.3f}" data-track-index="7"></div>
      <audio id="vo" src="assets/audio/narration.wav" data-start="0" data-duration="{wav_dur(d / 'assets/audio/narration.wav'):.3f}" data-track-index="10" data-volume="1"></audio>
      {bed}
{chr(10).join('      ' + x for x in audio)}
    </div>
    <script type="application/json" id="timing">{json.dumps(clk.timing, ensure_ascii=False)}</script>
    <script type="application/json" id="config">{json.dumps(cfg, ensure_ascii=False)}</script>
    <script>
{scripts_js(d)}
{(ASSETS / 'runtime.js').read_text()}
      buildCaptions();
{chr(10).join('      ' + m for m in motion)}
{chr(10).join('      ' + h for h in hud_js)}
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
    (d / "index.html").write_text(page)
    build_cover(d, ep)
    post_md(d, ep, lines)
    print(f"✓ build: {len(clk.scenes)} scenes · {len(lines)} lines · {len(audio)} sound cues · {clk.END:.1f}s → index.html")


def build_cover(d, ep):
    cv = ep.get("cover")
    if not cv:
        return
    cd = d / "cover"; hf_project(cd, d.name + "-cover")
    th = {"accent": "#F2A33A", "alert": "#E5484D", "cream": "#F2EEE6", "bg": "#0D1018", "bg_hi": "#1E2A3A", "bg_lo": "#05070B", **ep.get("theme", {})}
    opts = "".join(f'<div style="background:{th["cream"]}">{E(o)}</div>' for o in cv.get("options", []))
    line = E(cv.get("line", "")).replace("&lt;b&gt;", f'<b style="color:{th["alert"]}">').replace("&lt;/b&gt;", "</b>")
    (cd / "index.html").write_text(f"""<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<link href="{FONTS}" rel="stylesheet" /><script src="{GSAP}"></script>
<style>
  *{{margin:0;padding:0;box-sizing:border-box}} html,body{{width:1080px;height:1920px;overflow:hidden;background:{th['bg']}}}
  #root{{position:relative;width:1080px;height:1920px;overflow:hidden}}
  #art{{position:absolute;inset:0;width:1080px;height:1920px}}
  .stack{{position:absolute;left:30px;right:30px;top:290px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}}
  .n{{font:400 {cv.get('big_size', 140)}px/1 "Archivo Black";color:{th['accent']};text-shadow:0 8px 0 rgba(0,0,0,.45)}}
  .tag{{font:700 34px "IBM Plex Mono";letter-spacing:.16em;padding:10px 22px;border-radius:12px;background:{th['accent']};color:#17181C}}
  .k{{font:400 64px/1.04 "Archivo Black";color:{th['cream']}}}
  .s{{font:900 54px/1.05 Montserrat;color:#fff}}
  .v{{position:absolute;left:0;right:0;top:1530px;display:flex;justify-content:center;gap:28px}}
  .v div{{font:400 54px "Archivo Black";padding:14px 34px;border-radius:22px;border:5px solid #050505;box-shadow:0 9px 0 #050505;color:#17181C;min-width:300px;text-align:center}}
</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="1" data-width="1080" data-height="1920">
<svg id="art" class="clip" data-start="0" data-duration="1" data-track-index="1" viewBox="0 0 1080 1920"></svg>
<div class="stack clip" data-start="0" data-duration="1" data-track-index="2"><div class="n">{E(cv.get('big', ''))}</div>{f'<div class="tag">{E(cv["tag"])}</div>' if cv.get('tag') else ''}<div class="k">{E(cv.get('kicker', ''))}</div><div class="s">{line}</div></div>
<div class="v clip" data-start="0" data-duration="1" data-track-index="3">{opts}</div></div>
<script>
{scripts_js(d)}
const uniq = (svg, sfx) => svg.replace(/id="([^"]+)"/g, 'id="$1-' + sfx + '"').replace(/url\\(#([^)]+)\\)/g, "url(#$1-" + sfx + ")");
document.getElementById("art").innerHTML = uniq({cv.get('draw', 'sky("night")')}, "cv");
window.__timelines = window.__timelines || {{}}; window.__timelines["main"] = gsap.timeline({{ paused: true }});
</script></body></html>
""")


def post_md(d, ep, lines):
    po = ep.get("post", {})
    vote = next((s for s in ep["scenes"] if s.get("type") == "vote"), None)
    closes = None
    if po.get("vote_closes"):
        closes = datetime.fromisoformat(po["vote_closes"])
    elif po.get("posts_at"):
        closes = datetime.fromisoformat(po["posts_at"]) + timedelta(hours=float(po.get("vote_hours", 48)))
    caption, pinned = po.get("caption", "").strip(), po.get("pinned", "").strip()
    if vote and closes:
        hr = closes.hour % 12 or 12
        when = f"{closes:%a %b} {closes.day}, {hr}:{closes:%M %p} {po.get('tz_label') or closes.tzname() or ''}"
        utc = closes.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        vline = f"🗳️ Voting closes {when.strip()} ({utc}) · {ep.get('tag', ep.get('title', ''))} · {' or '.join(vote['options'])}"
        caption = caption.replace("{vote_line}", vline) if "{vote_line}" in caption else (caption + "\n\n" + vline if caption else vline)
        pinned = pinned.replace("{closes}", when.strip())
    elif vote:
        print("  ⚠ no post.posts_at / post.vote_closes: add one so the caption can say when the vote closes")
    (d / "POST.md").write_text(f"""# {ep.get('title', d.name)} — posting kit

**Video:** `renders/{d.name}.mp4` · **Cover:** `renders/cover.png`

## Caption
```
{caption}
```

## Pinned comment
```
{pinned}
```

## Alt text
{po.get('alt', '').strip()}

## Script
""" + "\n".join(f"- **{l['id']}** ({l['speaker']}): {l['text']}" for l in lines) + "\n")


# ---------------------------------------------------------------- check / snap / render / frames
def cmd_check(d):
    out = subprocess.run([NPX, "--yes", HF, "check"], cwd=d, text=True, capture_output=True)
    text = out.stdout + out.stderr
    keep = [l for l in text.splitlines() if re.search(r"✗|error\(s\)|Check (passed|failed)|text checks", l)]
    print("\n".join("  " + l.strip() for l in keep[-14:]) or text[-800:])
    ok = "Check passed" in text
    if not ok:
        print("✗ check failed: fix the errors above (JS errors, overflowing text, contrast under 3:1), then build + check again")
    return ok


def cmd_snap(d, at, out=None):
    if at == "scenes":   # two stills per shot: just after it starts, and its middle
        ep = load(d); lines_of(ep); clk = Clock(ep, d)
        at = ",".join(f"{t:.2f}" for sc in clk.scenes for t in (sc["_start"] + 0.4, (sc["_start"] + sc["_end"]) / 2))
    out = Path(out or d / "snaps")
    run([NPX, "--yes", HF, "snapshot", d, "--at", at, "--no-end", "-o", out], quiet=True)
    print(f"✓ stills in {out}")


def cmd_render(d, draft=False):
    rd = d / "renders"; rd.mkdir(exist_ok=True)
    raw, final = rd / f"{d.name}.raw.mp4", rd / f"{d.name}.mp4"
    print("  rendering (this takes a few minutes)…")
    run([NPX, "--yes", HF, "render", "-q", "draft" if draft else "high", "-o", raw], cwd=d, quiet=True)
    # two-pass loudness: measure, then normalise to -14 LUFS (the level Reels/TikTok/Shorts play at), peaks under -1.5 dBTP
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    m = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1]) if "{" in meas else {}
    ln = "loudnorm=I=-14:TP=-1.5:LRA=11" + (f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true" if m else "")
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", ln, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", final])
    raw.unlink(missing_ok=True)
    run(["ffmpeg", "-v", "error", "-y", "-i", final, "-vf", "fps=1/3,scale=216:-1,tile=8x4", "-frames:v", "1", rd / "contact-sheet.png"])
    if (d / "cover/index.html").exists():
        snaps = d / "cover/shot"
        shutil.rmtree(snaps, ignore_errors=True)
        run([NPX, "--yes", HF, "snapshot", d / "cover", "--at", "0.5", "--no-end", "-o", snaps], quiet=True)
        pngs = sorted(snaps.glob("*.png"))
        if pngs:
            shutil.copy(pngs[0], rd / "cover.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final], capture_output=True, text=True).stdout or 0)
    print(f"✓ {final} ({dur:.1f}s) · renders/cover.png · renders/contact-sheet.png")


def cmd_frames(d, every=2.0):
    mp4 = d / "renders" / f"{d.name}.mp4"
    if not mp4.exists():
        die("render first")
    out = d / "renders" / "review.png"
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)], capture_output=True, text=True).stdout or 0)
    n = max(1, math.ceil(dur / every)); rows = math.ceil(n / 8)
    run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", f"fps=1/{every},scale=240:-1,tile=8x{rows}", "-frames:v", "1", out])
    print(f"✓ {out}")


# ---------------------------------------------------------------- new
def cmd_new(d, title):
    if (d / "episode.json").exists():
        die(f"{d}/episode.json already exists")
    d.mkdir(parents=True, exist_ok=True)
    tpl = json.loads((SKILL / "examples/starter/episode.json").read_text())
    tpl["title"] = title or tpl["title"]
    (d / "episode.json").write_text(json.dumps(tpl, indent=2, ensure_ascii=False))
    shutil.copy(SKILL / "examples/starter/scenes.js", d / "scenes.js")
    hf_project(d, d.name)
    print(f"✓ {d}: edit episode.json + scenes.js, then:\n  python3 \"{Path(__file__).resolve()}\" all \"{d}\" --draft")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["new", "voice", "sound", "build", "check", "snap", "render", "all", "frames"])
    ap.add_argument("dir")
    ap.add_argument("--draft", action="store_true")
    ap.add_argument("--title")
    ap.add_argument("--at", default="scenes", help='comma-separated seconds, or "scenes" (two stills per shot)')
    ap.add_argument("--every", type=float, default=2.0)
    a = ap.parse_args()
    d = Path(a.dir).resolve()
    if a.cmd == "new":
        return cmd_new(d, a.title)
    if a.cmd in ("voice", "all"):
        cmd_voice(d, a.draft)
    if a.cmd in ("sound", "all"):
        cmd_sound(d)
    if a.cmd in ("build", "all"):
        cmd_build(d)
    if a.cmd in ("check", "all"):
        if not cmd_check(d):
            sys.exit(1)
    if a.cmd == "snap":
        cmd_snap(d, a.at)
    if a.cmd in ("render", "all"):
        cmd_render(d, a.draft)
    if a.cmd == "frames":
        cmd_frames(d, a.every)


if __name__ == "__main__":
    main()
