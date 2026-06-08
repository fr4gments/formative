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
  "break-apart": [
    [255, 47, 179],
    [0, 239, 255],
    [255, 255, 220],
  ],
  cloud: [
    [66, 32, 116],
    [0, 221, 255],
    [255, 238, 183],
  ],
  color: [
    [0, 239, 255],
    [255, 47, 179],
    [255, 186, 67],
  ],
  distortion: [
    [108, 63, 255],
    [255, 47, 179],
    [255, 186, 67],
  ],
  filament: [
    [12, 255, 194],
    [255, 47, 179],
    [255, 245, 179],
  ],
  light: [
    [232, 255, 198],
    [0, 239, 255],
    [255, 255, 255],
  ],
  shape: [
    [91, 141, 255],
    [0, 239, 255],
    [236, 252, 255],
  ],
  "spark-scatter": [
    [255, 186, 67],
    [0, 239, 255],
    [255, 255, 255],
  ],
  texture: [
    [71, 255, 137],
    [255, 186, 67],
    [255, 86, 193],
  ],
  trace: [
    [0, 239, 255],
    [255, 47, 179],
    [255, 186, 67],
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
  "break-apart": [255, 186, 67],
  cloud: [255, 238, 183],
  color: [219, 255, 52],
  distortion: [0, 239, 255],
  filament: [255, 245, 179],
  light: [255, 47, 179],
  shape: [255, 47, 179],
  "spark-scatter": [255, 255, 255],
  texture: [0, 239, 255],
  trace: [255, 186, 67],
  rest: [0, 239, 255],
};

const ZERO_CONTROLS = {
  bitcrush: 0,
  brightness: 0,
  chroma: 0,
  contrastBoost: 0,
  diffusion: 0,
  deformation: 0,
  density: 0,
  distortion: 0,
  drive: 0,
  fracture: 0,
  ghost: 0,
  glow: 0,
  motion: 0,
  roughness: 0,
  saturation: 0,
  strands: 0,
  structure: 0,
  tear: 0,
  trails: 0,
  visualTexture: 0,
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
  const family = view?.params?.family;
  return view ? PALETTES[family] || PALETTES[view.root] || PALETTES.rest : PALETTES.rest;
}

