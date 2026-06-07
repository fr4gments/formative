import assert from "node:assert/strict";

import { createPocMusic, sampleBytebeat, sampleFloatAudio, sampleFloatLayers } from "../src/engines/poc-music.js";
import { effectsFromProgram } from "../src/engines/poc-float-audio.js";
import { legacyProgramView } from "../src/engines/program-view.js";
import { parseIkalProgram } from "../src/parser/ikal-parser.js";

const kal = { root: "k", motion: "STA", number: "UPX", matter: "NRM", suffixes: [] };
const ras = { root: "r", motion: "STA", number: "DPX", matter: "NRM", suffixes: [] };
const susTx = { root: "s", motion: "DYN", number: "MPX", matter: "NRM", suffixes: ["tx"] };
const kulGhost = { root: "k", motion: "DYN", number: "UPX", matter: "RPV", suffixes: [] };
const rasCrushFold = { root: "r", motion: "STA", number: "DPX", matter: "NRM", suffixes: ["tx", "šk"] };

assert.deepEqual(sampleBytebeat(0, []), { value: 128, step: 0 });

const one = sampleBytebeat(100, [kal]);
assert.equal(Number.isInteger(one.value), true);
assert.equal(one.step, 0);
assert.equal(one.value >= 0 && one.value <= 255, true);

const layered = sampleBytebeat(2001, [kal, ras, susTx]);
assert.equal(layered.step, 1);
assert.equal(Number.isInteger(layered.value), true);
assert.equal(layered.value >= 0 && layered.value <= 255, true);

assert.deepEqual(sampleFloatAudio(0, []), { value: 0, step: 0 });

const floatOne = sampleFloatAudio(0.1, [kal], 44100);
assert.equal(Number.isFinite(floatOne.value), true);
assert.equal(floatOne.step, 0);
assert.equal(floatOne.value >= -1 && floatOne.value <= 1, true);

const floatSequence = sampleFloatAudio(0.251, [kal, ras, susTx], 44100);
assert.equal(floatSequence.step, 1);
assert.equal(Number.isFinite(floatSequence.value), true);
assert.equal(floatSequence.value >= -1 && floatSequence.value <= 1, true);

const floatLayers = sampleFloatLayers(0.251, [
  { sequence: [kal, ras] },
  { sequence: [susTx] },
], 44100);
assert.equal(floatLayers.steps.length, 2);
assert.deepEqual(floatLayers.steps, [1, 0]);
assert.equal(Number.isFinite(floatLayers.value), true);
assert.equal(floatLayers.value >= -1 && floatLayers.value <= 1, true);

const oneLayer = sampleFloatLayers(0.1, [
  { sequence: [kal] },
], 44100);
const oneSequence = sampleFloatAudio(0.1, [kal], 44100);
assert.equal(oneLayer.value, oneSequence.value);
assert.deepEqual(oneLayer.steps, [0]);

const lockedLayers = sampleFloatLayers(0.251, [
  { sequence: [kal] },
  { sequence: [ras, susTx] },
], 44100);
assert.deepEqual(lockedLayers.steps, [0, 1]);

assert.equal(
  sampleFloatAudio(0.1, [susTx], 44100).value,
  sampleFloatAudio(0.1, [susTx], 44100).value,
);

assert.deepEqual(effectsFromProgram(kal), {
  bitcrushAmount: 0,
  driveAmount: 0,
  ghostAmount: 0,
  jitterAmount: 0,
  reverbAmount: 0,
});

assert.equal(effectsFromProgram(susTx).bitcrushAmount > effectsFromProgram(kal).bitcrushAmount, true);
assert.equal(effectsFromProgram(susTx).jitterAmount > effectsFromProgram(kal).jitterAmount, true);
assert.equal(effectsFromProgram(kulGhost).ghostAmount > effectsFromProgram(kal).ghostAmount, true);
assert.equal(effectsFromProgram(rasCrushFold).driveAmount > effectsFromProgram(susTx).driveAmount, true);

const ikalSequence = parseIkalProgram("ļtala alxrasa ačxwuža").sequence;
assert.equal(ikalSequence.length, 3);
assert.equal(Number.isFinite(sampleFloatAudio(0.1, [ikalSequence[0]], 44100).value), true);
assert.equal(Number.isFinite(sampleFloatAudio(0.251, ikalSequence, 44100).value), true);
assert.equal(Number.isInteger(sampleBytebeat(100, [ikalSequence[0]]).value), true);

const ikalLayers = parseIkalProgram("ļtala alxrasa\načxwuža pswatļa").layers;
const ikalLayeredSample = sampleFloatLayers(0.251, ikalLayers, 44100);
assert.deepEqual(ikalLayeredSample.steps, [1, 1]);
assert.equal(Number.isFinite(ikalLayeredSample.value), true);

