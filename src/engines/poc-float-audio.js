export const STEP_SECONDS = 0.25;
export const GAIN = 0.22;

const TWO_PI = Math.PI * 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function hashNoise(index) {
  let h = (index * 374761393) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (((h >>> 0) / 4294967295) * 2) - 1;
}

function bitcrush(value, bits) {
  const steps = 2 ** bits;
  return Math.round(value * steps) / steps;
}

function fold(value) {
  return Math.sin(value * Math.PI * 0.5);
}

export function effectsFromProgram(p) {
  let bitcrushAmount = p.matter === "RPV" ? 0.22 : 0;
  let driveAmount = p.matter === "RPV" ? 0.12 : 0;
  let jitterAmount = p.motion === "DYN" ? 0.04 : 0;
  let ghostAmount = p.matter === "RPV" ? 0.45 : 0;

  for (const suffix of p.suffixes) {
    if (suffix === "tx") {
      bitcrushAmount += 0.62;
      jitterAmount += 0.55;
    } else if (suffix === "šk") {
      driveAmount += 0.72;
      bitcrushAmount += 0.16;
    }
  }

  return {
    bitcrushAmount: clamp(bitcrushAmount, 0, 1),
    driveAmount: clamp(driveAmount, 0, 1),
    ghostAmount: clamp(ghostAmount, 0, 1),
    jitterAmount: clamp(jitterAmount, 0, 1),
  };
}

function countForNumber(number) {
  return number === "MPX" ? 3 : number === "DPX" ? 2 : 1;
}

function voiceNoise(time, localTime, p, sampleRate) {
  const count = countForNumber(p.number);
  const motion = p.motion === "DYN" ? Math.sin(time * TWO_PI * 0.33) : 0;
  const tone = Math.sin(time * TWO_PI * (70 + count * 23 + motion * 18)) * 0.22;
  let sum = tone;

  for (let i = 0; i < count; i++) {
    const rate = p.motion === "DYN" ? 900 + i * 700 : 250 + i * 180;
    const noiseIndex = Math.floor((time + i * 17.13) * rate);
    const band = hashNoise(noiseIndex) * (0.34 / count);
    const wave = Math.sin((localTime * (3 + i * 2) + i * 0.19) * TWO_PI) * 0.12;
    sum += band + wave;
  }

  const sampleNoise = hashNoise(Math.floor(time * sampleRate));
  sum += sampleNoise * (p.motion === "DYN" ? 0.16 : 0.06);

  return sum;
}

function clickTrain(time, period, offset, freq) {
  const phase = (time + offset) % period;
  const length = 0.035;

  if (phase >= length) {
    return 0;
  }

  const env = Math.exp(-phase * 85);
  const bite = Math.sin(phase * TWO_PI * freq) + Math.sin(phase * TWO_PI * freq * 1.97) * 0.45;
  return bite * env;
}

function voiceClick(time, localTime, p) {
  const count = countForNumber(p.number);
  const drift = p.motion === "DYN" ? Math.sin(time * TWO_PI * 0.42) * 0.035 : 0;
  let out = clickTrain(localTime, 0.175 + drift, 0, 920);

  if (count >= 2) {
    out += clickTrain(localTime, 0.131, 0.047, 1260) * 0.75;
  }

  if (count >= 3) {
    out += clickTrain(localTime, 0.089, 0.083, 1680) * 0.55;
  }

  return out * 0.8;
}

function voiceRoll(time, _localTime, p) {
  const count = countForNumber(p.number);
  const dyn = p.motion === "DYN" ? Math.sin(time * TWO_PI * 0.27) : 0;
  const base = 96 + dyn * 30;
  const trem = 0.55 + 0.45 * Math.sin(time * TWO_PI * (5.5 + dyn * 1.7));
  let out = 0;

  for (let i = 0; i < count; i++) {
    const freq = base * (1 + i * 0.19);
    out += Math.sin(time * TWO_PI * freq + i * 1.7) / count;
  }

  return out * trem * 0.65;
}

function voiceRoot(time, localTime, p, sampleRate) {
  if (p.root === "s") {
    return voiceNoise(time, localTime, p, sampleRate);
  }

  if (p.root === "k") {
    return voiceClick(time, localTime, p, sampleRate);
  }

  return voiceRoll(time, localTime, p, sampleRate);
}

function applyEffects(value, time, effects) {
  let out = value;

  if (effects.ghostAmount > 0) {
    const hollow = Math.sin(out * Math.PI) * 0.5;
    out = out * (1 - effects.ghostAmount) + hollow * effects.ghostAmount;
    out *= 1 - effects.ghostAmount * 0.35;
  }

  if (effects.jitterAmount > 0) {
    const gate = Math.sign(Math.sin(time * TWO_PI * (61 + effects.jitterAmount * 83))) || 1;
    const torn = out * gate + hashNoise(Math.floor(time * 1300)) * 0.18;
    out = out * (1 - effects.jitterAmount) + torn * effects.jitterAmount;
  }

  if (effects.driveAmount > 0) {
    const driven = fold(out * (1 + effects.driveAmount * 4.2));
    out = out * (1 - effects.driveAmount) + driven * effects.driveAmount;
  }

  if (effects.bitcrushAmount > 0) {
    const bits = Math.round(16 - effects.bitcrushAmount * 12);
    const crushed = bitcrush(out, clamp(bits, 3, 16));
    out = out * (1 - effects.bitcrushAmount) + crushed * effects.bitcrushAmount;
  }

  return out;
}

function stepEnvelope(localTime) {
  const attack = 0.008;
  const releaseStart = 0.035;
  const attackAmp = smoothstep(0, attack, localTime);
  const releaseAmp = 1 - smoothstep(releaseStart, STEP_SECONDS, localTime);
  return attackAmp * releaseAmp;
}

export function sampleFloatAudio(time, sequence, sampleRate = 44100) {
  const n = sequence.length;

  if (n === 0) {
    return { value: 0, step: 0 };
  }

  if (n === 1) {
    const p = sequence[0];
    const value = applyEffects(voiceRoot(time, time, p, sampleRate), time, effectsFromProgram(p));
    return { value: clamp(value * GAIN, -1, 1), step: 0 };
  }

  return sampleClockedSequence(time, sequence, sampleRate);
}

function sampleClockedSequence(time, sequence, sampleRate) {
  const n = sequence.length;
  const step = Math.floor(time / STEP_SECONDS) % n;
  const localTime = time % STEP_SECONDS;
  const p = sequence[step];
  const value = applyEffects(voiceRoot(time, localTime, p, sampleRate), time, effectsFromProgram(p));

  return {
    value: clamp(value * stepEnvelope(localTime) * GAIN, -1, 1),
    step,
  };
}

function sequenceFromLayer(layer) {
  return Array.isArray(layer) ? layer : layer.sequence || [];
}

export function sampleFloatLayers(time, layers, sampleRate = 44100) {
  const sequences = layers
    .map(sequenceFromLayer)
    .filter((sequence) => sequence.length > 0);
  const n = sequences.length;

  if (n === 0) {
    return { value: 0, step: 0, steps: [] };
  }

  if (n === 1) {
    const sample = sampleFloatAudio(time, sequences[0], sampleRate);
    return { ...sample, steps: [sample.step] };
  }

  let value = 0;
  const steps = new Array(n);

  for (let i = 0; i < n; i++) {
    const sample = sampleClockedSequence(time, sequences[i], sampleRate);
    value += sample.value;
    steps[i] = sample.step;
  }

  return {
    value: clamp(value / Math.sqrt(n), -1, 1),
    step: steps[0] || 0,
    steps,
  };
}
