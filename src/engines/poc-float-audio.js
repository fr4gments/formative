import { legacyProgramView } from "./program-view.js";

export const STEP_SECONDS = 0.25;
export const GAIN = 0.22;

const TWO_PI = Math.PI * 2;
const REVERB_TAPS = [
  { delay: 0.037, gain: 0.58 },
  { delay: 0.083, gain: 0.38 },
  { delay: 0.149, gain: 0.24 },
  { delay: 0.227, gain: 0.15 },
];
const REVERB_GAIN = 1.25;

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
  const view = legacyProgramView(p);

  if (p.params) {
    const controls = view.controls;

    return {
      bitcrushAmount: clamp(controls.bitcrush + controls.ghost * 0.12, 0, 1),
      driveAmount: clamp(
        controls.drive + controls.distortion * 0.35 + controls.saturation * 0.18 + controls.ghost * 0.10,
        0,
        1,
      ),
      ghostAmount: clamp(controls.ghost, 0, 1),
      jitterAmount: clamp(controls.tear * 0.65 + controls.roughness * 0.18 + controls.motion * 0.04, 0, 1),
      reverbAmount: clamp(controls.reverb, 0, 1),
    };
  }

  let bitcrushAmount = view.matter === "RPV" ? 0.22 : 0;
  let driveAmount = view.matter === "RPV" ? 0.12 : 0;
  let jitterAmount = view.motion === "DYN" ? 0.04 : 0;
  let ghostAmount = view.matter === "RPV" ? 0.45 : 0;

  for (const suffix of view.suffixes) {
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
    reverbAmount: 0,
  };
}

function countForNumber(number) {
  return number === "MPX" ? 3 : number === "DPX" ? 2 : 1;
}

function voiceNoise(time, localTime, p, sampleRate) {
  const view = legacyProgramView(p);
  const count = countForNumber(view.number);
  const motionAmount = view.controls.motion;
  const density = view.controls.density;
  const roughness = view.controls.roughness;
  const motion = Math.sin(time * TWO_PI * 0.33) * motionAmount;
  const tone = Math.sin(time * TWO_PI * (70 + count * 23 + motion * 18)) * 0.22;
  let sum = tone;

  for (let i = 0; i < count; i++) {
    const rate = 250 + i * 180 + motionAmount * (650 + i * 520) + density * 260;
    const noiseIndex = Math.floor((time + i * 17.13) * rate);
    const band = hashNoise(noiseIndex) * ((0.20 + density * 0.22 + roughness * 0.12) / count);
    const wave = Math.sin((localTime * (3 + i * 2 + motionAmount * 1.3) + i * 0.19) * TWO_PI) * 0.12;
    sum += band + wave;
  }

  const sampleNoise = hashNoise(Math.floor(time * sampleRate));
  sum += sampleNoise * (0.04 + motionAmount * 0.10 + density * 0.08 + roughness * 0.08);

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
  const view = legacyProgramView(p);
  const count = countForNumber(view.number);
  const motionAmount = view.controls.motion;
  const roughness = view.controls.roughness;
  const drift = Math.sin(time * TWO_PI * 0.42) * 0.035 * motionAmount;
  let out = clickTrain(localTime, 0.175 + drift, 0, 920);

  if (count >= 2) {
    out += clickTrain(localTime, 0.131, 0.047, 1260) * 0.75;
  }

  if (count >= 3) {
    out += clickTrain(localTime, 0.089, 0.083, 1680) * 0.55;
  }

  return out * (0.72 + roughness * 0.18);
}

function voiceRoll(time, _localTime, p) {
  const view = legacyProgramView(p);
  const count = countForNumber(view.number);
  const motionAmount = view.controls.motion;
  const density = view.controls.density;
  const roughness = view.controls.roughness;
  const dyn = Math.sin(time * TWO_PI * 0.27) * motionAmount;
  const base = 96 + dyn * 30;
  const trem = 0.48 + 0.52 * Math.sin(time * TWO_PI * (4.2 + density * 3.1 + dyn * 1.7));
  let out = 0;

  for (let i = 0; i < count; i++) {
    const freq = base * (1 + i * (0.12 + density * 0.12));
    const wobble = Math.sin(time * TWO_PI * (freq * (1.5 + density * 0.5)) + i * 0.7) * roughness * 0.16;
    out += (Math.sin(time * TWO_PI * freq + i * 1.7) + wobble) / count;
  }

  return out * trem * 0.65;
}

function voiceRoot(time, localTime, p, sampleRate) {
  const view = legacyProgramView(p);

  if (view.root === "s") {
    return voiceNoise(time, localTime, p, sampleRate);
  }

  if (view.root === "k") {
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

function sampleProgramDirect(time, localTime, p, sampleRate) {
  return applyEffects(voiceRoot(time, localTime, p, sampleRate), time, effectsFromProgram(p));
}

function reverbTailForProgram(time, localTime, p, sampleRate) {
  const effects = effectsFromProgram(p);

  if (effects.reverbAmount <= 0) {
    return 0;
  }

  let tail = 0;

  for (const tap of REVERB_TAPS) {
    const delayedTime = time - tap.delay;
    const delayedLocalTime = localTime - tap.delay;

    if (delayedTime < 0 || delayedLocalTime < 0) {
      continue;
    }

    tail += sampleProgramDirect(delayedTime, delayedLocalTime, p, sampleRate) * tap.gain;
  }

  return tail * effects.reverbAmount * REVERB_GAIN;
}

function stepEnvelope(localTime) {
  const attack = 0.008;
  const releaseStart = 0.035;
  const attackAmp = smoothstep(0, attack, localTime);
  const releaseAmp = 1 - smoothstep(releaseStart, STEP_SECONDS, localTime);
  return attackAmp * releaseAmp;
}

function positiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

function sequenceProgramAtTime(time, sequence) {
  const step = Math.floor(time / STEP_SECONDS) % sequence.length;

  return {
    localTime: positiveModulo(time, STEP_SECONDS),
    program: sequence[step],
    step,
  };
}

function reverbTailForSequence(time, sequence, sampleRate) {
  let tail = 0;

  for (const tap of REVERB_TAPS) {
    const delayedTime = time - tap.delay;

    if (delayedTime < 0) {
      continue;
    }

    const delayed = sequenceProgramAtTime(delayedTime, sequence);
    const effects = effectsFromProgram(delayed.program);

    if (effects.reverbAmount <= 0) {
      continue;
    }

    tail += sampleProgramDirect(delayedTime, delayed.localTime, delayed.program, sampleRate)
      * tap.gain
      * effects.reverbAmount;
  }

  return tail * REVERB_GAIN;
}

export function sampleFloatAudio(time, sequence, sampleRate = 44100) {
  const n = sequence.length;

  if (n === 0) {
    return { value: 0, step: 0 };
  }

  if (n === 1) {
    const p = sequence[0];
    const direct = sampleProgramDirect(time, time, p, sampleRate);
    const value = direct + reverbTailForProgram(time, time, p, sampleRate);
    return { value: clamp(value * GAIN, -1, 1), step: 0 };
  }

  return sampleClockedSequence(time, sequence, sampleRate);
}

function sampleClockedSequence(time, sequence, sampleRate) {
  const n = sequence.length;
  const { localTime, program: p, step } = sequenceProgramAtTime(time, sequence);
  const direct = sampleProgramDirect(time, localTime, p, sampleRate) * stepEnvelope(localTime);
  const value = direct + reverbTailForSequence(time, sequence, sampleRate);

  return {
    value: clamp(value * GAIN, -1, 1),
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