const tearEffects = effectsFromProgram(parseIkalProgram("sčala").sequence[0]);
assert.equal(tearEffects.bitcrushAmount > 0.5, true);
assert.equal(tearEffects.jitterAmount > 0.5, true);

const distortionEffects = effectsFromProgram(parseIkalProgram("affrala").sequence[0]);
assert.equal(distortionEffects.driveAmount > 0.7, true);

const affixedIntensityEffects = effectsFromProgram(parseIkalProgram("ļtaloţma").sequence[0]);
assert.equal(affixedIntensityEffects.driveAmount > effectsFromProgram(parseIkalProgram("ļtala").sequence[0]).driveAmount, true);

const affixedDegradationEffects = effectsFromProgram(parseIkalProgram("ļtalařča").sequence[0]);
assert.equal(affixedDegradationEffects.bitcrushAmount > 0.6, true);
assert.equal(affixedDegradationEffects.jitterAmount > 0.2, true);

const dryClick = parseIkalProgram("ļtala").sequence[0];
const reverbClick = parseIkalProgram("ļtalompa").sequence[0];
assert.equal(legacyProgramView(reverbClick).controls.reverb, 0.7);
assert.equal(effectsFromProgram(reverbClick).reverbAmount, 0.7);
assert.notEqual(
  sampleFloatAudio(0.123, [dryClick], 44100).value,
  sampleFloatAudio(0.123, [reverbClick], 44100).value,
);

const cumulativeAffixProgram = parseIkalProgram("ļtaloţmařčompa");
assert.equal(cumulativeAffixProgram.sourceSyntax, "ithkuil");
assert.equal(cumulativeAffixProgram.sequence.length, 1);
assert.equal(cumulativeAffixProgram.sequence[0].text, "ļtaloţmařčompa");
assert.equal(cumulativeAffixProgram.sequence[0].params.audioEffects.intensity, 0.7);
assert.equal(cumulativeAffixProgram.sequence[0].params.audioEffects.degradation, 0.9);
assert.equal(cumulativeAffixProgram.sequence[0].params.audioEffects.reverb, 0.7);
assert.equal(legacyProgramView(cumulativeAffixProgram.sequence[0]).controls.reverb, 0.7);
assert.equal(effectsFromProgram(cumulativeAffixProgram.sequence[0]).bitcrushAmount > 0.6, true);

const sequencedAffixProgram = parseIkalProgram("ļtaloţma ļtalompa");
assert.equal(sequencedAffixProgram.sourceSyntax, "ithkuil");
assert.equal(sequencedAffixProgram.sequence.length, 2);
assert.deepEqual(sequencedAffixProgram.sequence.map((program) => program.text), ["ļtaloţma", "ļtalompa"]);
assert.equal(sequencedAffixProgram.sequence[0].params.audioEffects.intensity, 0.7);
assert.equal(sequencedAffixProgram.sequence[0].params.audioEffects.degradation, 0);
assert.equal(sequencedAffixProgram.sequence[0].params.audioEffects.reverb, 0);
assert.equal(sequencedAffixProgram.sequence[1].params.audioEffects.intensity, 0);
assert.equal(sequencedAffixProgram.sequence[1].params.audioEffects.degradation, 0);
assert.equal(sequencedAffixProgram.sequence[1].params.audioEffects.reverb, 0.7);
assert.equal(sampleFloatAudio(0.1, sequencedAffixProgram.sequence, 44100).step, 0);
assert.equal(sampleFloatAudio(0.251, sequencedAffixProgram.sequence, 44100).step, 1);

function controlsFor(text) {
  return legacyProgramView(parseIkalProgram(text).sequence[0]).controls;
}

assert.deepEqual(
  {
    distortion: controlsFor("affrala(0.1,0.2,0.3)").distortion,
    drive: controlsFor("affrala(0.1,0.2,0.3)").drive,
    saturation: controlsFor("affrala(0.1,0.2,0.3)").saturation,
  },
  { distortion: 0.1, drive: 0.2, saturation: 0.3 },
);
assert.deepEqual(
  {
    bitcrush: controlsFor("sčala(0.1,0.2,0.3)").bitcrush,
    roughness: controlsFor("sčala(0.1,0.2,0.3)").roughness,
    tear: controlsFor("sčala(0.1,0.2,0.3)").tear,
  },
  { bitcrush: 0.2, roughness: 0.3, tear: 0.1 },
);
assert.deepEqual(
  {
    density: controlsFor("alxružla(0.1,0.2,0.3)").density,
    ghost: controlsFor("alxružla(0.1,0.2,0.3)").ghost,
    motion: controlsFor("alxružla(0.1,0.2,0.3)").motion,
  },
  { density: 0.2, ghost: 0.3, motion: 0.1 },
);
assert.equal(
  effectsFromProgram(parseIkalProgram("affrala(0,0,1)").sequence[0]).driveAmount >
    effectsFromProgram(parseIkalProgram("affrala(0,0,0)").sequence[0]).driveAmount,
  true,
);
assert.equal(
  effectsFromProgram(parseIkalProgram("sčala(0,0.9,0)").sequence[0]).bitcrushAmount >
    effectsFromProgram(parseIkalProgram("sčala(0,0.1,0)").sequence[0]).bitcrushAmount,
  true,
);
assert.equal(
  effectsFromProgram(parseIkalProgram("sčala(0,0,0.9)").sequence[0]).jitterAmount >
    effectsFromProgram(parseIkalProgram("sčala(0,0,0.1)").sequence[0]).jitterAmount,
  true,
);

