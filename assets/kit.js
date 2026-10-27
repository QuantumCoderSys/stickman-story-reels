// ═══════════════════════════════════════════════════════════════════════════════════════════
// stickman-story-reels · kit.js  —  the drawing kit for 1080×1920 stick-figure story reels.
// Every function returns an SVG string. A "set" (one shot) is a function in your scenes.js that
// returns a full 1080×1920 drawing built from these pieces. Give anything you want to animate an
// id="..." (the build adds a per-scene suffix, so the same set can appear twice in one reel).
// Originally built for the PlotVote stories (@plotvote). Free to use, change and share (MIT).
// Friendly API at the bottom; the original engine functions it wraps are kept as-is above it.
// ═══════════════════════════════════════════════════════════════════════════════════════════
// ---- from the PlotVote engine: art.js ----
const INK = "#2B1D14";
const SKIN = "#FBF7F0";
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => n.toFixed(1);
function smooth(pts) {
  const n = pts.length;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
}
const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
function arm(points, color, width, hand = true) {
  const d = points.map((p, i) => (i ? "L" : "M") + f(p[0]) + "," + f(p[1])).join(" ");
  const e = points[points.length - 1];
  return `<path d="${d}" stroke="${INK}" stroke-width="${f(width + 8)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" stroke="${color}" stroke-width="${f(width)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${hand ? `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="${f(width * 0.5)}" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>` : ""}`;
}
// ---- from the PlotVote engine: scenes.js ----
function defsCommon() {
  return `<defs>
    <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".65"/></radialGradient>
    <radialGradient id="phoneGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#D6E8FF" stop-opacity=".75"/><stop offset="45%" stop-color="#9CC3FF" stop-opacity=".28"/><stop offset="100%" stop-color="#9CC3FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFD58A" stop-opacity=".85"/><stop offset="100%" stop-color="#FFB547" stop-opacity="0"/></radialGradient>
  </defs>`;
}
// ---- from the PlotVote engine: scenes-immune.js ----
const IM = {
  night: "#0B0E12", wood: "#4A3424", woodHi: "#6B4A32", woodDk: "#2A1E16", insul: "#5A3F2A", chalk: "#E9E4D6",
  olive: "#5B6B3A", oliveDk: "#3E4A28", khaki: "#C8B98A", red: "#E5484D", amber: "#F2C14E", paper: "#ECE6DA",
  sky: "#7A2A22", moon: "#C9D6E8", hoodie: "#3F5560", mono: "IBM Plex Mono",
};
function imText(x, y, txt, size, fill, o = {}) {
  return `<text x="${x}" y="${y}" font-family="${o.font || IM.mono}" font-weight="${o.weight || 700}" font-size="${size}" fill="${fill}" text-anchor="${o.anchor || "start"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.tf ? ` transform="${o.tf}"` : ""}>${txt}</text>`;
}
function imChip(x, y, txt, o = {}) {
  const size = o.size || 34, padX = size * 0.5, h = size * 1.5;
  const w = o.w || txt.length * size * 0.6 + padX * 2;
  const x0 = o.anchor === "end" ? x - w : o.anchor === "middle" ? x - w / 2 : x;
  return `<g${o.id ? ` id="${o.id}"` : ""}${o.hidden ? ' style="opacity:0"' : ""}><rect x="${f(x0)}" y="${y}" width="${f(w)}" height="${h}" rx="${size * 0.3}" fill="${o.bg || "rgba(6,8,10,.86)"}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="4"` : ""}/>${imText(x0 + padX, y + h * 0.71, txt, size, o.fg || IM.paper)}</g>`;
}
function imRing(cx, cy, rx, ry, color, id) {
  return `<g id="${id}" style="opacity:0"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#05070A" stroke-width="13" opacity=".6"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="20 11"/></g>`;
}
const imCam = (k, cx, cy) => `translate(${f(540 - k * cx)} ${f(960 - k * cy)}) scale(${k})`;
function imArrow(x, y, up, label, color) {
  return `<g transform="translate(${x} ${y})"><rect x="-150" y="-60" width="300" height="120" rx="14" fill="#1A2026" stroke="${color}" stroke-width="6"/>
    <path d="${up ? "M-125 20 L-100 -26 L-75 20Z" : "M-125 -20 L-100 26 L-75 -20Z"}" fill="${color}"/>${imText(45, 15, label, 40, color, { anchor: "middle" })}</g>`;
}
function imRadioDev(x, y, k, o = {}) {
  let s = `<g transform="translate(${x} ${y}) scale(${k})"><rect x="5" y="-130" width="14" height="66" rx="5" fill="#24272B" stroke="${INK}" stroke-width="3"/><rect x="-35" y="-70" width="70" height="140" rx="14" fill="#24272B" stroke="${INK}" stroke-width="6"/>`;
  for (let i = 0; i < 4; i++) s += `<path d="M-20 ${-10 + i * 16} H20" stroke="#3A3E44" stroke-width="5" stroke-linecap="round"/>`;
  s += `<circle cx="-15" cy="-44" r="9" fill="#5A5F66"/>`;
  if (o.led) s += `<g id="${o.led}" style="opacity:0"><circle cx="-15" cy="-44" r="9" fill="#9FE3C4"/><circle cx="-15" cy="-44" r="30" fill="#9FE3C4" opacity=".3"/></g>`;
  return s + `</g>`;
}
// ---- from the PlotVote engine: scenes-line.js ----
const LN = {
  ink: "#17181C", skin: "#F6F1E8", navy: "#1F2A44", navyHi: "#3A4D78", visor: "#0E1320", yellow: "#F2C230", vest: "#E8DF3A",
  red: "#D8433A", stone: "#D2C9B8", stoneDk: "#B3A994", bronze: "#6B6650", sky1: "#AEB6BF", sky2: "#E3DACB",
  bldg: "#E2D7C3", bldgDk: "#CDBFA6", win: "#4E5B6A", roof: "#5E6B79", hair: "#2A1D16", shield: "#BFD3E6",
};
function lnDir(a) { const r = (a * Math.PI) / 180; return [Math.sin(r), Math.cos(r)]; }   // 0 = straight down, +90 = right, 180 = up
const lnPt = (p, a, len) => { const d = lnDir(a); return [p[0] + d[0] * len, p[1] + d[1] * len]; };
const lnP = (pts) => pts.map((p, i) => (i ? "L" : "M") + f(p[0]) + " " + f(p[1])).join(" ");
function lnDefs() {
  return defsCommon() + `<defs>
    <linearGradient id="lnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${LN.sky1}"/><stop offset="1" stop-color="${LN.sky2}"/></linearGradient>
    <radialGradient id="lnSmokeG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F4F6F7" stop-opacity=".95"/><stop offset=".6" stop-color="#E4E8EA" stop-opacity=".7"/><stop offset="1" stop-color="#DDE2E5" stop-opacity="0"/></radialGradient>
    <radialGradient id="lnWarm" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFB25A" stop-opacity=".35"/><stop offset="1" stop-color="#FFB25A" stop-opacity="0"/></radialGradient>
    <linearGradient id="lnGlare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>`;
}
function sfig(o) {
  const s = o.s || 1, sw = (o.sw || 13) * s, x = o.x, y = o.y, ink = o.ink || LN.ink;
  const p = Object.assign({ lean: 0, la: [-22, -12], ra: [22, 12], ll: [-10, -4], rl: [10, 4] }, o.pose || {});
  const T = 112 * s, r = 36 * s, U = 56 * s, L = 54 * s, TH = 70 * s, SH = 68 * s;
  const hip = [x, y], neck = lnPt(hip, 180 + p.lean, T), sh = lnPt(neck, p.lean, 14 * s), head = lnPt(neck, 180 + p.lean, r + 5 * s);
  const eL = lnPt(sh, p.la[0], U), hL = lnPt(eL, p.la[1], L), eR = lnPt(sh, p.ra[0], U), hR = lnPt(eR, p.ra[1], L);
  const kL = lnPt(hip, p.ll[0], TH), fL = lnPt(kL, p.ll[1], SH), kR = lnPt(hip, p.rl[0], TH), fR = lnPt(kR, p.rl[1], SH);
  const line = (pts, w = sw) => `<path d="${lnP(pts)}" stroke="${ink}" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  let g = `<g${o.id ? ` id="${o.id}"` : ""}${o.opacity != null ? ` opacity="${o.opacity}"` : ""}>`;
  g += line([fL, kL, hip, kR, fR]);
  g += line([fL, [fL[0] - 16 * s, fL[1]]], sw * 0.9) + line([fR, [fR[0] + 16 * s, fR[1]]], sw * 0.9);
  if (o.shieldBack) g += lnShield(hL, s, o.shield);
  g += line([hip, neck]);
  if (o.vest) {
    const a = lnPt(neck, p.lean, 10 * s), b = lnPt(neck, p.lean, 78 * s), w = 30 * s;
    g += `<path d="M${f(a[0] - w)} ${f(a[1])} L${f(a[0] + w)} ${f(a[1])} L${f(b[0] + w * 1.1)} ${f(b[1])} L${f(b[0] - w * 1.1)} ${f(b[1])}Z" fill="${typeof o.vest === "string" ? o.vest : LN.vest}" stroke="${ink}" stroke-width="${f(sw * 0.45)}"/>
      <path d="M${f(a[0] - w * 1.05)} ${f((a[1] + b[1]) / 2 + 8 * s)} H${f(a[0] + w * 1.05)}" stroke="#C9CDD2" stroke-width="${f(7 * s)}"/>`;
  }
  if (o.armor) {
    const a = lnPt(neck, p.lean, 6 * s), b = lnPt(neck, p.lean, 84 * s), w = 34 * s;
    g += `<path d="M${f(a[0] - w)} ${f(a[1])} Q${f(a[0])} ${f(a[1] - 12 * s)} ${f(a[0] + w)} ${f(a[1])} L${f(b[0] + w * 0.9)} ${f(b[1])} L${f(b[0] - w * 0.9)} ${f(b[1])}Z" fill="${LN.navy}" stroke="${ink}" stroke-width="${f(sw * 0.45)}"/>`;
  }
  g += `<g${o.armL ? ` id="${o.armL}"` : ""}>${line([sh, eL, hL])}<circle cx="${f(hL[0])}" cy="${f(hL[1])}" r="${f(sw * 0.62)}" fill="${ink}"/></g>`;
  g += `<g${o.armR ? ` id="${o.armR}"` : ""}>${line([sh, eR, hR])}<circle cx="${f(hR[0])}" cy="${f(hR[1])}" r="${f(sw * 0.62)}" fill="${ink}"/>`;
  if (o.phone) g += lnPhone(hR, s, o.phone);
  if (o.sign) g += lnSign(hR, s, o.sign);
  if (o.flag) g += lnFlag(hR, s);
  g += `</g>`;
  if (o.shield && !o.shieldBack) g += lnShield(hL, s, o.shield);
  // head
  if (o.hair === "pony") g += `<path d="M${f(head[0] + r * 0.55)} ${f(head[1] - r * 0.6)} Q${f(head[0] + r * 1.9)} ${f(head[1] - r * 0.2)} ${f(head[0] + r * 1.35)} ${f(head[1] + r * 1.1)} Q${f(head[0] + r * 1.15)} ${f(head[1] + r * 0.3)} ${f(head[0] + r * 0.6)} ${f(head[1] - r * 0.1)}Z" fill="${LN.hair}" stroke="${ink}" stroke-width="${f(sw * 0.35)}"${o.ponyId ? ` id="${o.ponyId}"` : ""}/>`;
  g += `<circle cx="${f(head[0])}" cy="${f(head[1])}" r="${f(r)}" fill="${o.skin || LN.skin}" stroke="${ink}" stroke-width="${f(sw * 0.72)}"/>`;
  if (o.hair === "pony") g += `<path d="M${f(head[0] - r * 1.02)} ${f(head[1] - r * 0.05)} Q${f(head[0] - r * 0.9)} ${f(head[1] - r * 1.25)} ${f(head[0] + r * 0.2)} ${f(head[1] - r * 1.05)} Q${f(head[0] + r * 1.05)} ${f(head[1] - r * 0.85)} ${f(head[0] + r * 1.02)} ${f(head[1] - r * 0.1)} Q${f(head[0] + r * 0.4)} ${f(head[1] - r * 0.7)} ${f(head[0] - r * 0.2)} ${f(head[1] - r * 0.55)} Q${f(head[0] - r * 0.7)} ${f(head[1] - r * 0.45)} ${f(head[0] - r * 1.02)} ${f(head[1] - r * 0.05)}Z" fill="${LN.hair}" stroke="${ink}" stroke-width="${f(sw * 0.35)}"/>`;
  if (!o.back && !o.helmet) g += lnFace(head, r, o.expr || "neutral", o.look || 0, sw, ink);
  if (o.mask) g += `<path d="M${f(head[0] - r * 0.7)} ${f(head[1] + r * 0.05)} Q${f(head[0])} ${f(head[1] - r * 0.15)} ${f(head[0] + r * 0.7)} ${f(head[1] + r * 0.05)} Q${f(head[0] + r * 0.75)} ${f(head[1] + r * 0.75)} ${f(head[0])} ${f(head[1] + r * 0.95)} Q${f(head[0] - r * 0.75)} ${f(head[1] + r * 0.75)} ${f(head[0] - r * 0.7)} ${f(head[1] + r * 0.05)}Z" fill="#2C2F35" stroke="${ink}" stroke-width="${f(sw * 0.4)}"/><circle cx="${f(head[0])}" cy="${f(head[1] + r * 0.55)}" r="${f(r * 0.3)}" fill="#4A4E56" stroke="${ink}" stroke-width="${f(sw * 0.3)}"/>`;
  if (o.helmet) g += lnHelmet(head, r, sw, o.visor || "down", o.stripe, ink, o.glareId);
  if (o.scarf) {
    const c = typeof o.scarf === "string" ? o.scarf : LN.yellow, n = lnPt(neck, p.lean, 4 * s);
    g += `<path d="M${f(n[0] - 26 * s)} ${f(n[1] - 6 * s)} Q${f(n[0])} ${f(n[1] + 14 * s)} ${f(n[0] + 26 * s)} ${f(n[1] - 6 * s)} L${f(n[0] + 24 * s)} ${f(n[1] + 12 * s)} Q${f(n[0])} ${f(n[1] + 30 * s)} ${f(n[0] - 24 * s)} ${f(n[1] + 12 * s)}Z" fill="${c}" stroke="${ink}" stroke-width="${f(sw * 0.4)}"/>`;
    g += `<path${o.scarfId ? ` id="${o.scarfId}"` : ""} d="M${f(n[0] + 14 * s)} ${f(n[1] + 14 * s)} q${f(36 * s)} ${f(10 * s)} ${f(70 * s)} ${f(-6 * s)} l${f(4 * s)} ${f(20 * s)} q${f(-38 * s)} ${f(18 * s)} ${f(-70 * s)} ${f(6 * s)}Z" fill="${c}" stroke="${ink}" stroke-width="${f(sw * 0.4)}"/>`;
  }
  g += `</g>`;
  sfig.last = { head, r, neck, sh, handL: hL, handR: hR, hip };
  return g;
}
function lnFace(h, r, expr, look, sw, ink) {
  if (expr === "sleep") {   // closed eyes + a small calm mouth (added for the public kit)
    const ey = h[1] - r * 0.04;
    return [-1, 1].map((d) => `<path d="M${f(h[0] + d * r * 0.34 - r * 0.13)} ${f(ey)} q${f(r * 0.13)} ${f(r * 0.11)} ${f(r * 0.26)} 0" stroke="${ink}" stroke-width="${f(sw * 0.38)}" fill="none" stroke-linecap="round"/>`).join("")
      + `<path d="M${f(h[0] - r * 0.1)} ${f(h[1] + r * 0.42)} H${f(h[0] + r * 0.1)}" stroke="${ink}" stroke-width="${f(sw * 0.35)}" stroke-linecap="round"/>`;
  }
  const ex = [h[0] - r * 0.34 + look * r * 0.12, h[0] + r * 0.34 + look * r * 0.12], ey = h[1] - r * 0.06;
  const big = expr === "shout" || expr === "fear";
  let s = ex.map((x) => `<ellipse cx="${f(x)}" cy="${f(ey)}" rx="${f(r * (big ? 0.11 : 0.09))}" ry="${f(r * (big ? 0.16 : 0.13))}" fill="${ink}"/>`).join("");
  const bw = r * 0.22, by = ey - r * 0.3;
  if (expr === "worry" || expr === "fear") s += `<path d="M${f(ex[0] - bw)} ${f(by + r * 0.02)} L${f(ex[0] + bw * 0.7)} ${f(by - r * 0.1)} M${f(ex[1] + bw)} ${f(by + r * 0.02)} L${f(ex[1] - bw * 0.7)} ${f(by - r * 0.1)}" stroke="${ink}" stroke-width="${f(sw * 0.4)}" stroke-linecap="round"/>`;
  if (expr === "stern" || expr === "shout") s += `<path d="M${f(ex[0] - bw)} ${f(by - r * 0.08)} L${f(ex[0] + bw * 0.7)} ${f(by + r * 0.04)} M${f(ex[1] + bw)} ${f(by - r * 0.08)} L${f(ex[1] - bw * 0.7)} ${f(by + r * 0.04)}" stroke="${ink}" stroke-width="${f(sw * 0.4)}" stroke-linecap="round"/>`;
  const my = h[1] + r * 0.42;
  if (big) s += `<ellipse cx="${f(h[0] + look * r * 0.1)}" cy="${f(my)}" rx="${f(r * 0.18)}" ry="${f(r * 0.2)}" fill="${ink}"/>`;
  else if (expr === "worry") s += `<path d="M${f(h[0] - r * 0.2)} ${f(my + r * 0.04)} q${f(r * 0.1)} ${f(-r * 0.08)} ${f(r * 0.2)} 0 q${f(r * 0.1)} ${f(r * 0.08)} ${f(r * 0.2)} 0" stroke="${ink}" stroke-width="${f(sw * 0.35)}" fill="none" stroke-linecap="round"/>`;
  else if (expr === "stern") s += `<path d="M${f(h[0] - r * 0.2)} ${f(my)} H${f(h[0] + r * 0.2)}" stroke="${ink}" stroke-width="${f(sw * 0.38)}" stroke-linecap="round"/>`;
  else s += `<path d="M${f(h[0] - r * 0.2)} ${f(my - r * 0.03)} Q${f(h[0])} ${f(my + r * 0.12)} ${f(h[0] + r * 0.2)} ${f(my - r * 0.03)}" stroke="${ink}" stroke-width="${f(sw * 0.35)}" fill="none" stroke-linecap="round"/>`;
  return s;
}
function lnHelmet(h, r, sw, visor, stripe, ink, glareId) {
  let s = `<path d="M${f(h[0] - r * 1.12)} ${f(h[1] + r * 0.15)} Q${f(h[0] - r * 1.15)} ${f(h[1] - r * 1.25)} ${f(h[0])} ${f(h[1] - r * 1.25)} Q${f(h[0] + r * 1.15)} ${f(h[1] - r * 1.25)} ${f(h[0] + r * 1.12)} ${f(h[1] + r * 0.15)}Z" fill="${LN.navy}" stroke="${ink}" stroke-width="${f(sw * 0.6)}"/>`;
  s += `<path d="M${f(h[0] - r * 0.9)} ${f(h[1] - r * 0.95)} Q${f(h[0])} ${f(h[1] - r * 1.3)} ${f(h[0] + r * 0.6)} ${f(h[1] - r * 1.05)}" stroke="${LN.navyHi}" stroke-width="${f(sw * 0.5)}" fill="none" stroke-linecap="round"/>`;
  if (stripe) s += `<path d="M${f(h[0] - r * 1.1)} ${f(h[1] - r * 0.35)} Q${f(h[0])} ${f(h[1] - r * 0.6)} ${f(h[0] + r * 1.1)} ${f(h[1] - r * 0.35)}" stroke="#F2EEE6" stroke-width="${f(sw * 0.55)}" fill="none"/>`;
  if (visor === "down") {
    s += `<path d="M${f(h[0] - r * 1.05)} ${f(h[1] - r * 0.25)} Q${f(h[0])} ${f(h[1] - r * 0.45)} ${f(h[0] + r * 1.05)} ${f(h[1] - r * 0.25)} L${f(h[0] + r * 0.95)} ${f(h[1] + r * 0.75)} Q${f(h[0])} ${f(h[1] + r * 1.05)} ${f(h[0] - r * 0.95)} ${f(h[1] + r * 0.75)}Z" fill="${LN.visor}" fill-opacity=".9" stroke="${ink}" stroke-width="${f(sw * 0.5)}"/>`;
    s += `<g${glareId ? ` id="${glareId}"` : ""}><path d="M${f(h[0] - r * 0.7)} ${f(h[1] + r * 0.6)} L${f(h[0] - r * 0.25)} ${f(h[1] - r * 0.3)} L${f(h[0] - r * 0.05)} ${f(h[1] - r * 0.3)} L${f(h[0] - r * 0.5)} ${f(h[1] + r * 0.65)}Z" fill="#fff" opacity=".28"/></g>`;
  }
  return s + `<path d="M${f(h[0] - r * 1.15)} ${f(h[1] + r * 0.15)} H${f(h[0] + r * 1.15)}" stroke="${ink}" stroke-width="${f(sw * 0.6)}" stroke-linecap="round"/>`;
}
function lnShield(hand, s, text) {
  const w = 150 * s, h = 270 * s, x0 = hand[0] - w * 0.55, y0 = hand[1] - h * 0.55;
  return `<g><rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" rx="${f(18 * s)}" fill="${LN.shield}" fill-opacity=".42" stroke="${LN.ink}" stroke-width="${f(9 * s)}"/>
    <rect x="${f(x0 + 12 * s)}" y="${f(y0 + 12 * s)}" width="${f(w * 0.2)}" height="${f(h - 24 * s)}" rx="${f(8 * s)}" fill="#fff" opacity=".22"/>
    ${typeof text === "string" ? `<text x="${f(x0 + w / 2)}" y="${f(y0 + h * 0.3)}" font-family="Archivo Black" font-size="${f(34 * s)}" fill="${LN.navy}" text-anchor="middle" stroke="#F2EEE6" stroke-width="${f(4 * s)}" paint-order="stroke">${text}</text>` : ""}</g>`;
}
function lnPhone(hand, s, ph) {
  const w = 40 * s, h = 70 * s;
  return `<g transform="rotate(-12 ${f(hand[0])} ${f(hand[1])})"><rect x="${f(hand[0] - w / 2)}" y="${f(hand[1] - h + 10 * s)}" width="${f(w)}" height="${f(h)}" rx="${f(7 * s)}" fill="#22252B" stroke="${LN.ink}" stroke-width="${f(5 * s)}"/>
    <rect x="${f(hand[0] - w / 2 + 5 * s)}" y="${f(hand[1] - h + 16 * s)}" width="${f(w - 10 * s)}" height="${f(h - 14 * s)}" rx="${f(4 * s)}" fill="#8FB4D8"/>
    <circle${ph && ph.live ? ` id="${ph.live}"` : ""} cx="${f(hand[0] - w / 2 + 11 * s)}" cy="${f(hand[1] - h + 22 * s)}" r="${f(5.5 * s)}" fill="#FF2D2D"/></g>`;
}
function lnSign(hand, s, sg) {
  const w = (sg.w || 190) * s, h = (sg.h || 104) * s, top = hand[1] - 130 * s;
  const lines = String(sg.text).split("|");
  return `<path d="M${f(hand[0])} ${f(hand[1] + 10 * s)} V${f(top + h)}" stroke="#8A6A44" stroke-width="${f(9 * s)}" stroke-linecap="round"/>
    <rect x="${f(hand[0] - w / 2)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" rx="${f(4 * s)}" fill="${sg.bg || "#F6F2E9"}" stroke="${LN.ink}" stroke-width="${f(6 * s)}"/>
    ${lines.map((t, i) => `<text x="${f(hand[0])}" y="${f(top + h / 2 + (i - (lines.length - 1) / 2) * 30 * s + 10 * s)}" font-family="Archivo Black" font-size="${f((sg.size || 26) * s)}" fill="${sg.fg || LN.ink}" text-anchor="middle">${t}</text>`).join("")}`;
}
function lnFlag(hand, s) {
  const top = hand[1] - 170 * s;
  return `<path d="M${f(hand[0])} ${f(hand[1] + 10 * s)} V${f(top)}" stroke="#5A4A3A" stroke-width="${f(8 * s)}" stroke-linecap="round"/>
    <path d="M${f(hand[0])} ${f(top)} q${f(60 * s)} ${f(-14 * s)} ${f(120 * s)} ${f(6 * s)} v${f(70 * s)} q${f(-60 * s)} ${f(-18 * s)} ${f(-120 * s)} ${f(-4 * s)}Z" fill="${LN.red}" stroke="${LN.ink}" stroke-width="${f(5 * s)}"/>`;
}
function lnFacade(x, y, w, h, seed) {
  const R = rng(seed);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${LN.bldg}" stroke="${LN.bldgDk}" stroke-width="4"/>`;
  s += `<path d="M${x - 8} ${y} L${x + 20} ${y - 70} L${x + w - 20} ${y - 70} L${x + w + 8} ${y}Z" fill="${LN.roof}" stroke="${LN.ink}" stroke-width="4"/>`;
  const cols = Math.max(2, Math.floor(w / 70)), cw = w / cols;
  for (let c = 0; c < cols; c++) s += `<rect x="${f(x + c * cw + cw * 0.3)}" y="${y - 58}" width="${f(cw * 0.4)}" height="44" rx="6" fill="${LN.win}"/>`;
  for (let fl = 0; fl < 5; fl++) {
    const fy = y + 30 + fl * (h / 5.4);
    if (fy + 70 > y + h) break;
    for (let c = 0; c < cols; c++) s += `<rect x="${f(x + c * cw + cw * 0.28)}" y="${f(fy)}" width="${f(cw * 0.44)}" height="${f(h / 9)}" fill="${R() > 0.85 ? "#F0C873" : LN.win}"/>`;
    if (fl === 1 || fl === 4) s += `<path d="M${x + 6} ${f(fy + h / 9 + 6)} H${x + w - 6}" stroke="${LN.ink}" stroke-width="5"/>${Array.from({ length: Math.floor(w / 14) }, (_, i) => `<path d="M${x + 10 + i * 14} ${f(fy + h / 9 - 12)} V${f(fy + h / 9 + 6)}" stroke="${LN.ink}" stroke-width="2"/>`).join("")}`;
  }
  return s;
}
function lnMarianne(x, y, k) {
  const g = (d) => `<g transform="translate(${x} ${y}) scale(${k})">${d}</g>`;
  return g(`<rect x="-150" y="-60" width="300" height="60" fill="${LN.stone}" stroke="${LN.ink}" stroke-width="5"/>
    <rect x="-110" y="-330" width="220" height="270" fill="${LN.stone}" stroke="${LN.ink}" stroke-width="5"/><rect x="-80" y="-300" width="160" height="210" fill="${LN.stoneDk}"/>
    <rect x="-130" y="-360" width="260" height="34" fill="${LN.stone}" stroke="${LN.ink}" stroke-width="5"/>
    <path d="M-40 -360 L-30 -520 L30 -520 L40 -360Z" fill="${LN.bronze}" stroke="${LN.ink}" stroke-width="5"/>
    <path d="M-34 -520 L-28 -440 L28 -440 L34 -520Z" fill="${LN.vest}" stroke="${LN.ink}" stroke-width="4"/><path d="M-30 -478 H30" stroke="#C9CDD2" stroke-width="6"/>
    <circle cx="0" cy="-550" r="30" fill="${LN.bronze}" stroke="${LN.ink}" stroke-width="5"/>
    <path d="M24 -510 L70 -620 M70 -620 q20 -8 30 -30 M70 -620 q-10 -20 -2 -40" stroke="${LN.bronze}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M24 -510 L70 -620" stroke="${LN.ink}" stroke-width="4" fill="none"/>`);
}
function lnSmoke(id, x, y, k, seed, op = 1) {
  const R = rng(seed);
  let c = "";
  for (let i = 0; i < 7; i++) c += `<circle cx="${f((R() - 0.5) * 260)}" cy="${f((R() - 0.5) * 120)}" r="${f(80 + R() * 70)}" fill="url(#lnSmokeG)"/>`;
  return `<g${id ? ` id="${id}"` : ""} opacity="${op}"><g transform="translate(${x} ${y}) scale(${k})">${c}</g></g>`;
}
function lnRingAt(x, y, rx, ry, color, id) { return imRing(x, y, rx, ry, color, id); }
function ln2Puff(id, x, y, k, seed, op = 1, hidden = false) {
  const R = rng(seed);
  let c = "";
  for (let i = 0; i < 7; i++) c += `<circle cx="${f((R() - 0.5) * 260)}" cy="${f((R() - 0.5) * 120)}" r="${f(80 + R() * 70)}" fill="url(#lnSmokeG)"/>`;
  return `<g id="${id}" transform="translate(${x} ${y}) scale(${k})" opacity="${op}"${hidden ? ' style="opacity:0"' : ""}>${c}</g>`;
}
function ln2Bandana(h, r, s) {
  return `<path d="M${f(h[0] - r * 0.98)} ${f(h[1] + r * 0.02)} Q${f(h[0])} ${f(h[1] - r * 0.14)} ${f(h[0] + r * 0.98)} ${f(h[1] + r * 0.02)} Q${f(h[0] + r * 0.82)} ${f(h[1] + r * 0.95)} ${f(h[0])} ${f(h[1] + r * 1.06)} Q${f(h[0] - r * 0.82)} ${f(h[1] + r * 0.95)} ${f(h[0] - r * 0.98)} ${f(h[1] + r * 0.02)}Z" fill="${LN.red}" stroke="${LN.ink}" stroke-width="${f(5 * s)}"/>
    <circle cx="${f(h[0] - r * 0.38)}" cy="${f(h[1] + r * 0.42)}" r="${f(r * 0.08)}" fill="#fff"/><circle cx="${f(h[0] + r * 0.3)}" cy="${f(h[1] + r * 0.62)}" r="${f(r * 0.08)}" fill="#fff"/><circle cx="${f(h[0] + r * 0.05)}" cy="${f(h[1] + r * 0.25)}" r="${f(r * 0.06)}" fill="#fff"/>`;
}
function ln2Phone(id, x, y, w, h, inner, bg = "#0E1015") {
  const b = 20;
  return `<g${id ? ` id="${id}"` : ""}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="58" fill="#1A1C20" stroke="${LN.ink}" stroke-width="12"/>
    <clipPath id="${id || "ph"}Clip"><rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${h - 2 * b}" rx="40"/></clipPath>
    <g clip-path="url(#${id || "ph"}Clip)"><rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="${bg}"/><g transform="translate(${x + b} ${y + b})">${inner}</g></g>
    <rect x="${x + w / 2 - 70}" y="${y + b + 12}" width="140" height="34" rx="17" fill="#000"/></g>`;
}
function ln2Hand(cx, bottom, w) {
  const G = "#20242C", st = `stroke="${LN.ink}" stroke-width="10"`;
  let s = `<path d="M${cx - 150} 2000 L${cx - 120} ${bottom + 40} L${cx + 120} ${bottom + 40} L${cx + 160} 2000Z" fill="${LN.navy}" ${st}/>`;
  s += `<rect x="${cx - w * 0.3}" y="${bottom - 36}" width="${w * 0.6}" height="120" rx="44" fill="${G}" ${st}/>`;
  s += `<rect x="${cx - w / 2 - 34}" y="${bottom - 210}" width="62" height="150" rx="31" fill="${G}" ${st}/>`;
  for (let i = 0; i < 3; i++) s += `<rect x="${cx + w / 2 - 26}" y="${bottom - 330 + i * 92}" width="64" height="80" rx="32" fill="${G}" ${st}/>`;
  return s;
}
// ---- from the PlotVote engine: scenes-sundown.js ----
const SD = {
  ink: "#0A0B0E", them: "#05060A", beanie: "#D8433A", amber: "#F2A33A", light: "#FFD27A", moon: "#DCE6F2",
  wood: "#6B4A32", woodDk: "#3E2A1C", glass: "#1B2840", pine: "#0D1A14", ground: "#16211A", paint: "#EDE6D6", paint2: "#E9D58A",
};
function sdDefs() {
  return defsCommon() + `<defs>
    <linearGradient id="sdDuskG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241A38"/><stop offset=".45" stop-color="#6E3550"/><stop offset=".7" stop-color="#E2774A"/><stop offset="1" stop-color="#F6B25E"/></linearGradient>
    <linearGradient id="sdNightG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04060D"/><stop offset="1" stop-color="#172340"/></linearGradient>
    <linearGradient id="sdDayG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9A55E"/><stop offset="1" stop-color="#F7DDA6"/></linearGradient>
    <radialGradient id="sdMoonG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#DCE6F2" stop-opacity=".35"/><stop offset="1" stop-color="#DCE6F2" stop-opacity="0"/></radialGradient>
    <radialGradient id="sdLampG" cx="50%" cy="40%" r="50%"><stop offset="0" stop-color="#FFD27A" stop-opacity=".75"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
    <radialGradient id="sdEyeG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F4F7FF" stop-opacity=".45"/><stop offset="1" stop-color="#F4F7FF" stop-opacity="0"/></radialGradient>
    <linearGradient id="sdTorchG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFF4C8" stop-opacity="0"/></linearGradient>
    <linearGradient id="sdGlassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A3C64"/><stop offset="1" stop-color="#101A30"/></linearGradient>
  </defs>`;
}
function sdPine(x, y, h, c) {   // (x, y) = base of the trunk
  const w = h * 0.42, P = (a, b) => `${f(x + a * w)} ${f(y - b * h)}`;
  return `<path d="M${P(0, 1)} L${P(0.55, 0.62)} L${P(0.32, 0.62)} L${P(0.8, 0.3)} L${P(0.5, 0.3)} L${P(1, 0.05)} L${P(-1, 0.05)} L${P(-0.5, 0.3)} L${P(-0.8, 0.3)} L${P(-0.32, 0.62)} L${P(-0.55, 0.62)}Z" fill="${c}"/><rect x="${f(x - h * 0.025)}" y="${f(y - h * 0.06)}" width="${f(h * 0.05)}" height="${f(h * 0.08)}" fill="${c}"/>`;
}
function sdForest(y, x0, x1, step, hMin, hMax, c, seed) {
  const R = rng(seed);
  let s = "";
  for (let x = x0; x < x1; x += step * (0.7 + R() * 0.6)) s += sdPine(x, y + R() * 24, hMin + R() * (hMax - hMin), c);
  return s;
}
function sdStars(seed) {
  const R = rng(seed);
  let s = "";
  for (let i = 0; i < 46; i++) s += `<circle cx="${f(R() * 1080)}" cy="${f(R() * 900)}" r="${f(1.5 + R() * 2.5)}" fill="#DCE6F2" opacity="${f(0.3 + R() * 0.5)}"/>`;
  return s;
}
function sdNightSky(seed = 3) {
  return `<rect width="1080" height="1920" fill="url(#sdNightG)"/>${sdStars(seed)}<circle cx="820" cy="430" r="66" fill="${SD.moon}"/><circle cx="820" cy="430" r="190" fill="url(#sdMoonG)"/>`;
}
function sdCabin(x, y, k, o = {}) {
  let s = `<g transform="translate(${x} ${y}) scale(${k})">`;
  s += `<rect x="150" y="-470" width="60" height="150" fill="#3E322E" stroke="${SD.ink}" stroke-width="8"/>`;
  s += `<path d="M-330 -300 L0 -500 L330 -300Z" fill="#2A1E18" stroke="${SD.ink}" stroke-width="10" stroke-linejoin="round"/>`;
  s += `<rect x="-280" y="-300" width="560" height="300" fill="${o.wall || SD.wood}" stroke="${SD.ink}" stroke-width="10"/>`;
  for (let i = 1; i < 6; i++) s += `<path d="M-280 ${-300 + i * 50} H280" stroke="${o.wallDk || SD.woodDk}" stroke-width="6"/>`;
  s += `<rect x="-70" y="-210" width="140" height="210" fill="#2E2016" stroke="${SD.ink}" stroke-width="8"/><circle cx="45" cy="-100" r="9" fill="#C9B07A"/>`;
  s += `<rect x="120" y="-220" width="120" height="100" fill="${o.winLit ? SD.light : SD.glass}" stroke="${SD.ink}" stroke-width="8"/><path d="M180 -220 V-120 M120 -170 H240" stroke="${SD.ink}" stroke-width="6"/>`;
  s += `<rect x="-112" y="-250" width="28" height="36" rx="6" fill="${o.lampOn ? SD.light : "#4A423C"}" stroke="${SD.ink}" stroke-width="5"/>`;
  if (o.lampId || o.lampOn) s += `<g${o.lampId ? ` id="${o.lampId}"` : ""}${o.lampOn ? "" : ' style="opacity:0"'}><circle cx="-98" cy="-232" r="18" fill="${SD.light}"/><ellipse cx="-98" cy="-80" rx="420" ry="320" fill="url(#sdLampG)"/></g>`;
  s += `<rect x="-320" y="0" width="640" height="30" fill="#3A2A1E" stroke="${SD.ink}" stroke-width="8"/>`;
  return s + `</g>`;
}
function sdTall(o) {
  const rim = o.rim === false ? null : o.rim || "#56688F";
  if (rim && !o.rimPass) {
    const sw = o.h * 0.024, inner = sdTall(Object.assign({}, o, { id: null, eyesId: null, hidden: false, rimPass: true, ink: rim, sw: sw * 1.9 })).replace(/<g[^>]*><circle[^>]*url\(#sdEyeG\)[\s\S]*$/, "");
    const body = sdTall(Object.assign({}, o, { rim: false }));
    return body.replace(/^(<g[^>]*>)/, `$1${inner}</g>`);
  }
  const h = o.h, x = o.x, y = o.y, sw = o.sw || h * 0.024, c = o.ink || SD.them, pose = o.pose || "stand";
  const lean = pose === "hunch" ? h * 0.06 : pose === "run" ? h * 0.14 : 0;
  const hip = [x, y - h * 0.5], neck = [x + lean, y - h * 0.86], r = h * 0.046, head = [neck[0] + lean * 0.4, neck[1] - r * 1.15];
  const L = (pts, w = sw) => `<path d="${lnP(pts)}" stroke="${c}" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  let body;
  if (pose === "run") {
    body = L([[x - h * 0.2, y - h * 0.03], [x - h * 0.08, y - h * 0.25], hip, [x + h * 0.13, y - h * 0.3], [x + h * 0.24, y - h * 0.08]]) + L([hip, neck]);
    body += L([neck, [x - h * 0.02, y - h * 0.66], [x - h * 0.12, y - h * 0.52]]) + L([neck, [x + lean + h * 0.13, y - h * 0.72], [x + lean + h * 0.25, y - h * 0.6]]);
  } else {
    body = L([[x - h * 0.07, y], [x - h * 0.05, y - h * 0.25], hip, [x + h * 0.05, y - h * 0.25], [x + h * 0.07, y]]) + L([hip, neck]);
    const hl = pose === "reach" ? [x + lean + h * 0.26, y - h * 0.74] : [x - h * 0.11, y - h * 0.34];
    const hr = pose === "reach" ? [x + lean + h * 0.3, y - h * 0.64] : [x + h * 0.11 + lean * 0.3, y - h * 0.36];
    body += L([neck, [x - h * 0.08 + lean * 0.5, y - h * 0.62], hl]) + L([neck, [x + h * 0.09 + lean * 0.5, y - h * 0.62], hr]);
    [hl, hr].forEach(([fx, fy]) => { body += L([[fx, fy], [fx - h * 0.022, fy + h * 0.055]], sw * 0.45) + L([[fx, fy], [fx, fy + h * 0.065]], sw * 0.45) + L([[fx, fy], [fx + h * 0.022, fy + h * 0.055]], sw * 0.45); });
  }
  let s = `<g${o.id ? ` id="${o.id}"` : ""}${o.hidden ? ' style="opacity:0"' : ""}>${body}<circle cx="${f(head[0])}" cy="${f(head[1])}" r="${f(o.rimPass ? r + sw * 0.5 : r)}" fill="${c}"/>`;
  s += `<g${o.eyesId ? ` id="${o.eyesId}"` : ""}><circle cx="${f(head[0])}" cy="${f(head[1])}" r="${f(r * 1.6)}" fill="url(#sdEyeG)"/><circle cx="${f(head[0] - r * 0.36)}" cy="${f(head[1] - r * 0.05)}" r="${f(r * 0.17)}" fill="#F4F7FF"/><circle cx="${f(head[0] + r * 0.36)}" cy="${f(head[1] - r * 0.05)}" r="${f(r * 0.17)}" fill="#F4F7FF"/></g>`;
  return s + `</g>`;
}
function sdStreak(id, x0, y0, x1, h) {
  return `<g id="${id}" style="opacity:0">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${f(x0)} ${f(y0 + i * h / 5)} L${f(x1 - i * 40)} ${f(y0 + i * h / 5)}" stroke="${SD.them}" stroke-width="${f(26 - i * 3)}" stroke-linecap="round" opacity="${f(0.75 - i * 0.1)}"/>`).join("")}</g>`;
}
function sdBeanie(head, r) {
  return `<path d="M${f(head[0] - r * 1.04)} ${f(head[1] - r * 0.38)} Q${f(head[0] - r)} ${f(head[1] - r * 1.3)} ${f(head[0])} ${f(head[1] - r * 1.26)} Q${f(head[0] + r)} ${f(head[1] - r * 1.3)} ${f(head[0] + r * 1.04)} ${f(head[1] - r * 0.38)}Z" fill="${SD.beanie}" stroke="${SD.ink}" stroke-width="${f(r * 0.14)}"/>
    <rect x="${f(head[0] - r * 1.1)}" y="${f(head[1] - r * 0.56)}" width="${f(r * 2.2)}" height="${f(r * 0.26)}" rx="${f(r * 0.1)}" fill="#A8302A" stroke="${SD.ink}" stroke-width="${f(r * 0.1)}"/>
    <circle cx="${f(head[0])}" cy="${f(head[1] - r * 1.34)}" r="${f(r * 0.24)}" fill="${SD.beanie}" stroke="${SD.ink}" stroke-width="${f(r * 0.1)}"/>`;
}
function sdBoy(o) {
  const g = sfig(Object.assign({ ink: SD.ink }, o));
  const { head, r } = sfig.last;
  return g.slice(0, -4) + sdBeanie(head, r) + "</g>";
}

// ═══════════════════════════ FRIENDLY API (use these in scenes.js) ═══════════════════════════
const KIT = { ink: LN.ink, skin: LN.skin, navy: LN.navy, yellow: LN.yellow, red: "#E5484D", amber: "#F2A33A",
  cream: "#F2EEE6", light: SD.light, moon: SD.moon, mono: IM.mono };

// every gradient the kit uses (vignette, skies, smoke, glows): start every set with defs()
function defs() { return sdDefs() + lnDefs().replace(defsCommon(), ""); }
// a darkened edge over the whole frame: end every set with vignette()
const vignette = (op = 0.7) => `<rect width="1080" height="1920" fill="url(#vig)" opacity="${op}"/>`;

// full-frame sky. mode: "night" (stars + moon) | "dusk" (violet to orange) | "day" (warm afternoon) | "overcast" (grey city sky)
function sky(mode = "night", seed = 3) {
  if (mode === "night") return sdNightSky(seed);
  if (mode === "dusk") return `<rect width="1080" height="1920" fill="url(#sdDuskG)"/><circle cx="700" cy="1080" r="120" fill="#FFC56E" opacity=".9"/>`;
  if (mode === "day") return `<rect width="1080" height="1920" fill="url(#sdDayG)"/>`;
  return `<rect width="1080" height="1920" fill="url(#lnSky)"/>`;
}
// flat ground from y down to the bottom of the frame
const ground = (y, color = "#16211A") => `<rect x="0" y="${y}" width="1080" height="${1920 - y}" fill="${color}"/>`;

// PEOPLE ---------------------------------------------------------------------------------------
// stick(o): a stick figure. o: x, y (= the HIPS), s (scale, 1 ≈ 300 px tall), expr ("neutral"|"worry"|"fear"|"shout"|"stern"),
//   look (-1..1 eyes left/right), back (seen from behind), hair: "pony", helmet + visor ("down"|"up"), mask, scarf (colour),
//   vest (colour), armor, pose: {lean, la:[upper, lower], ra:[...], ll:[thigh, shin], rl:[...]} (degrees: 0 = down, 90 = right,
//   180 = up, -90 = left; la/ll are the limbs on the image-left), props: phone:{live:id}, sign:{text,w,h}, flag, shield,
//   armL / armR (ids for the arm groups), id, ink. After the call, stick.last / sfig.last = {head, r, neck, sh, handL, handR, hip}.
const stick = (o) => { const s = sfig(o); stick.last = sfig.last; return s; };
// kid(o): the same stick figure in a red beanie (an easy "you" viewers can always find)
const kid = (o) => { const s = sdBoy(o); kid.last = sfig.last; return s; };
// creature(o): an eight-foot thing — thin black limbs, small head, two white pinprick eyes, a moonlit rim so it reads at night.
//   o: x (between the feet), y (ground), h (height in px), pose "stand"|"hunch"|"run"|"reach", id, eyesId, hidden, rim (colour|false), ink
const creature = (o) => sdTall(o);
// a speed streak (black dashes) for "it moved too fast to see": id, from x0,y0 to x1, band height h. Hidden until you animate opacity.
const streak = (id, x0, y0, x1, h) => sdStreak(id, x0, y0, x1, h);
// bandana(head, r, s): a red bandana over the lower face (use stick.last.head / stick.last.r)
const bandana = (head, r, s = 1) => ln2Bandana(head, r, s);

// PLACES ---------------------------------------------------------------------------------------
const pine = (x, y, h, color) => sdPine(x, y, h, color);
// forest(baseY, x0, x1, step, hMin, hMax, colour, seed): a row of pines. Layer 2–3 rows, darker = nearer.
const forest = (y, x0, x1, step, hMin, hMax, color, seed) => sdForest(y, x0, x1, step, hMin, hMax, color, seed);
// cabin(x, y, k, o): a log cabin, front on; (x, y) = bottom centre; o: lampOn, lampId (porch light), winLit, wall, wallDk
const cabin = (x, y, k, o) => sdCabin(x, y, k, o);
// facade(x, y, w, h, seed): a city building front with windows (Paris-style)
const facade = (x, y, w, h, seed) => lnFacade(x, y, w, h, seed);
// smoke(id, x, y, k, seed, opacity) / puff(...): soft smoke or fog clouds (animate x or attr.transform to drift them)
const smoke = (id, x, y, k, seed, op) => lnSmoke(id, x, y, k, seed, op);
const puff = (id, x, y, k, seed, op, hidden) => ln2Puff(id, x, y, k, seed, op, hidden);
// room(o): an interior back wall + floor. o: wall, floor, floorY (default 1340), planks (true), window: {x, y, w, h, inside}
function room(o = {}) {
  const floorY = o.floorY || 1340;
  let s = `<rect width="1080" height="1920" fill="${o.wall || "#2A313C"}"/>`;
  if (o.planks !== false) for (let i = 0; i < 12; i++) s += `<path d="M${i * 92 + 90} 0 V${floorY}" stroke="rgba(0,0,0,.18)" stroke-width="5"/>`;
  if (o.window) s += windowFrame(o.window.x, o.window.y, o.window.w, o.window.h, o.window);
  s += `<rect x="0" y="${floorY}" width="1080" height="${1920 - floorY}" fill="${o.floor || "#14181E"}"/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M0 ${floorY + 60 + i * 90} H1080" stroke="rgba(0,0,0,.25)" stroke-width="8"/>`;
  return s;
}
// windowFrame(x, y, w, h, o): a window with crossbars. o.inside = markup seen through the glass (clipped to it), o.glass, o.frame, o.id
function windowFrame(x, y, w, h, o = {}) {
  const id = o.id || `win${x}x${y}`, fr = o.frame || "#2A1E16";
  return `<defs><clipPath id="${id}Clip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.glass || "url(#sdGlassG)"}"/><g clip-path="url(#${id}Clip)">${o.inside || ""}</g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${fr}" stroke-width="26"/><path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${fr}" stroke-width="16"/>`;
}

// THINGS ---------------------------------------------------------------------------------------
// phone(id, x, y, w, h, inner, bg): a phone; `inner` is drawn in screen coordinates (0,0 = top-left of the glass, size w-40 × h-40)
const phone = (id, x, y, w, h, inner, bg) => ln2Phone(id, x, y, w, h, inner, bg);
// glove(cx, bottom, w): a hand holding that phone from below (cx = phone centre, bottom = phone bottom, w = phone width)
const glove = (cx, bottom, w) => ln2Hand(cx, bottom, w);
// radio(x, y, k, {led: id}): a handheld radio; the LED group (id) is hidden — show it while someone talks (episode "talk")
const radio = (x, y, k, o) => imRadioDev(x, y, k, o);

// WATER ----------------------------------------------------------------------------------------
// water(y, o): a pool / lake / sea surface from y to the bottom. o: color, deep, id (the wave-line group: drift it with x), lines
function water(y, o = {}) {
  const c = o.color || "#2A8FA0", dk = o.deep || "#0E3A4A", id = o.id || `wv${Math.round(y)}`, n = o.lines || 7;
  let s = `<defs><linearGradient id="${id}G" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${dk}"/></linearGradient></defs>`;
  s += `<rect x="-40" y="${y}" width="1160" height="${1960 - y}" fill="url(#${id}G)"/><g id="${id}">`;
  for (let i = 0; i < n; i++) {
    const yy = y + 30 + (i * (1920 - y)) / n, amp = 8 + i * 3, w = 140 + i * 30;
    let d = `M-300 ${f(yy)}`;
    for (let x = -300; x < 1400; x += w) d += ` q${f(w / 4)} ${-amp} ${f(w / 2)} 0 t${f(w / 2)} 0`;
    s += `<path d="${d}" stroke="#BFF3F7" stroke-width="${f(4 + i)}" fill="none" opacity="${f(0.35 - i * 0.03)}"/>`;
  }
  return s + `</g><path d="M-40 ${y} H1120" stroke="#DFFBFF" stroke-width="6" opacity=".6"/>`;
}
// splash(id, x, y, k): a white splash burst, hidden until you animate opacity (and scale) on its word
function splash(id, x, y, k = 1) {
  let s = `<g id="${id}" style="opacity:0" transform="translate(${x} ${y}) scale(${k})">`;
  [[-60, -140, 22], [0, -190, 26], [60, -150, 22], [-110, -80, 16], [110, -90, 16], [-30, -110, 14], [35, -120, 14]].forEach(([dx, dy, r]) => { s += `<circle cx="${dx}" cy="${dy}" r="${r}" fill="#EFFFFF" opacity=".9"/>`; });
  return s + `<ellipse cx="0" cy="0" rx="150" ry="34" fill="none" stroke="#EFFFFF" stroke-width="10" opacity=".8"/></g>`;
}
// ripple(id, x, y, k): rings on a water surface, hidden; animate opacity + scale for a drop, or something surfacing
function ripple(id, x, y, k = 1) {
  return `<g id="${id}" style="opacity:0" transform="translate(${x} ${y}) scale(${k})">${[60, 110, 170].map((r, i) => `<ellipse cx="0" cy="0" rx="${r}" ry="${f(r * 0.28)}" fill="none" stroke="#DFFBFF" stroke-width="${6 - i}" opacity="${0.8 - i * 0.2}"/>`).join("")}</g>`;
}

// LABELS + HIGHLIGHTS --------------------------------------------------------------------------
// label(x, y, text, size, fill, {anchor, font, weight, ls}): SVG text (default font IBM Plex Mono bold)
const label = (x, y, t, size, fill, o) => imText(x, y, t, size, fill, o);
// chip(x, y, text, {id, hidden, fg, bg, anchor, size, stroke}): a rounded label ("6 DAYS AGO", "THAT'S YOU")
const chip = (x, y, t, o) => imChip(x, y, t, o);
// ring(cx, cy, rx, ry, colour, id): a dashed highlight ring, hidden until you animate its opacity (point at the clue)
const ring = (cx, cy, rx, ry, color, id) => imRing(cx, cy, rx, ry, color, id);
// cam(k, cx, cy): an SVG transform that frames (cx, cy) at zoom k. Wrap a set in <g id="cam" transform="${cam(1.8, x, y)}">
//   and animate {el: cam, to: {attr: {transform: "translate(X Y) scale(K)"}}} for pushes and pans (same string format).
const cam = (k, cx, cy) => imCam(k, cx, cy);

// THE CHOICE FRAME -----------------------------------------------------------------------------
// costCard(id, x, title, lineA, lineB): a dark card: big title + two short lines (≤ 19 characters each; lineB in red)
function costCard(id, x, title, a, b) {
  return `<g id="${id}" style="opacity:0"><rect x="${x}" y="320" width="420" height="250" rx="22" fill="rgba(6,8,10,.9)" stroke="#F2EEE6" stroke-width="5"/>
    <text x="${x + 28}" y="400" font-family="Archivo Black" font-size="64" fill="#F2EEE6">${title}</text>${imText(x + 28, 462, a, 30, "#F2EEE6")}${imText(x + 28, 516, b, 30, "#E5A0A2")}</g>`;
}
// splitChoice(o): the "what each choice costs" shot. Two half-panels (left / right = full 1080×1920 drawings, each cropped to
//   its middle by cropL / cropR, default "270 600 540 1320"), two labels, and two cost cards with ids chA / chB that appear on
//   their words (animate opacity). o.inset = true drops the cards (for the vote-card inset). Don't animate inside the halves.
function splitChoice(o) {
  let s = defs() + `<rect width="1080" height="1920" fill="${o.bg || "#0C1018"}"/>`;
  s += `<svg x="0" y="600" width="540" height="1320" viewBox="${o.cropL || "270 600 540 1320"}" preserveAspectRatio="xMidYMid slice">${o.left}</svg>`;
  s += `<svg x="540" y="600" width="540" height="1320" viewBox="${o.cropR || "270 600 540 1320"}" preserveAspectRatio="xMidYMid slice">${o.right}</svg>`;
  s += `<path d="M540 600 V1920" stroke="${LN.ink}" stroke-width="8"/>`;
  const [la, lb] = o.labels || [];
  if (la) s += imChip(270, 640, la, { anchor: "middle", fg: LN.ink, bg: LN.yellow });
  if (lb) s += imChip(810, 640, lb, { anchor: "middle", fg: "#fff", bg: LN.navy });
  if (!o.inset && o.cards) s += costCard("chA", 70, ...o.cards[0]) + costCard("chB", 590, ...o.cards[1]);
  return s + vignette(0.5);
}
