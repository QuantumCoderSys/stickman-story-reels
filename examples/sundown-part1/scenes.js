// SUNDOWN — Part 1 "Rule Two": the ten shots of the example reel (scenes.js).
// You're fourteen, alone in a cabin 100 km from the nearest city. Every night, eight-foot things come out of the woods.
// Each function is one shot: it returns a 1080×1920 SVG built from kit.js (sdTall = creature(), sdBoy = kid(), sdCabin = cabin()...).
// Anything with an id="..." can be animated from episode.json ("animate": [{"el": "hkTall", "to": {"x": 1300}, "at": "faster"}]).

// ---------- s1 (+cover): dusk at the edge of the woods. One of them leans out from behind a trunk, then it's gone ----------
function sdHook(mode) {
  const cover = mode === "cover";
  let s = sdDefs() + `<rect width="1080" height="1920" fill="url(#sdDuskG)"/><circle cx="700" cy="1080" r="120" fill="#FFC56E" opacity=".9"/>`;
  s += sdForest(1170, -60, 1160, 80, 180, 300, "#3A2238", 61);
  s += sdForest(1230, -80, 1180, 95, 240, 380, "#120E16", 62);
  s += `<rect x="0" y="1220" width="1080" height="700" fill="#0E0C12"/>`;
  const R = rng(63);
  for (let i = 0; i < 40; i++) { const x = R() * 1080, y = 1260 + R() * 640; s += `<path d="M${f(x)} ${f(y)} l-10 -34 M${f(x)} ${f(y)} l4 -42 M${f(x)} ${f(y)} l14 -30" stroke="#1E1A24" stroke-width="6" stroke-linecap="round"/>`; }
  if (cover) s += sdCabin(910, 1500, 0.42, { winLit: true });
  s += `<g id="hkTall"${cover ? "" : ' transform="translate(-230 0)"'}>${sdTall({ x: 470, y: cover ? 1820 : 1560, h: 1080, pose: "hunch", eyesId: "hkEyes" })}</g>`;
  s += `<rect x="190" y="200" width="110" height="1420" fill="#08070B"/><path d="M190 640 L80 520 M300 880 L420 760" stroke="#08070B" stroke-width="26" stroke-linecap="round"/>`;
  if (!cover) s += sdStreak("hkStreak", 520, 520, 1180, 520);
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".7"/>`;
  return s;
}

function sdCover() { return sdHook("cover"); }

// ---------- s2: from above. Forest for 100 km; one clearing, one cabin, one dirt road out. Pulls back from the cabin ----------
function sdMap() {
  let s = sdDefs() + `<rect width="1080" height="1920" fill="#0F2018"/>`;
  s += `<g id="mpCam" transform="${imCam(3.4, 540, 1120)}">`;
  s += `<path d="M540 1120 C620 920 420 740 520 540 S620 160 560 -120" stroke="#7A6646" stroke-width="18" fill="none"/>`;
  const R = rng(71);
  for (let i = 0; i < 620; i++) {
    const x = R() * 1240 - 80, y = R() * 2100 - 90, r = 16 + R() * 22;
    if (Math.hypot(x - 540, y - 1120) < 120) continue;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${R() > 0.5 ? "#15301F" : "#1C3A26"}"/><circle cx="${f(x - r * 0.25)}" cy="${f(y - r * 0.25)}" r="${f(r * 0.42)}" fill="#24482F"/>`;
  }
  s += `<circle cx="540" cy="1120" r="104" fill="#2F4A2A"/><path d="M500 1092 L540 1070 L580 1092 L580 1146 L500 1146Z" fill="#3A281C" stroke="${SD.ink}" stroke-width="4"/><path d="M540 1070 V1146" stroke="#2A1E18" stroke-width="5"/>`;
  s += `</g>`;
  s += imChip(540, 330, "NEAREST CITY: 100 KM", { anchor: "middle", id: "mpCity", hidden: true, fg: SD.ink, bg: SD.amber });
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".6"/>`;
  return s;
}

// ---------- s3: six days ago. Dad's pickup pulls away down the dirt road; you wave from the porch ----------
function sdDadLeaves() {
  let s = sdDefs() + `<rect width="1080" height="1920" fill="url(#sdDayG)"/>`;
  s += sdForest(1120, -60, 1160, 85, 300, 520, "#4E6B44", 81) + sdForest(1200, -80, 1180, 100, 420, 600, "#2F4A30", 82);
  s += `<rect x="0" y="1190" width="1080" height="730" fill="#6E8A4E"/><path d="M-40 1520 Q540 1440 1120 1500 L1120 1660 Q540 1600 -40 1690Z" fill="#B08A5A"/>`;
  s += sdCabin(250, 1420, 0.72, { wall: "#8A6040", wallDk: "#5E4028" });
  s += `<g id="ddBoy">${sdBoy({ x: 190, y: 1620, s: 1.1, expr: "worry", look: 0.6, pose: { la: [-12, -6], ra: [150, 168] }, armR: "ddWave" })}</g>`;
  // the pickup: rust-red, Dad's arm out of the window
  s += `<g id="ddTruck"><g transform="translate(700 1560)">
    <rect x="-260" y="-150" width="300" height="110" rx="10" fill="#8E3B2E" stroke="${SD.ink}" stroke-width="9"/>
    <path d="M40 -40 L40 -230 L190 -230 L250 -140 L270 -140 L270 -40Z" fill="#A4483A" stroke="${SD.ink}" stroke-width="9" stroke-linejoin="round"/>
    <path d="M70 -205 L170 -205 L215 -145 L70 -145Z" fill="#2A3442" stroke="${SD.ink}" stroke-width="6"/>
    <circle cx="125" cy="-178" r="30" fill="${LN.skin}" stroke="${SD.ink}" stroke-width="7"/><path d="M93 -188 Q125 -228 157 -188Z" fill="#2F4A30" stroke="${SD.ink}" stroke-width="6"/><path d="M95 -186 H180" stroke="${SD.ink}" stroke-width="8" stroke-linecap="round"/>
    <path d="M100 -165 Q125 -140 150 -165" fill="#5A3E2A"/>
    <path d="M60 -150 L0 -230 L-20 -290" stroke="${SD.ink}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-20" cy="-290" r="10" fill="${SD.ink}"/>
    <circle cx="-170" cy="-30" r="52" fill="#1A1A1E" stroke="${SD.ink}" stroke-width="8"/><circle cx="-170" cy="-30" r="20" fill="#7A7A80"/>
    <circle cx="180" cy="-30" r="52" fill="#1A1A1E" stroke="${SD.ink}" stroke-width="8"/><circle cx="180" cy="-30" r="20" fill="#7A7A80"/></g></g>`;
  s += `<g id="ddDust" style="opacity:0">${[0, 1, 2].map((i) => `<circle cx="${380 - i * 90}" cy="${1520 - i * 20}" r="${60 + i * 26}" fill="#D9C29A" opacity="${0.7 - i * 0.18}"/>`).join("")}</g>`;
  s += imChip(80, 330, "6 DAYS AGO", { fg: SD.ink, bg: "#F2EEE6" });
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".4"/>`;
  return s;
}