function accentForProgram(program) {
  const view = legacyProgramView(program);
  const family = view?.params?.family;
  return view ? ACCENTS[family] || ACCENTS[view.root] || ACCENTS.rest : ACCENTS.rest;
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

function controlsForProgram(p) {
  return legacyProgramView(p)?.controls || ZERO_CONTROLS;
}

function distortionLevel(controls) {
  return clamp(
    controls.distortion * 0.65 +
    controls.drive * 0.40 +
    controls.saturation * 0.28 +
    controls.deformation * 0.72,
    0,
    1,
  );
}

function tearLevel(controls) {
  return clamp(controls.tear + controls.bitcrush * 0.55 + controls.fracture * 0.76, 0, 1);
}

function glitchLevel(p) {
  if (!p) {
    return 0;
  }

  const view = legacyProgramView(p);
  const controls = view.controls;
  let level = 0.03 + controls.motion * 0.16 + controls.density * 0.16;

  if (view.root === "s") {
    level += 0.08;
  } else if (view.root === "r") {
    level += 0.05;
  }

  level += controls.ghost * 0.09;
  level += controls.roughness * 0.10;
  level += controls.visualTexture * 0.13;
  level += controls.diffusion * 0.04;
  level += controls.strands * 0.06;
  level += controls.trails * 0.06;
  level += distortionLevel(controls) * 0.15;
  level += tearLevel(controls) * 0.33;

  return clamp(level, 0, 1);
}

function pickGlitchChar(x, y, f) {
  const index = Math.floor(bruit(x, y, f + 19) * GLITCH_CHARS.length);
  return GLITCH_CHARS[index] || "#";
}

function champBruit(x, y, f, p) {
  const view = legacyProgramView(p);
  const controls = view.controls;
  const move = f * 0.06 * controls.motion;
  const onde = Math.sin(x * 0.25 + move) +
    Math.sin(y * 0.30 - move * 0.8) +
    Math.sin((x + y) * 0.15 + move * 1.2);
  const grain = bruit(x, y, Math.round(f * controls.motion * 0.5));
  const dose = clamp(
    0.08 + controls.density * 0.32 + controls.roughness * 0.12 + controls.visualTexture * 0.24,
    0.08,
    0.68,
  );
  return ((onde + 3) / 6) * (1 - dose) + grain * dose;
}

function champClic(x, y, f, p) {
  const view = legacyProgramView(p);
  const controls = view.controls;
  const periode = 20;
  const ph = 6 * (1 - controls.motion) + (f % periode) * controls.motion;
  const eclat = Math.max(0, periode * 0.35 - ph) / (periode * 0.35);
  const densite = clamp(0.02 + controls.density * 0.14 + controls.roughness * 0.04, 0.01, 0.24);
  return bruit(x, y, 7) < densite ? 0.2 + 0.8 * eclat : 0.0;
}

function champRoulement(x, y, f, p) {
  const view = legacyProgramView(p);
  const controls = view.controls;
  const move = f * 0.28 * controls.motion;
  let v = 0.5 + 0.5 * Math.sin((x + move) * 0.45);
  const cross = 0.5 + 0.5 * Math.sin((y - move) * 0.40);
  const diagonal = 0.5 + 0.5 * Math.sin((x + y - move) * 0.30);
  const vertical = 0.5 + 0.5 * Math.sin((y + move) * 0.5);
  const dense = (v + cross + diagonal + vertical) / 4;
  const duplex = (v + cross) / 2;
  const densityMix = controls.density;

  v = densityMix < 0.5
    ? v * (1 - densityMix * 2) + duplex * densityMix * 2
    : duplex * (1 - (densityMix - 0.5) * 2) + dense * ((densityMix - 0.5) * 2);

  if (controls.roughness > 0) {
    v = v * (1 - controls.roughness * 0.18) + bruit(x, y, f) * controls.roughness * 0.18;
  }

  return v;
}

function champHalo(x, y, f, controls) {
  const cx = x - 44;
  const cy = y - 20;
  const radius = Math.sqrt(cx * cx + cy * cy);
  const ring = 1 - clamp(Math.abs(radius - 13 - Math.sin(f * 0.018) * controls.motion * 2.2) / 8.5, 0, 1);
  const aura = clamp(1 - radius / 34, 0, 1);
  const shimmer = 0.5 + 0.5 * Math.sin(radius * 0.74 + x * 0.05 - y * 0.04 + f * 0.04);

  return clamp(aura * 0.48 + ring * (0.42 + controls.glow * 0.26) + shimmer * controls.glow * 0.18, 0, 1);
}

function champFilament(x, y, f, controls) {
  const drift = f * 0.018 * controls.motion;
  const fold = Math.sin(y * 0.16 + drift) * 3.4 + Math.sin((x + y) * 0.045 - drift) * 4.2;
  const strandA = 1 - Math.abs(Math.sin((x + fold) * 0.38));
  const strandB = 1 - Math.abs(Math.sin((x * 0.16 - y * 0.31) + fold * 0.18));
  const fiber = Math.max(Math.pow(strandA, 8), Math.pow(strandB, 10));
  const fray = bruit(x, y, 503 + (f >> 3)) * (0.24 + controls.visualTexture * 0.34);

  return clamp(fiber * (0.72 + controls.strands * 0.22) + fray, 0, 1);
}

function champNuage(x, y, f, controls) {
  const drift = f * 0.012 * controls.motion;
  const large = 0.5 + 0.5 * Math.sin(x * 0.075 + Math.sin(y * 0.13 + drift) * 2.7);
  const soft = 0.5 + 0.5 * Math.cos(y * 0.11 - drift + Math.sin(x * 0.09) * 2.3);
  const grain = bruit(Math.floor(x / 2), Math.floor(y / 2), 613 + (f >> 4));
  const mass = (large * 0.38 + soft * 0.40 + grain * 0.22);
  const haze = clamp((mass - 0.28) * 1.25, 0, 1);

  return clamp(haze * (0.78 + controls.diffusion * 0.18) + grain * controls.diffusion * 0.16, 0, 1);
}

function champTrace(x, y, f, controls) {
  const drift = f * 0.026 * controls.motion;
  const diagonal = Math.abs(((x + y * 1.72 + drift) % 26) - 13);
  const curve = Math.abs(Math.sin(x * 0.07 + y * 0.18 + drift) * 5.0);
  const band = 1 - clamp((diagonal + curve * 0.35) / 7.2, 0, 1);
  const erasure = bruit(x, y, 727) < 0.18 + controls.visualTexture * 0.28 ? 0.38 : 1;

  return clamp(Math.pow(band, 1.65) * erasure + controls.trails * 0.12, 0, 1);
}

function champEclats(x, y, f, controls) {
  const seed = 811 + Math.floor(f * controls.motion * 0.2);
  const point = bruit(x, y, seed);
  const shard = point > 0.935 - controls.fracture * 0.05 ? 1 : 0;
  const diagonal = Math.abs(((x * 1.9 - y + seed * 0.03) % 17) - 8.5);
  const streak = diagonal < 1.2 && bruit(Math.floor(x / 3), Math.floor(y / 2), seed + 17) > 0.62 ? 0.76 : 0;
  const spark = Math.max(shard, streak);

  return clamp(spark * (0.82 + controls.glow * 0.16) + bruit(x, y, seed + 31) * 0.08, 0, 1);
}

function champMatiere(x, y, f, controls) {
  const grain = bruit(x, y, 941 + (f >> 5));
  const weave = 0.5 + 0.5 * Math.sin(x * 0.7 + Math.sin(y * 0.23) * 1.5);
  const stain = 0.5 + 0.5 * Math.cos((x - y) * 0.17 + grain * 2.5);

  return clamp(grain * 0.44 + weave * controls.visualTexture * 0.32 + stain * 0.26, 0, 1);
}

function champPrimitiveOrganique(x, y, f, view) {
  const family = view.params?.family;
  const controls = view.controls;

  if (family === "light") {
    return champHalo(x, y, f, controls);
  }

  if (family === "filament") {
    return champFilament(x, y, f, controls);
  }

  if (family === "cloud") {
    return champNuage(x, y, f, controls);
  }

  if (family === "trace") {
    return champTrace(x, y, f, controls);
  }

  if (family === "spark-scatter") {
    return champEclats(x, y, f, controls);
  }

  if (family === "texture") {
    return champMatiere(x, y, f, controls);
  }

  return null;
}

function champVal(x, y, f, p) {
  const view = legacyProgramView(p);
  const controls = view.controls;
  let v = champPrimitiveOrganique(x, y, f, view);

  if (v === null) {
    v = view.root === "s"
      ? champBruit(x, y, f, p)
      : view.root === "k"
        ? champClic(x, y, f, p)
        : champRoulement(x, y, f, p);
  }

  const tear = tearLevel(controls);
  const distortion = distortionLevel(controls);
  const structure = controls.structure || 0;

  if (structure > 0) {
    const cx = x - 44;
    const cy = y - 20;
    const radial = Math.abs(Math.sin(Math.sqrt(cx * cx + cy * cy) * 0.19));
    const contour = Math.abs(Math.sin(x * 0.18) - Math.cos(y * 0.24));
    const shaped = clamp(1 - Math.min(radial, contour), 0, 1);
    v = v * (1 - structure * 0.48) + shaped * structure * 0.48;
  }

  if (tear > 0) {
    const torn = 1 - v;
    const mask = bruit(x, y, f) < 0.08 + tear * 0.42 ? tear : tear * 0.18;
    v = v * (1 - mask) + torn * mask;
  }

  if (distortion > 0) {
    const warped = (((v * (1.25 + distortion * 3.0) + bruit(y, x, f) * distortion * 0.42) % 1) + 1) % 1;
    v = v * (1 - distortion) + warped * distortion;
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
  const controls = controlsForProgram(p);

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
  const replaceChance = 0.10 + level * 0.24 + tearLevel(controls) * 0.52;

  if (bruit(y, f, 173) < replaceChance) {
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
  const controls = view.controls;
  v = Math.max(0, Math.min(1, v));
  v = Math.pow(v, 1.18 - distortionLevel(controls) * 0.32);

  const ech = view.matter === "RPV" ? ECHELLE_GHOST : ECHELLE_NET;
  let i = Math.floor(v * ech.length);

  if (i < 0) {
    i = 0;
  }

  if (i >= ech.length) {
    i = ech.length - 1;
  }

  const glitch = tearLevel(controls);
  const saturated = distortionLevel(controls);
  const tear = bruit(x + (f % 11), y, f) > 0.995 - glitch * 0.16;

  if (glitch > 0 && tear) {
    return pickGlitchChar(x, y, f);
  }

  if (saturated > 0 && bruit(x, y, f >> 1) > 0.995 - saturated * 0.10) {
    return "█";
  }

  if (controls.motion > 0 && bruit(x, y, f) > 0.995 - controls.motion * 0.04) {
    return pickGlitchChar(y, x, f);
  }

  return ech[i];
}

export function glyphColor(x, y, f, p) {
  const view = legacyProgramView(p);
  const palette = paletteForProgram(p);
  const controls = view?.controls || ZERO_CONTROLS;
  const depth = p ? clamp(champVal(x, y, f, p), 0, 1) : bruit(x, y, f >> 3);
  const chromaWave = Math.sin(x * 0.13 + y * 0.21 + f * 0.02) * controls.chroma * 0.22;
  const grad = clamp((x + y * 0.8) / 90 + depth * 0.65 + chromaWave, 0, 1);
  const base = grad < 0.5
    ? mixColor(palette[0], palette[1], grad * 2)
    : mixColor(palette[1], palette[2], (grad - 0.5) * 2);
  const ghost = 1 - controls.ghost * 0.42;
  const light = controls.brightness * 0.28;

  return [
    clamp(Math.round(base[0] * ghost + 255 * light), 0, 255),
    clamp(Math.round(base[1] * ghost + 255 * light), 0, 255),
    clamp(Math.round(base[2] * ghost + 255 * light), 0, 255),
  ];
}

export function visualStyleForProgram(program, frame = 0) {
  const view = legacyProgramView(program);
  const palette = paletteForProgram(program);
  const accent = accentForProgram(program);
  const controls = view?.controls || ZERO_CONTROLS;
  const tx = tearLevel(controls);
  const sk = distortionLevel(controls);
  const ghost = 1 - controls.ghost * 0.28;
  const level = glitchLevel(program);
  const pulse = bruit(frame, frame >> 2, 211);
  const jitter = pulse > 0.82 ? level : level * 0.22;
  const rootTilt = view?.root === "k" ? -22 : view?.root === "s" ? 18 : 6;
  const hot = mixColor(palette[1], palette[2], clamp(0.54 + sk * 0.40 + controls.brightness * 0.18, 0, 1));
  const edge = mixColor(accent, palette[2], clamp(0.42 - tx * 0.30 - sk * 0.14, 0.08, 0.42));
  const speed = 0.52 + controls.motion * 1.83 + level * 1.25 + tx * 1.15 + controls.trails * 0.26;
  const shift = ((frame * speed) % 140 - 20).toFixed(2) + "%";
  const drift = ((frame * (0.28 + controls.motion * 1.07 + level)) % 120 - 10).toFixed(2) + "%";
  const angle = (105 + rootTilt + Math.sin(frame * 0.045) * (8 + level * 22)).toFixed(2) + "deg";
  const stopA = (13 + pulse * 9).toFixed(2) + "%";
  const stopB = (34 + level * 12 + pulse * 8).toFixed(2) + "%";
  const stopC = (58 + sk * 9 - tx * 5 + pulse * 5).toFixed(2) + "%";
  const stopD = (78 + level * 8).toFixed(2) + "%";
  const glow = controls.glow > 0.35
    ? "rgba(" + hot[0] + "," + hot[1] + "," + hot[2] + ",0.94)"
    : tx > sk && tx > 0.2
    ? "rgba(255,47,179,0.92)"
    : sk > 0.2
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
    "--ikal-contrast": (
      1.08 +
      level * 0.42 +
      sk * 0.12 +
      controls.roughness * 0.10 +
      controls.contrastBoost * 0.46 +
      controls.structure * 0.12
    ).toFixed(2),
    "--ikal-saturate": (
      1.18 +
      level * 0.95 +
      tx * 0.30 +
      controls.saturation * 0.42 +
      controls.chroma * 0.78 +
      controls.glow * 0.22
    ).toFixed(2),
    "--ikal-scan": (0.12 + level * 0.18).toFixed(2),
    "--ikal-band-alpha": (0.16 + level * 0.26 + tx * 0.10 + controls.diffusion * 0.05 + controls.strands * 0.05).toFixed(2),
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
      ? getPrograms(frame)
      : normalizePrograms(getProgram?.(frame));
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
