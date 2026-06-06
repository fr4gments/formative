import assert from "node:assert/strict";

import { createPocMusic, sampleBytebeat, sampleFloatAudio } from "../src/engines/poc-music.js";
import { effectsFromProgram } from "../src/engines/poc-float-audio.js";

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

assert.equal(
  sampleFloatAudio(0.1, [susTx], 44100).value,
  sampleFloatAudio(0.1, [susTx], 44100).value,
);

assert.deepEqual(effectsFromProgram(kal), {
  bitcrushAmount: 0,
  driveAmount: 0,
  ghostAmount: 0,
  jitterAmount: 0,
});

assert.equal(effectsFromProgram(susTx).bitcrushAmount > effectsFromProgram(kal).bitcrushAmount, true);
assert.equal(effectsFromProgram(susTx).jitterAmount > effectsFromProgram(kal).jitterAmount, true);
assert.equal(effectsFromProgram(kulGhost).ghostAmount > effectsFromProgram(kal).ghostAmount, true);
assert.equal(effectsFromProgram(rasCrushFold).driveAmount > effectsFromProgram(susTx).driveAmount, true);

const music = createPocMusic({ win: {} });
assert.equal(music.getVisualProgram(), null);

music.setSequence([kal]);
assert.equal(music.getVisualProgram(), kal);
assert.equal(music.getCurrentStep(), 0);

music.clearSequence();
assert.equal(music.getVisualProgram(), null);

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

workletMusic.setSequence([kal, ras]);
await workletMusic.start();

assert.deepEqual(calls, [
  ["addModule", "/processor.js"],
  ["node", true, "ikal-poc-music"],
  ["connect", "destination"],
  "resume",
]);
assert.deepEqual(messages, [
  { type: "setSequence", sequence: [kal, ras] },
]);

console.log("poc-music ok");