function sdRules(mode) {
  const hide = mode === "scene" ? ' style="opacity:0"' : "";
  let s = sdDefs() + `<rect width="1080" height="1920" fill="#4E3626"/>`;
  for (let i = 0; i < 12; i++) s += `<rect x="${i * 92}" y="0" width="88" height="1920" fill="${i % 2 ? "#563C2A" : "#4A3222"}"/><path d="M${i * 92 + 90} 0 V1920" stroke="#2E1E14" stroke-width="5"/>`;
  s += `<rect x="760" y="1820" width="300" height="100" fill="#2E1E14"/>`;
  const paint = (x, y, t, size, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || "Archivo Black"}" font-weight="${o.weight || 400}" font-size="${size}" fill="${o.fill || SD.paint}" letter-spacing="${o.ls || 1}" transform="rotate(${o.rot || 0} ${x} ${y})${o.skew ? ` translate(${x} ${y}) skewX(${o.skew}) translate(${-x} ${-y})` : ""}">${t}</text>`;
  s += paint(140, 470, "THE RULES", 92, { rot: -2 }) + `<path d="M140 500 Q400 486 640 494" stroke="${SD.paint}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  s += `<g id="rl1"${hide}>${paint(140, 650, "1. BE INSIDE", 66, { rot: -1 })}${paint(190, 730, "BEFORE SUNDOWN.", 66, { rot: -1.5 })}</g>`;
  // rule two: thinner, slanted, yellower paint. Someone else wrote it
  s += `<g id="rl2"${hide}>${paint(150, 890, "2. KEEP EVERY", 64, { font: "Montserrat", weight: 600, fill: SD.paint2, ls: 6, skew: -12 })}${paint(260, 968, "LIGHT OFF.", 64, { font: "Montserrat", weight: 600, fill: SD.paint2, ls: 6, skew: -12 })}</g>`;
  s += `<g id="rl3"${hide}>${paint(140, 1450, "3. NEVER OPEN", 66, { rot: 1 })}${paint(190, 1530, "THE DOOR AT NIGHT.", 66, { rot: 0.5 })}</g>`;
  s += `<g id="rl3b"${hide}>${paint(190, 1650, "NOT EVEN FOR ME.", 66, { fill: "#E5484D", rot: -1 })}<path d="M190 1676 Q520 1662 850 1672" stroke="#E5484D" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
  s += `<g id="rlRing"${mode === "clue" ? "" : ' style="opacity:0"'}><ellipse cx="520" cy="925" rx="430" ry="130" fill="none" stroke="#05070A" stroke-width="14" opacity=".6"/><ellipse cx="520" cy="925" rx="430" ry="130" fill="none" stroke="${SD.amber}" stroke-width="8" stroke-dasharray="22 12"/></g>`;
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".75"/>`;
  return s;
}

// ---------- s5: the sun goes down; they come out of the trees. Each cut, one is somewhere new and closer ----------
function sdNight() {
  let s = sdDefs() + sdNightSky(5);
  s += sdForest(1150, -60, 1160, 80, 260, 420, "#0C1424", 91) + sdForest(1240, -80, 1180, 95, 430, 640, "#060A10", 92);
  s += `<rect x="0" y="1230" width="1080" height="690" fill="#1A2632"/>`;
  s += `<g id="ntDusk"><rect width="1080" height="1240" fill="url(#sdDuskG)" opacity=".9"/></g>`;
  s += sdCabin(780, 1600, 1.6, { wall: "#3E2C20", wallDk: "#2A1C12" });
  s += sdTall({ id: "ntT1", hidden: true, x: 250, y: 1270, h: 300 });
  s += sdTall({ id: "ntT2", hidden: true, x: 420, y: 1440, h: 520, pose: "hunch" });
  s += sdTall({ id: "ntT3", hidden: true, x: 560, y: 1600, h: 470 });
  s += sdStreak("ntStreak", 300, 900, 1100, 600);
  s += sdTall({ id: "ntT4", hidden: true, x: 160, y: 2240, h: 1900, pose: "reach" });
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".75"/>`;
  return s;
}

