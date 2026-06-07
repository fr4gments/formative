import { legacyProgramView } from "./program-view.js";

const ECHELLE_NET = " .·:-=+*oO#%▓█";
const ECHELLE_GHOST = "  .·:░▒  .· ";
const GLITCH_CHARS = "░▒▓█#%@&/\\|!?<>[]{}";

const PALETTES = {
  k: [
    [0, 239, 255],
    [91, 141, 255],
    [236, 252, 255],
  ],
  r: [
    [108, 63, 255],
    [255, 47, 179],
    [255, 186, 67],
  ],
  s: [
    [14, 255, 116],
    [219, 255, 52],
    [255, 255, 220],
  ],
  rest: [
    [67, 255, 113],
    [124, 252, 106],
    [232, 255, 198],
  ],
};

const ACCENTS = {
  k: [255, 47, 179],
  r: [0, 239, 255],
  s: [255, 47, 179],
  rest: [0, 239, 255],
};

function bruit(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 1274126177) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return ((h >>> 0) % 1000) / 1000;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mixChannel(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function mixColor(a, b, t) {
  return [
    mixChannel(a[0], b[0], t),
    mixChannel(a[1], b[1], t),
    mixChannel(a[2], b[2], t),
  ];
}

function colorToCss(color) {
  return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function paletteForProgram(program) {
  const view = legacyProgramView(program);
  return view ? PALETTES[view.root] || PALETTES.rest : PALETTES.rest;
}

function accentForProgram(program) {
  const view = legacyProgramView(program);
  return view ? ACCENTS[view.root] || ACCENTS.rest : ACCENTS.rest;
}

function normalizePrograms(program, programs) {
  const source = Array.isArray(programs)
    ? programs
    : Array.isArray(program)
      ? program
      : program
        ? [program]
        : [];

  return source.filter(Boolean);
}

function hasSuffix(p, suffix) {
  return legacyProgramView(p)?.suffixes.includes(suffix) || false;
}

function glitchLevel(p) {
  if (!p) {
    return 0;
  }

  const view = legacyProgramView(p);
  let level = view.motion === "DYN" ? 0.16 : 0.03;

  if (view.number === "DPX") {
    level += 0.08;
  } else if (view.number === "MPX") {
    level += 0.16;
  }

  if (view.root === "s") {
    level += 0.08;
  } else if (view.root === "r") {
    level += 0.05;
  }

  if (view.matter === "RPV") {
    level += 0.09;
  }

  if (hasSuffix(p, "šk")) {
    level += 0.15;
  }

  if (hasSuffix(p, "tx")) {
    level += 0.33;
  }

  return clamp(level, 0, 1);
}

function pickGlitchChar(x, y, f) {
  const index = Math.floor(bruit(x, y, f + 19) * GLITCH_CHARS.length);
  return GLITCH_CHARS[index] || "#";
}

function champBruit(x, y, f, p) {
  const view = legacyProgramView(p);
  const move = view.motion === "DYN" ? f * 0.06 : 0;
  const onde = Math.sin(x * 0.25 + move) +
    Math.sin(y * 0.30 - move * 0.8) +
    Math.sin((x + y) * 0.15 + move * 1.2);
  const grain = bruit(x, y, view.motion === "DYN" ? f >> 1 : 0);
  const dose = view.number === "MPX" ? 0.35 : view.number === "DPX" ? 0.22 : 0.10;
  return ((onde + 3) / 6) * (1 - dose) + grain * dose;
}

function champClic(x, y, f, p) {
  const view = legacyProgramView(p);
  const periode = 20;
  const ph = view.motion === "DYN" ? f % periode : 6;
  const eclat = Math.max(0, periode * 0.35 - ph) / (periode * 0.35);
  const densite = view.number === "MPX" ? 0.14 : view.number === "DPX" ? 0.05 : 0.02;
  return bruit(x, y, 7) < densite ? 0.2 + 0.8 * eclat : 0.0;
}

function champRoulement(x, y, f, p) {
  const view = legacyProgramView(p);
  const move = view.motion === "DYN" ? f * 0.28 : 0;
  let v = 0.5 + 0.5 * Math.sin((x + move) * 0.45);

  if (view.number === "DPX") {
    v = 0.5 * v + 0.5 * (0.5 + 0.5 * Math.sin((y - move) * 0.40));
  } else if (view.number === "MPX") {
    v = (v +
      (0.5 + 0.5 * Math.sin((x + y - move) * 0.30)) +
      (0.5 + 0.5 * Math.sin((y + move) * 0.5))) / 3;
  }

  return v;
}

function champVal(x, y, f, p) {
  const view = legacyProgramView(p);
  let v = view.root === "s"
    ? champBruit(x, y, f, p)
    : view.root === "k"
      ? champClic(x, y, f, p)
      : champRoulement(x, y, f, p);

  for (const suffix of view.suffixes) {
    if (suffix === "tx" && ((bruit(x, y, f) * 8) | 0) === 0) {
      v = 1 - v;
    } else if (suffix === "šk") {
      v = (((v * 3.4 + bruit(y, x, f) * 0.35) % 1) + 1) % 1;
    }
  }

  return v;
}

function repeatGlitch(width, y, f) {
  let text = "";

  for (let x = 0; x < width; x++) {
    text += pickGlitchChar(x, y, f);
  }

  return text;
}

function shiftLine(line, amount) {
  if (amount > 0) {
    return " ".repeat(amount) + line.slice(0, Math.max(0, line.length - amount));
  }

  if (amount < 0) {
    const start = Math.min(line.length, -amount);
    return line.slice(start) + " ".repeat(start);
  }

  return line;
}

function glitchLine(line, y, f, p) {
  const level = glitchLevel(p);

  if (level <= 0) {
    return line;
  }

  const burst = bruit(f, y, 43) > 0.90 ? 0.22 : 0;
  const chance = 0.025 + level * 0.16 + burst;

  if (bruit(y, f, 71) > chance) {
    return line;
  }

  const maxShift = Math.max(1, Math.floor(level * 10));
  const shift = Math.round((bruit(y, f, 101) - 0.5) * maxShift * 2);
  let out = shiftLine(line, shift);
  const cols = out.length;
  const width = clamp(
    Math.floor(cols * (0.04 + bruit(y, f, 131) * (0.10 + level * 0.18))),
    2,
    Math.max(2, Math.floor(cols * 0.42)),
  );
  const start = Math.floor(bruit(y, f, 151) * Math.max(1, cols - width));

  if (hasSuffix(p, "tx") || bruit(y, f, 173) > 0.62) {
    out = out.slice(0, start) +
      repeatGlitch(width, y, f) +
      out.slice(start + width);
  }

  return out;
}

function pickLayerProgram(programs, x, y, f) {
  if (programs.length === 0) {
    return null;
  }

  if (programs.length === 1) {
    return programs[0];
  }

  const band = Math.floor((x * 0.11 + y * 0.47 + f * 0.045) % programs.length);
  const staticMix = Math.floor(bruit(x, y, f >> 3) * programs.length);
  const tear = bruit(x + f, y, 307) > 0.86 ? 1 : 0;
  return programs[(band + staticMix + tear) % programs.length];
}

function reposGlyphe(x, y, f) {
  return bruit(x, y, f >> 3) > 0.985 ? "·" : " ";
}

export function glyphe(x, y, f, p) {
  if (!p) {
    return reposGlyphe(x, y, f);
  }

  let v = champVal(x, y, f, p);
  const view = legacyProgramView(p);
  v = Math.max(0, Math.min(1, v));
  v = Math.pow(v, hasSuffix(p, "šk") ? 0.86 : 1.18);

  const ech = view.matter === "RPV" ? ECHELLE_GHOST : ECHELLE_NET;
  let i = Math.floor(v * ech.length);

  if (i < 0) {
    i = 0;
  }

  if (i >= ech.length) {
    i = ech.length - 1;
  }

  const glitch = hasSuffix(p, "tx");
  const saturated = hasSuffix(p, "šk");
  const tear = bruit(x + (f % 11), y, f) > (glitch ? 0.88 : 0.985);

  if (glitch && tear) {
    return pickGlitchChar(x, y, f);
  }

  if (saturated && bruit(x, y, f >> 1) > 0.94) {
    return "█";
  }

  if (view.motion === "DYN" && bruit(x, y, f) > 0.975) {
    return pickGlitchChar(y, x, f);
  }

  return ech[i];
}

export function glyphColor(x, y, f, p) {
  const view = legacyProgramView(p);
  const palette = paletteForProgram(p);
  const depth = p ? clamp(champVal(x, y, f, p), 0, 1) : bruit(x, y, f >> 3);
  const grad = clamp((x + y * 0.8) / 90 + depth * 0.65, 0, 1);
  const base = grad < 0.5
    ? mixColor(palette[0], palette[1], grad * 2)
    : mixColor(palette[1], palette[2], (grad - 0.5) * 2);
  const ghost = view?.matter === "RPV" ? 0.58 : 1;

  return [
    Math.round(base[0] * ghost),
    Math.round(base[1] * ghost),
    Math.round(base[2] * ghost),
  ];
}

export function visualStyleForProgram(program, frame = 0) {
  const view = legacyProgramView(program);
  const palette = paletteForProgram(program);
  const accent = accentForProgram(program);
  const tx = view?.suffixes.includes("tx") ? 1 : 0;
  const sk = view?.suffixes.includes("šk") ? 1 : 0;
  const ghost = view?.matter === "RPV" ? 0.78 : 1;
  const level = glitchLevel(program);
  const pulse = bruit(frame, frame >> 2, 211);
  const jitter = pulse > 0.82 ? level : level * 0.22;
  const rootTilt = view?.root === "k" ? -22 : view?.root === "s" ? 18 : 6;
  const hot = mixColor(palette[1], palette[2], sk ? 0.94 : 0.54);
  const edge = mixColor(accent, palette[2], tx ? 0.12 : sk ? 0.28 : 0.42);
  const speed = view?.motion === "DYN"
    ? 2.35 + level * 2.2 + tx * 1.15
    : 0.52 + level * 0.65;
  const shift = ((frame * speed) % 140 - 20).toFixed(2) + "%";
  const drift = ((frame * (view?.motion === "DYN" ? 1.35 + level : 0.28)) % 120 - 10).toFixed(2) + "%";
  const angle = (105 + rootTilt + Math.sin(frame * 0.045) * (8 + level * 22)).toFixed(2) + "deg";
  const stopA = (13 + pulse * 9).toFixed(2) + "%";
  const stopB = (34 + level * 12 + pulse * 8).toFixed(2) + "%";
  const stopC = (58 + sk * 9 - tx * 5 + pulse * 5).toFixed(2) + "%";
  const stopD = (78 + level * 8).toFixed(2) + "%";
  const glow = tx
    ? "rgba(255,47,179,0.92)"
    : sk
      ? "rgba(255,186,67,0.86)"
      : "rgba(" + palette[1][0] + "," + palette[1][1] + "," + palette[1][2] + ",0.74)";
  const chroma = (0.45 + level * 2.4 + tx * 1.2 + jitter * 3.2).toFixed(2) + "px";
  const cyan = (-0.35 - level * 1.8 - jitter * 2.6).toFixed(2) + "px";
  const skew = ((pulse - 0.5) * level * 1.7).toFixed(3) + "deg";

  return {
    "--ikal-a": colorToCss(mixColor(palette[0], [0, 0, 0], 1 - ghost)),
    "--ikal-b": colorToCss(palette[1]),
    "--ikal-c": colorToCss(hot),
    "--ikal-d": colorToCss(edge),
    "--ikal-angle": angle,
    "--ikal-glow": glow,
    "--ikal-shift": shift,
    "--ikal-drift": drift,
    "--ikal-stop-a": stopA,
    "--ikal-stop-b": stopB,
    "--ikal-stop-c": stopC,
    "--ikal-stop-d": stopD,
    "--ikal-red-x": chroma,
    "--ikal-cyan-x": cyan,
    "--ikal-skew": skew,
    "--ikal-contrast": (1.08 + level * 0.42 + sk * 0.12).toFixed(2),
    "--ikal-saturate": (1.18 + level * 0.95 + tx * 0.30).toFixed(2),
    "--ikal-scan": (0.12 + level * 0.18).toFixed(2),
    "--ikal-band-alpha": (0.16 + level * 0.26 + tx * 0.10).toFixed(2),
  };
}

export function visualStyleForPrograms(programs, frame = 0) {
  const clean = normalizePrograms(null, programs);

  if (clean.length <= 1) {
    return visualStyleForProgram(clean[0] || null, frame);
  }

  const primary = clean[frame % clean.length];
  const secondary = clean[(frame + 1) % clean.length];
  const tertiary = clean[(frame + 2) % clean.length];
  const base = visualStyleForProgram(primary, frame);
  const primaryPalette = paletteForProgram(primary);
  const secondaryPalette = paletteForProgram(secondary);
  const tertiaryPalette = paletteForProgram(tertiary);
  const accent = accentForProgram(clean[clean.length - 1]);

  return {
    ...base,
    "--ikal-a": colorToCss(primaryPalette[0]),
    "--ikal-b": colorToCss(secondaryPalette[1]),
    "--ikal-c": colorToCss(tertiaryPalette[2]),
    "--ikal-d": colorToCss(mixColor(accent, secondaryPalette[2], 0.24)),
    "--ikal-band-alpha": clamp(Number(base["--ikal-band-alpha"]) + clean.length * 0.055, 0, 0.72).toFixed(2),
    "--ikal-saturate": clamp(Number(base["--ikal-saturate"]) + clean.length * 0.12, 1, 3.2).toFixed(2),
  };
}

export function applyVisualStyle(screen, program, frame = 0) {
  const style = Array.isArray(program)
    ? visualStyleForPrograms(program, frame)
    : visualStyleForProgram(program, frame);

  for (const [name, value] of Object.entries(style)) {
    if (screen.style?.setProperty) {
      screen.style.setProperty(name, value);
    } else {
      screen.style = screen.style || {};
      screen.style[name] = value;
    }
  }
}

export function renderAsciiFrame({ cols, rows, frame, program, programs }) {
  const activePrograms = normalizePrograms(program, programs);
  const lines = new Array(rows);

  for (let y = 0; y < rows; y++) {
    let line = "";

    for (let x = 0; x < cols; x++) {
      line += glyphe(x, y, frame, pickLayerProgram(activePrograms, x, y, frame));
    }

    lines[y] = glitchLine(line, y, frame, pickLayerProgram(activePrograms, 0, y, frame));
  }

  return lines.join("\n");
}

export function renderColorAsciiFrame({ cols, rows, frame, program, programs }) {
  return renderAsciiFrame({ cols, rows, frame, program, programs });
}

export function createPocAnimation({ screen, getProgram, getPrograms, win = window, doc = document }) {
  let cols = 80;
  let rows = 40;
  let frame = 0;
  let dernier = 0;
  let paused = false;

  function mesureGrille() {
    const sp = doc.createElement("span");
    sp.textContent = "0";
    sp.style.cssText = "position:absolute;visibility:hidden;" +
      'font-family:"DejaVu Sans Mono",Menlo,Consolas,monospace;font-size:15px;line-height:1;';
    doc.body.appendChild(sp);
    const r = sp.getBoundingClientRect();
    doc.body.removeChild(sp);

    const cw = r.width || 9;
    const ch = r.height || 15;

    cols = Math.min(220, Math.max(20, Math.floor(win.innerWidth / cw)));
    rows = Math.min(90, Math.max(12, Math.floor(win.innerHeight / ch)));
  }

  function dessine() {
    const programs = typeof getPrograms === "function"
      ? getPrograms()
      : normalizePrograms(getProgram());
    applyVisualStyle(screen, programs, frame);
    screen.textContent = renderAsciiFrame({
      cols,
      rows,
      frame,
      programs,
    });
  }

  function boucle(ts) {
    win.requestAnimationFrame(boucle);

    if (paused) {
      return;
    }

    if (ts - dernier < 33) {
      return;
    }

    dernier = ts;
    frame++;
    dessine();
  }

  function start() {
    win.addEventListener("resize", mesureGrille);
    mesureGrille();
    win.requestAnimationFrame(boucle);
  }

  return {
    getSize: () => ({ cols, rows }),
    pause: () => { paused = true; },
    resume: () => { paused = false; },
    start,
    mesureGrille,
    dessine,
  };
}
