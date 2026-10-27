#!/usr/bin/env python3
"""synth.py — every sound in a reel, synthesized in code (Python standard library only, no samples, no licences).

  library(dir)                      writes the sound-effect library into dir/*.wav (once; skipped if present)
  bed(path, total, cues, style)     writes the ambient bed: drone / wind / pulse / hum layers, levels automated by cues

Effects: heartbeat, hit, pulse, whoosh, click, tap, knock, slam, static, riser, sting, buzz, creak, squeak, engine, glitch,
splash, wave, whistle. Bed layers: drone, wind, pulse, hum, water.
Everything is seeded, so the same episode always sounds the same.
"""
import math, random, sys, wave
from array import array

SR = 44100


def _write(path, x, sr=SR, peak=0.89):
    m = max(1e-9, max(abs(v) for v in x))
    g = peak / m
    pcm = array("h", (int(max(-1.0, min(1.0, v * g)) * 32767) for v in x))
    if sys.byteorder == "big":
        pcm.byteswap()
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def _n(sec):
    return int(sec * SR)


def _lowpass(x, cut, sr=SR):
    a = math.exp(-2 * math.pi * cut / sr); y, out = 0.0, []
    for v in x:
        y = (1 - a) * v + a * y; out.append(y)
    return out


def _highpass(x, cut, sr=SR):
    lp = _lowpass(x, cut, sr)
    return [a - b for a, b in zip(x, lp)]


def _noise(n, seed):
    R = random.Random(seed)
    return [R.uniform(-1, 1) for _ in range(n)]


def _thump(n, f0, f1, decay, t0=0, total=None):
    out = [0.0] * (total or n)
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = f1 + (f0 - f1) * math.exp(-t * 18)
        ph += 2 * math.pi * f / SR
        if t0 + i < len(out):
            out[t0 + i] += math.sin(ph) * math.exp(-t / decay)
    return out


def _add(a, b, at=0, g=1.0):
    for i, v in enumerate(b):
        if at + i < len(a):
            a[at + i] += v * g
    return a


def heartbeat():
    x = [0.0] * _n(1.1)
    _add(x, _thump(_n(0.35), 90, 48, 0.08), 0)
    _add(x, _thump(_n(0.35), 80, 44, 0.07), _n(0.27), 0.75)
    return x


def hit():
    x = _thump(_n(1.6), 110, 38, 0.45)
    nz = _lowpass(_noise(_n(0.08), 2), 1800)
    return _add(x, [v * math.exp(-i / _n(0.02)) for i, v in enumerate(nz)], 0, 0.6)


def pulse():
    return _thump(_n(0.9), 70, 40, 0.22)


def whoosh():
    n = _n(0.6); nz = _noise(n, 3); out, y = [], 0.0
    for i, v in enumerate(nz):
        t = i / n
        cut = 400 + 5200 * math.sin(math.pi * t) ** 2
        a = math.exp(-2 * math.pi * cut / SR)
        y = (1 - a) * v + a * y
        out.append(y * math.sin(math.pi * t) ** 1.5)
    return out


def click():
    n = _n(0.09)
    return [(math.sin(2 * math.pi * 2100 * i / SR) * 0.6 + random.Random(i).uniform(-1, 1) * 0.4) * math.exp(-i / _n(0.008)) for i in range(n)]


def tap():
    n = _n(0.14)
    return [(math.sin(2 * math.pi * 820 * i / SR) + 0.6 * math.sin(2 * math.pi * 1310 * i / SR)) * math.exp(-i / _n(0.018)) for i in range(n)]


def knock():
    x = [0.0] * _n(1.0)
    one = [(math.sin(2 * math.pi * 190 * i / SR) + 0.5 * math.sin(2 * math.pi * 290 * i / SR)) * math.exp(-i / _n(0.035)) for i in range(_n(0.2))]
    for k in range(3):
        _add(x, one, _n(0.05 + k * 0.27), 1.0 - 0.1 * k)
    return x


def slam():
    x = _thump(_n(1.0), 120, 45, 0.18)
    nz = _lowpass(_noise(_n(0.25), 5), 900)
    return _add(x, [v * math.exp(-i / _n(0.05)) for i, v in enumerate(nz)], 0, 1.2)


