// scenes.js — one function per shot. Each returns a full 1080×1920 SVG drawing built from kit.js.
// Start with defs(), end with vignette(). Give anything you'll animate an id. Keep faces and key props out of the
// caption band (y ≈ 1180–1380) and out of the right 140 px (where the app's buttons sit).

// s1 (hook): midnight at the edge of the woods; one of them steps out from behind a trunk (stHookTall slides in)
function stHook(mode) {
  let s = defs() + sky("night", 7);
  s += forest(1180, -60, 1160, 80, 260, 420, "#0C1424", 31) + forest(1260, -80, 1180, 95, 420, 640, "#060A10", 32);
  s += ground(1250, "#1A2632");
  s += `<g id="stTall"${mode === "cover" ? "" : ' transform="translate(-260 0)"'}>${creature({ x: 520, y: mode === "cover" ? 1820 : 1520, h: 1000, pose: "hunch", eyesId: "stEyes" })}</g>`;
  s += `<rect x="200" y="220" width="110" height="1400" fill="#05070C"/>`;   // the trunk it hides behind
  s += kid({ x: 860, y: 1700, s: 1.3, back: true });                         // you, from behind
  return s + vignette(0.7);
}

// s2: your phone, one message from your own number
function stPhone() {
  const inner = `<rect width="560" height="900" fill="#0E1015"/>${label(280, 120, "Messages", 34, "#fff", { anchor: "middle" })}
    <rect x="30" y="200" width="500" height="150" rx="30" fill="#1F2C34"/>${label(56, 250, "ME (this phone)", 24, "#9FE3C4")}
    <g id="stMsg" style="opacity:0">${label(56, 310, "don't turn around", 34, "#fff")}</g>`;
  let s = defs() + sky("night", 9) + ground(1250, "#1A2632");
  s += `<g id="stPh">${phone("stPhoneBody", 260, 330, 600, 940, inner)}${glove(560, 1270, 600)}</g>`;
  return s + vignette(0.6);
}

// s3: the choice, what each costs (cards chA / chB appear on their words)
function stChoice(mode) {
  const run = defs() + sky("night", 11) + forest(1300, -60, 1160, 80, 300, 520, "#060A10", 33) + ground(1300, "#1A2632") + kid({ x: 540, y: 1620, s: 1.6, pose: { lean: -18, la: [-60, -20], ra: [60, 20], ll: [-40, -80], rl: [40, 10] } });
  const turn = defs() + sky("night", 12) + ground(1300, "#1A2632") + creature({ x: 540, y: 1760, h: 1100, pose: "reach" });
  return splitChoice({ left: run, right: turn, labels: ["RUN", "TURN"], inset: mode === "inset",
    cards: [["RUN", "IT'S FASTER", "NO LOOKING BACK"], ["TURN", "SEE WHAT IT IS", "IT SEES YOU TOO"]] });
}
function stCover() { return stHook("cover"); }