// ---------- s6: last night. One at your window until sunrise; you under the blanket ----------
function sdWindow() {
  let s = sdDefs() + `<rect width="1080" height="1920" fill="#0E1424"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="M${i * 92 + 90} 0 V1920" stroke="#0A0F1C" stroke-width="5"/>`;
  // the window: night outside, then dawn
  s += `<rect x="110" y="380" width="520" height="640" fill="url(#sdGlassG)"/>`;
  s += `<g clip-path="url(#sdWinClip)">${sdForest(1020, 80, 660, 70, 160, 300, "#070B14", 101)}</g><defs><clipPath id="sdWinClip"><rect x="110" y="380" width="520" height="640"/></clipPath></defs>`;
  s += `<g id="wnDawn" style="opacity:0"><rect x="110" y="380" width="520" height="640" fill="#F2A35E" opacity=".75"/></g>`;
  s += `<g clip-path="url(#sdWinClip)"><g id="wnTall" transform="translate(-300 0)" style="opacity:0">${sdTall({ x: 330, y: 1520, h: 1250, pose: "reach", eyesId: "wnEyes" })}</g></g>`;
  s += `<rect x="110" y="380" width="520" height="640" fill="none" stroke="#2A1E16" stroke-width="30"/><path d="M370 380 V1020 M110 700 H630" stroke="#2A1E16" stroke-width="18"/>`;
  // the bed, you under the blanket (eyes over the edge)
  s += `<rect x="440" y="1480" width="680" height="120" fill="#3A2A20" stroke="${SD.ink}" stroke-width="8"/>`;
  s += `<circle cx="760" cy="1372" r="64" fill="${LN.skin}" stroke="${SD.ink}" stroke-width="9"/>` + lnFace([760, 1372], 64, "fear", -1, 13, SD.ink) + sdBeanie([760, 1372], 64);
  s += `<path d="M460 1470 Q760 1420 1090 1460 L1090 1600 L460 1600Z" fill="#5A6B8A" stroke="${SD.ink}" stroke-width="8"/><path d="M520 1500 Q760 1470 1060 1495" stroke="#46566F" stroke-width="10" fill="none"/>`;
  s += imChip(80, 330, "LAST NIGHT", { fg: "#fff", bg: "#2A3442" });
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".8"/>`;
  return s;
}

// ---------- s7: tonight. Dad's radio on the table lights up ----------
function sdRadio() {
  let s = sdDefs() + `<rect width="1080" height="1920" fill="#0C1220"/><ellipse cx="540" cy="900" rx="620" ry="700" fill="url(#sdMoonG)" opacity=".6"/>`;
  s += `<rect x="0" y="1330" width="1080" height="590" fill="#3A2A20"/><rect x="0" y="1330" width="1080" height="20" fill="#4E3828"/>`;
  s += `<g transform="translate(540 900)"><rect x="40" y="-470" width="34" height="200" rx="12" fill="#22252A" stroke="${SD.ink}" stroke-width="7"/>
    <rect x="-150" y="-300" width="300" height="560" rx="44" fill="#E8B53A" stroke="${SD.ink}" stroke-width="10"/>
    <rect x="-110" y="-250" width="220" height="150" rx="16" fill="#1A1C20" stroke="${SD.ink}" stroke-width="6"/>${imText(0, -160, "CH 3", 48, "#9FE3C4", { anchor: "middle" })}
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M-90 ${-40 + i * 40} H90" stroke="#B8892A" stroke-width="14" stroke-linecap="round"/>`).join("")}
    <circle cx="-100" cy="-275" r="13" fill="#5A5F66"/><g id="rdLed" style="opacity:0"><circle cx="-100" cy="-275" r="13" fill="#7DFFA8"/><circle cx="-100" cy="-275" r="40" fill="#7DFFA8" opacity=".3"/></g>
    ${imText(0, 210, "DAD", 44, SD.ink, { anchor: "middle" })}</g>`;
  s += `<g id="rdWave" style="opacity:0">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${740 + i * 30}" y="${760 - [24, 50, 34, 70, 40, 56, 22][i]}" width="16" height="${[48, 100, 68, 140, 80, 112, 44][i]}" rx="7" fill="#7DFFA8"/>`).join("")}</g>`;
  s += arm([[1200, 1820], [960, 1660], [800, 1480]], "#2A3442", 90);
  s += imChip(80, 330, "TONIGHT · 9:12 PM", { fg: "#fff", bg: "#2A3442" });
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".75"/>`;
  return s;
}

// ---------- s9: through the window. A flashlight is coming through the trees; behind it, one of them stops ----------
function sdFlash() {
  let s = sdDefs() + sdNightSky(9);
  s += sdForest(1080, -60, 1160, 70, 240, 380, "#0C1424", 111) + sdForest(1180, -80, 1180, 90, 420, 600, "#060A10", 112);
  s += `<rect x="0" y="1170" width="1080" height="750" fill="#16212C"/>` + sdForest(1300, 840, 1120, 170, 520, 700, "#04070C", 113);
  s += sdTall({ id: "fsTall", hidden: true, x: 250, y: 1210, h: 470, pose: "hunch" });
  s += `<g id="fsLight" transform="translate(470 1180) scale(0.55)"><g id="fsBob"><path d="M0 0 L-420 -120 L-420 120Z" fill="url(#sdTorchG)" transform="scale(-1 1)"/><circle cx="0" cy="0" r="22" fill="#FFF4C8"/><circle cx="0" cy="0" r="70" fill="#FFF4C8" opacity=".25"/></g></g>`;
  // the window frame you're looking through
  s += `<path d="M0 0 H1080 V1920 H0Z M90 300 V1640 H990 V300Z" fill="#1C140E" fill-rule="evenodd"/><rect x="90" y="300" width="900" height="1340" fill="none" stroke="#2A1E16" stroke-width="28"/><path d="M540 300 V1640 M90 960 H990" stroke="#2A1E16" stroke-width="20"/>`;
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".7"/>`;
  return s;
}

