// stickman-story-reels · runtime.js — word-timed captions, HUD pills, motion helpers.
// reel.py build inlines this after kit.js + scenes.js; every time it receives is already in seconds.
const TM = JSON.parse(document.getElementById("timing").textContent);
const CFG = JSON.parse(document.getElementById("config").textContent);
const LINE = Object.fromEntries(TM.lines.map((l) => [l.id, l]));
const END = +document.getElementById("root").dataset.duration;
const tl = gsap.timeline({ paused: true });
// each set's ids get a per-scene suffix, so the same set can appear twice in one reel
const uniq = (svg, sfx) => svg.replace(/id="([^"]+)"/g, 'id="$1-' + sfx + '"').replace(/url\(#([^)]+)\)/g, "url(#$1-" + sfx + ")");

const kb = (sel, t0, t1, from = 1, to = 1.06, origin = "50% 50%") =>
  tl.fromTo(sel, { scale: from, transformOrigin: origin }, { scale: to, duration: Math.max(0.1, t1 - t0), ease: "none" }, t0);
const pop = (sel, t, extra = {}) => tl.fromTo(sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.4)", ...extra }, t);
const rise = (sel, t, d = 0.45) => tl.fromTo(sel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: d, ease: "power3.out" }, t);
const stampIn = (sel, t, rot = -8) => tl.fromTo(sel, { opacity: 0, scale: 2.3, rotation: rot - 7 }, { opacity: 1, scale: 1, rotation: rot, duration: 0.26, ease: "power4.in" }, t);

// captions: short phrases, one word lit at a time; dialogue takes the speaker's colour + a small tag above it
const HL = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#F5C542";
function buildCaptions() {
  const root = document.getElementById("captions");
  TM.lines.forEach((l, li) => {
    const sp = (CFG.speakers || {})[l.speaker] || {};
    const base = sp.color || "#FFFFFF";
    l.chunks.forEach((c, ci) => {
      const el = document.createElement("div");
      el.className = "cap";
      el.style.color = base;
      if (sp.tag) { const tg = document.createElement("div"); tg.className = "ctag"; tg.textContent = sp.tag; el.appendChild(tg); }
      c.forEach((wd) => { const s = document.createElement("span"); s.textContent = wd.w; el.appendChild(s); });
      root.appendChild(el);
      const next = ci < l.chunks.length - 1 ? l.chunks[ci + 1][0].t : (TM.lines[li + 1] ? Math.min(TM.lines[li + 1].start, l.end + 0.45) : END - 0.2);
      const start = c[0].t - 0.04, end = next - 0.05;
      tl.set(el, { opacity: 1 }, start);
      tl.fromTo(el, { y: 14, scale: 0.94 }, { y: 0, scale: 1, duration: 0.14, ease: "power2.out" }, start);
      const spans = el.querySelectorAll("span");
      c.forEach((wd, i) => {
        tl.set(spans[i], { color: HL }, wd.t - 0.02);
        tl.set(spans[i], { color: base }, i < c.length - 1 ? c[i + 1].t - 0.02 : end);
      });
      tl.set(el, { opacity: 0 }, end);
    });
  });
}

// HUD pill whose value steps through [[value, time, {flash, hot}], ...] (seek-safe stacked spans)
function hudSteps(pillId, steps) {
  const pill = document.getElementById(pillId);
  const v = pill.querySelector(".v");
  steps.forEach(([val, t, o = {}], i) => {
    const s = document.createElement("span");
    s.textContent = val;
    if (o.hot) s.className = "hot";
    v.appendChild(s);
    tl.set(s, { opacity: 1 }, t);
    if (i < steps.length - 1) tl.set(s, { opacity: 0 }, steps[i + 1][1]);
    if (o.flash) {
      tl.fromTo(pill.querySelector(".flash"), { opacity: 0.9 }, { opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, t);
      tl.fromTo(pill, { scale: 1 }, { scale: 1.18, duration: 0.15, repeat: 3, yoyo: true, immediateRender: false }, t);
    }
  });
}

// lip flap / talk light: show `sel` while each word of the given lines is spoken
function talk(sel, ids) {
  const el = document.querySelector(sel);
  if (!el) return;
  ids.forEach((id) => {
    const ws = LINE[id].chunks.flat();
    ws.forEach((w, i) => {
      const nx = i < ws.length - 1 ? ws[i + 1].t : LINE[id].end;
      const on = w.t - 0.02, off = Math.max(on + 0.07, Math.min(nx - 0.05, w.t + Math.max(0.12, (nx - w.t) * 0.65)));
      tl.set(el, { opacity: 1 }, on);
      tl.set(el, { opacity: 0 }, off);
    });
  });
}