def static():
    n = _n(0.45); R = random.Random(7)
    nz = _highpass(_lowpass(_noise(n, 8), 3200), 900)
    gate = [1.0 if R.random() > 0.35 else 0.25 for _ in range(n // 400 + 1)]
    return [v * gate[i // 400] * (1 - i / n) ** 0.5 for i, v in enumerate(nz)]


def riser():
    n = _n(3.0); nz = _lowpass(_noise(n, 9), 2500); out, ph = [], 0.0
    for i in range(n):
        t = i / n
        ph += 2 * math.pi * (180 + 900 * t * t) / SR
        out.append((0.5 * math.sin(ph) + 0.5 * nz[i]) * t ** 2)
    return out


def sting():
    n = _n(2.4); fs = [110, 130.8, 155.6, 164.8]
    return [sum(math.sin(2 * math.pi * f * i / SR) for f in fs) / len(fs) * min(1, i / _n(0.01)) * math.exp(-i / _n(0.9)) for i in range(n)]


def buzz():
    x = [0.0] * _n(1.0)
    one = [(1 if math.sin(2 * math.pi * 165 * i / SR) > 0 else -1) * 0.5 * math.sin(math.pi * i / _n(0.32)) for i in range(_n(0.32))]
    _add(x, _lowpass(one, 900), 0); _add(x, _lowpass(one, 900), _n(0.45))
    return x


def creak():
    n = _n(1.3); R = random.Random(11); out, ph, j = [], 0.0, 0.0
    for i in range(n):
        t = i / n
        j += (R.uniform(-1, 1) - j) * 0.002
        f = 140 + 120 * math.sin(math.pi * t) + 40 * j
        ph += 2 * math.pi * f / SR
        saw = (ph / math.pi) % 2 - 1
        out.append(saw * math.sin(math.pi * t) * (0.6 + 0.4 * math.sin(2 * math.pi * 23 * i / SR)))
    return _lowpass(out, 2400)


def squeak():
    n = _n(0.7); out, ph = [], 0.0
    for i in range(n):
        t = i / n
        ph += 2 * math.pi * (1500 + 600 * math.sin(math.pi * t * 3)) / SR
        out.append(math.sin(ph) * math.sin(math.pi * t) * (0.5 + 0.5 * math.sin(2 * math.pi * 31 * i / SR)))
    return out


def engine():
    n = _n(2.2); out, ph = [], 0.0
    for i in range(n):
        t = i / n
        ph += 2 * math.pi * (38 + 22 * t) / SR
        v = math.sin(ph) + 0.5 * math.sin(2 * ph) + 0.25 * math.sin(3.01 * ph)
        out.append(v * min(1, t * 6) * min(1, (1 - t) * 4))
    return _lowpass(out, 700)


def glitch():
    n = _n(0.5); R = random.Random(13); out = []
    seg = [(R.choice([220, 440, 880, 1760, 0]), R.uniform(0.3, 1)) for _ in range(n // 900 + 1)]
    for i in range(n):
        f, a = seg[i // 900]
        out.append((1 if math.sin(2 * math.pi * f * i / SR) > 0 else -1) * a * 0.5 if f else R.uniform(-1, 1) * a * 0.4)
    return out


def splash():
    n = _n(1.2); nz = _noise(n, 15); out, y = [], 0.0
    for i, v in enumerate(nz):
        t = i / SR
        cut = 300 + 5000 * math.exp(-t * 5)
        a = math.exp(-2 * math.pi * cut / SR)
        y = (1 - a) * v + a * y
        out.append(y * math.exp(-t * 3.2) * min(1, t * 200))
    return _add(out, _thump(_n(0.4), 90, 50, 0.08), 0, 0.5)


def wave_wash():
    n = _n(2.6); nz = _noise(n, 16); out, y = [], 0.0
    for i, v in enumerate(nz):
        t = i / n
        a = math.exp(-2 * math.pi * (300 + 1400 * math.sin(math.pi * t)) / SR)
        y = (1 - a) * v + a * y
        out.append(y * math.sin(math.pi * t) ** 1.2)
    return out


def whistle():
    n = _n(0.9)
    return [math.sin(2 * math.pi * (2900 + 120 * math.sin(2 * math.pi * 28 * i / SR)) * i / SR) * min(1, i / _n(0.02)) * min(1, (n - i) / _n(0.05)) for i in range(n)]


SOUNDS = {"heartbeat": heartbeat, "hit": hit, "pulse": pulse, "whoosh": whoosh, "click": click, "tap": tap, "knock": knock,
          "slam": slam, "static": static, "riser": riser, "sting": sting, "buzz": buzz, "creak": creak, "squeak": squeak,
          "engine": engine, "glitch": glitch, "splash": splash, "wave": wave_wash, "whistle": whistle}


def library(d):
    for name, fn in SOUNDS.items():
        p = d / f"{name}.wav"
        if not p.exists():
            _write(p, fn())


# ---------------------------------------------------------------- the ambient bed
BED_SR = 22050
LAYERS = ("drone", "wind", "pulse", "hum", "water")


def bed(path, total, cues, seed=21):
    """cues: [{"t": seconds, "drone": 0..1, "wind": 0..1, "pulse": 0..1, "hum": 0..1, "water": 0..1, "ramp": seconds}]"""
    n = int(total * BED_SR)
    lvl = {k: 0.0 for k in LAYERS}
    plan = []   # (t, layer, target, ramp)
    for c in sorted(cues, key=lambda c: c["t"]):
        for k in LAYERS:
            if k in c:
                plan.append((c["t"], k, float(c[k]), float(c.get("ramp", 0.6))))
    R = random.Random(seed)
    out = [0.0] * n
    wind_y, wind_amp, wind_t = 0.0, 0.5, 0.0
    lap_y = 0.0
    ph = [0.0, 0.0, 0.0]
    block = 256
    for b0 in range(0, n, block):
        t = b0 / BED_SR
        cur = {}
        for k in LAYERS:   # the level each layer should be at, at time t (linear ramps toward each cue's target)
            v = 0.0
            for (ct, ck, target, ramp) in plan:
                if ck != k or ct > t:
                    continue
                frac = 1.0 if ramp <= 0 else min(1.0, (t - ct) / ramp)
                v = v + (target - v) * frac
            cur[k] = v
        for i in range(b0, min(n, b0 + block)):
            s = i / BED_SR
            x = 0.0
            if cur["drone"] > 0.001:
                lfo = 0.75 + 0.25 * math.sin(2 * math.pi * 0.07 * s)
                ph[0] += 2 * math.pi * 55 / BED_SR; ph[1] += 2 * math.pi * 82.6 / BED_SR; ph[2] += 2 * math.pi * 110.4 / BED_SR
                x += cur["drone"] * lfo * (0.5 * math.sin(ph[0]) + 0.3 * math.sin(ph[1]) + 0.2 * math.sin(ph[2])) * 0.9
            if cur["wind"] > 0.001:
                if s - wind_t > 0.5:
                    wind_t, wind_amp = s, 0.3 + 0.7 * R.random()
                a = math.exp(-2 * math.pi * (250 + 500 * wind_amp) / BED_SR)
                wind_y = (1 - a) * R.uniform(-1, 1) + a * wind_y
                x += cur["wind"] * wind_y * 3.2 * (0.6 + 0.4 * wind_amp)
            if cur["pulse"] > 0.001:
                p = s % 0.95
                if p < 0.32:
                    x += cur["pulse"] * math.sin(2 * math.pi * 52 * p) * math.exp(-p / 0.07) * 0.9
                q = (s - 0.27) % 0.95
                if q < 0.32:
                    x += cur["pulse"] * 0.7 * math.sin(2 * math.pi * 48 * q) * math.exp(-q / 0.06) * 0.9
            if cur["water"] > 0.001:   # lapping water: dark noise swelling every ~4.5 s
                lap_y = 0.985 * lap_y + 0.015 * R.uniform(-1, 1)
                swell = (0.5 + 0.5 * math.sin(2 * math.pi * 0.22 * s)) ** 2
                x += cur["water"] * lap_y * 9.0 * (0.35 + 0.65 * swell)
            if cur["hum"] > 0.001:
                x += cur["hum"] * (0.6 * math.sin(2 * math.pi * 60 * s) + 0.25 * math.sin(2 * math.pi * 120 * s)) * 0.35
            out[i] = x
    _write(path, out or [0.0], BED_SR, peak=0.5)