// ---------- s10 (+inset): the porch, lamp ON (they see it too) or OFF (the flashlight is lost in the trees) ----------
function sdPorch(on) {
  let s = sdDefs() + sdNightSky(13);
  s += sdForest(1100, -60, 1160, 80, 260, 420, "#0C1424", 121) + sdForest(1200, -80, 1180, 95, 420, 620, "#060A10", 122);
  s += `<rect x="0" y="1190" width="1080" height="730" fill="#0B120E"/>`;
  if (on) s += sdTall({ x: 340, y: 1330, h: 560, pose: "hunch" }) + sdTall({ x: 760, y: 1290, h: 430 });
  else s += `<g transform="translate(520 1210) scale(0.4)"><path d="M0 0 L420 -120 L420 120Z" fill="url(#sdTorchG)"/><circle cx="0" cy="0" r="22" fill="#FFF4C8"/></g>`;
  s += sdCabin(540, 1760, 1.15, { lampOn: on, wall: on ? "#6B4A32" : "#3E2C20", wallDk: on ? "#4A3222" : "#2A1C12" });
  return s;
}

function sdSwitch(mode) {
  let s = sdDefs() + `<rect width="1080" height="1920" fill="#0C1018"/>`;
  s += `<svg x="0" y="600" width="540" height="1320" viewBox="270 600 540 1320" preserveAspectRatio="xMidYMid slice">${sdPorch(true)}</svg>`;
  s += `<svg x="540" y="600" width="540" height="1320" viewBox="270 600 540 1320" preserveAspectRatio="xMidYMid slice">${sdPorch(false)}</svg>`;
  s += `<path d="M540 600 V1920" stroke="${SD.ink}" stroke-width="8"/>`;
  s += imChip(270, 640, "LIGHT ON", { anchor: "middle", fg: SD.ink, bg: SD.light }) + imChip(810, 640, "LIGHT OFF", { anchor: "middle", fg: "#fff", bg: "#2A3442" });
  if (mode !== "inset") {
    s += `<g id="swOn" style="opacity:0"><rect x="70" y="320" width="420" height="250" rx="22" fill="rgba(6,8,10,.9)" stroke="${SD.paint}" stroke-width="5"/>
      <text x="98" y="400" font-family="Archivo Black" font-size="64" fill="${SD.paint}">ON</text>${imText(98, 462, "DAD: FINDS YOU", 30, SD.paint)}${imText(98, 514, "THEM: FIND YOU TOO", 30, "#E5A0A2")}</g>`;
    s += `<g id="swOff" style="opacity:0"><rect x="590" y="320" width="420" height="250" rx="22" fill="rgba(6,8,10,.9)" stroke="${SD.paint}" stroke-width="5"/>
      <text x="618" y="400" font-family="Archivo Black" font-size="64" fill="${SD.paint}">OFF</text>${imText(618, 462, "RULES: KEPT", 30, SD.paint)}${imText(618, 514, "DAD: IN THE DARK", 30, "#E5A0A2")}</g>`;
  }
  s += `<rect width="1080" height="1920" fill="url(#vig)" opacity=".6"/>`;
  return s;
}

function sdInsetSwitch() { return sdSwitch("inset"); }