const softDistortion = parseIkalProgram("affrala(0.1)").sequence[0];
const hardDistortion = parseIkalProgram("affrala(0.9)").sequence[0];
assert.equal(legacyProgramView(softDistortion).controls.distortion, 0.1);
assert.equal(legacyProgramView(hardDistortion).controls.distortion, 0.9);
assert.equal(
  effectsFromProgram(hardDistortion).driveAmount > effectsFromProgram(softDistortion).driveAmount,
  true,
);
assert.notEqual(
  sampleFloatAudio(0.123, [softDistortion], 44100).value,
  sampleFloatAudio(0.123, [hardDistortion], 44100).value,
);

const softTear = parseIkalProgram("sčala(0.1)").sequence[0];
const hardTear = parseIkalProgram("sčala(0.9)").sequence[0];
assert.equal(legacyProgramView(softTear).controls.tear, 0.1);
assert.equal(legacyProgramView(hardTear).controls.tear, 0.9);
assert.equal(effectsFromProgram(hardTear).jitterAmount > effectsFromProgram(softTear).jitterAmount, true);
assert.notEqual(
  sampleFloatAudio(0.123, [softTear], 44100).value,
  sampleFloatAudio(0.123, [hardTear], 44100).value,
);

const quietRoll = parseIkalProgram("alxružla(0.1,0.1,0.1)").sequence[0];
const intenseRoll = parseIkalProgram("alxružla(0.9,0.9,0.9)").sequence[0];
assert.equal(legacyProgramView(quietRoll).controls.motion, 0.1);
assert.equal(legacyProgramView(intenseRoll).controls.motion, 0.9);
assert.equal(legacyProgramView(quietRoll).controls.density, 0.1);
assert.equal(legacyProgramView(intenseRoll).controls.density, 0.9);
assert.equal(legacyProgramView(quietRoll).controls.ghost, 0.1);
assert.equal(legacyProgramView(intenseRoll).controls.ghost, 0.9);
assert.notEqual(
  sampleFloatAudio(0.123, [quietRoll], 44100).value,
  sampleFloatAudio(0.123, [intenseRoll], 44100).value,
);

const music = createPocMusic({ win: {} });
assert.equal(music.getVisualProgram(), null);

music.setSequence([kal]);
assert.equal(music.getVisualProgram(), kal);
assert.deepEqual(music.getVisualPrograms(), [kal]);
assert.equal(music.getCurrentStep(), 0);

music.setLayers([
  { sequence: [kal, ras], text: "kal ras" },
  { sequence: [susTx], text: "sus-tx" },
]);
assert.deepEqual(music.getSequence(), [kal, ras]);
assert.equal(music.getLayers().length, 2);
assert.deepEqual(music.getVisualPrograms(), [kal, susTx]);

music.clearSequence();
assert.equal(music.getVisualProgram(), null);
assert.deepEqual(music.getVisualPrograms(), []);

const calls = [];
const messages = [];

class FakeAudioContext {
  constructor() {
    this.audioWorklet = {
      addModule: async (url) => calls.push(["addModule", url]),
    };
    this.destination = "destination";
    this.state = "suspended";
  }

  async resume() {
    calls.push("resume");
    this.state = "running";
  }
}

class FakeAudioWorkletNode {
  constructor(context, name) {
    calls.push(["node", context instanceof FakeAudioContext, name]);
    this.port = {
      onmessage: null,
      postMessage: (message) => messages.push(message),
    };
  }

  connect(destination) {
    calls.push(["connect", destination]);
  }
}

const workletMusic = createPocMusic({
  processorUrl: "/processor.js",
  win: {
    AudioContext: FakeAudioContext,
    AudioWorkletNode: FakeAudioWorkletNode,
  },
});

workletMusic.setLayers([
  { sequence: [kal, ras], text: "kal ras" },
  { sequence: [susTx], text: "sus-tx" },
]);
await workletMusic.start();

assert.deepEqual(calls, [
  ["addModule", "/processor.js"],
  ["node", true, "ikal-poc-music"],
  ["connect", "destination"],
  "resume",
]);
assert.deepEqual(messages, [
  {
    type: "setLayers",
    layers: [
      { sequence: [kal, ras], text: "kal ras" },
      { sequence: [susTx], text: "sus-tx" },
    ],
  },
]);

console.log("poc-music ok");
