export const STEP_SAMPLES = 2000;
export const SR_BYTEBEAT = 8000;
export const GAIN = 0.20;

function voixBruit(t, p) {
  const drift = p.motion === "DYN" ? (t >> 12) & 7 : 0;
  let g = t ^ (t >> 5) ^ (t >> (3 + drift));

  if (p.number === "MPX") {
    g ^= (t >> 7) ^ (t >> 2);
  } else if (p.number === "DPX") {
    g ^= t >> 7;
  }

  let out = g & 255;

  if (p.matter === "RPV") {
    out &= 0xF0;
  }

  return out & 255;
}

function voixClic(t, p) {
  const drift = p.motion === "DYN" ? ((t >> 13) & 3) * 120 : 0;

  function train(periode, decalage) {
    const ph = (t + decalage) % periode;

    if (ph >= 180) {
      return 0;
    }

    const env = 180 - ph;
    const buzz = ((t * 6) & 255) - 128;
    return (buzz * env) >> 8;
  }

  let s = train(1400 - drift, 0);

  if (p.number === "DPX") {
    s += train(1050, 500);
  } else if (p.number === "MPX") {
    s += train(950, 500);
    s += train(700, 900);
  }

  if (p.matter === "RPV") {
    s >>= 1;
  }

  return (128 + s) & 255;
}

function voixRoulement(t, p) {
  const drift = p.motion === "DYN" ? (t >> 11) & 7 : 0;
  const pitch = 3 + drift;
  const trem = 6 + ((t >> 8) & 7);
  const ton = (m) => ((t * m) & 255) - 128;

  let s = (ton(pitch) * trem) >> 4;

  if (p.number === "DPX") {
    s = (s + ((ton(pitch + 1) * trem) >> 4)) >> 1;
  } else if (p.number === "MPX") {
    s = (((ton(pitch) + ton(pitch + 1) + ton(pitch + 2)) * trem) >> 4) / 3 | 0;
  }

  if (p.matter === "RPV") {
    s >>= 1;
  }

  return (128 + s) & 255;
}

function voixRacine(t, p) {
  return p.root === "s"
    ? voixBruit(t, p)
    : p.root === "k"
      ? voixClic(t, p)
      : voixRoulement(t, p);
}

function appliqueSuffixes(out, t, suffixes) {
  for (const suffix of suffixes) {
    if (suffix === "tx") {
      out = (out ^ (t >> 4)) & 255;
    } else if (suffix === "šk") {
      out = (out * 5) & 255;
    }
  }

  return out & 255;
}

function enveloppe(tStep) {
  const att = 60;

  if (tStep < att) {
    return tStep / att;
  }

  return Math.max(0, 1 - (tStep - att) / (STEP_SAMPLES - att));
}

export function sampleBytebeat(t, sequence) {
  const n = sequence.length;

  if (n === 0) {
    return { value: 128, step: 0 };
  }

  if (n === 1) {
    const p = sequence[0];
    return {
      value: appliqueSuffixes(voixRacine(t, p), t, p.suffixes),
      step: 0,
    };
  }

  const step = Math.floor(t / STEP_SAMPLES) % n;
  const p = sequence[step];
  const out = appliqueSuffixes(voixRacine(t, p), t, p.suffixes);

  return {
    value: (128 + (out - 128) * enveloppe(t % STEP_SAMPLES)) & 255,
    step,
  };
}
