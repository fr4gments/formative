import assert from "node:assert/strict";

import { createIkalPocApp } from "../src/ikal-poc.js";

function createElementStub() {
  const listeners = new Map();

  return {
    className: "",
    focused: false,
    textContent: "",
    value: "",
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
    focus() {
      this.focused = true;
    },
  };
}

const cmd = createElementStub();
const readout = createElementStub();
const runButton = createElementStub();
const screen = createElementStub();
const stillButton = createElementStub();
const calls = [];
const sequence = [
  {
    gloss: "clic · figé · 1 seul · net",
    suffixes: [],
    text: "kal",
  },
];

const app = createIkalPocApp({
  cmd,
  readout,
  runButton,
  screen,
  stillButton,
  parse: (text) => text === "bad"
    ? { error: "mot inconnu : « bad »" }
    : text.trim()
      ? {
          layers: text.includes("\n")
            ? [
                { sequence, text: "kal" },
                { sequence: [{ ...sequence[0], text: "ras" }], text: "ras" },
              ]
            : [{ sequence, text }],
          sequence,
          text,
        }
      : { stop: true },
  createMusic: () => ({
    clearSequence: () => calls.push("clear"),
    getVisualProgram: () => null,
    getVisualPrograms: () => [],
    setLayers: (nextLayers) => calls.push(["layers", nextLayers]),
    setSequence: (nextSequence) => calls.push(["sequence", nextSequence]),
    start: () => calls.push("music-start"),
  }),
  createAnimation: ({ getProgram }) => ({
    getSize: () => ({ cols: 12, rows: 5 }),
    pause: () => calls.push("animation-pause"),
    resume: () => calls.push("animation-resume"),
    start: () => {
      getProgram();
      calls.push("animation-start");
    },
  }),
  createImage: () => ({
    draw: ({ cols, rows, program, programs }) => {
      calls.push(["image-draw", cols, rows, program, programs]);
      screen.textContent = "fixed image";
    },
  }),
});

app.start();
assert.equal(cmd.focused, true);
assert.deepEqual(calls, ["animation-start"]);

cmd.value = "kal";
cmd.dispatch("keydown", {
  key: "Enter",
  ctrlKey: true,
  preventDefault: () => calls.push("prevent-default"),
});

assert.deepEqual(calls.slice(1), [
  "prevent-default",
  "animation-resume",
  "music-start",
  ["layers", [{ sequence, text: "kal" }]],
]);
assert.equal(readout.className, "ok");
assert.equal(readout.textContent, "▶ kal   →   clic · figé · 1 seul · net");

stillButton.dispatch("click", {});
assert.deepEqual(calls.slice(-3), [
  "clear",
  "animation-pause",
  ["image-draw", 12, 5, undefined, [sequence[0]]],
]);
assert.equal(screen.textContent, "fixed image");
assert.equal(readout.className, "ok");
assert.equal(readout.textContent, "▣ image fixe : kal   →   clic · figé · 1 seul · net");
assert.equal(cmd.focused, true);

cmd.value = "kal\nras";
runButton.dispatch("click", {});
assert.deepEqual(calls.slice(-3), [
  "animation-resume",
  "music-start",
  [
    "layers",
    [
      { sequence, text: "kal" },
      { sequence: [{ ...sequence[0], text: "ras" }], text: "ras" },
    ],
  ],
]);
assert.equal(readout.className, "ok");
assert.equal(readout.textContent, "▶ 2 couches   ·   2 mots superposés");
assert.equal(cmd.focused, true);

cmd.value = "bad";
app.lance(cmd.value);
assert.equal(readout.className, "err");
assert.equal(readout.textContent, "✗ mot inconnu : « bad »");

cmd.dispatch("keydown", { key: "Escape" });
assert.equal(readout.className, "");
assert.equal(readout.textContent, "— silence —");
assert.deepEqual(calls.slice(-2), ["clear", "animation-resume"]);

const realCalls = [];
const realReadout = createElementStub();
const realApp = createIkalPocApp({
  cmd: createElementStub(),
  readout: realReadout,
  runButton: createElementStub(),
  screen: createElementStub(),
  stillButton: createElementStub(),
  createMusic: () => ({
    clearSequence: () => realCalls.push("clear"),
    getVisualProgram: () => null,
    getVisualPrograms: () => [],
    setLayers: (nextLayers) => realCalls.push(["layers", nextLayers]),
    start: () => realCalls.push("music-start"),
  }),
  createAnimation: () => ({
    getSize: () => ({ cols: 12, rows: 5 }),
    pause: () => realCalls.push("animation-pause"),
    resume: () => realCalls.push("animation-resume"),
    start: () => realCalls.push("animation-start"),
  }),
  createImage: () => ({
    draw: ({ programs }) => realCalls.push(["image-draw", programs]),
  }),
});

realApp.lance("ļtala alxrasa\načxwuža pswatļa");
assert.equal(realReadout.className, "ok");
assert.equal(realReadout.textContent, "▶ 2 couches   ·   4 mots superposés");
assert.equal(realCalls[2][0], "layers");
assert.equal(realCalls[2][1][0].sequence[0].params.family, "click");
assert.equal(realCalls[2][1][1].sequence[0].params.family, "noise");

const routedCalls = [];
const routedReadout = createElementStub();
const routedApp = createIkalPocApp({
  cmd: createElementStub(),
  readout: routedReadout,
  runButton: createElementStub(),
  screen: createElementStub(),
  stillButton: createElementStub(),
  createMusic: () => ({
    clearSequence: () => routedCalls.push("clear"),
    getVisualProgram: () => null,
    getVisualPrograms: () => [],
    setLayers: (nextLayers) => routedCalls.push(["layers", nextLayers]),
    start: () => routedCalls.push("music-start"),
  }),
  createAnimation: ({ getPrograms }) => ({
    getSize: () => ({ cols: 12, rows: 5 }),
    pause: () => routedCalls.push("animation-pause"),
    resume: () => routedCalls.push(["animation-programs", getPrograms().map((program) => program.text)]),
    start: () => routedCalls.push("animation-start"),
  }),
  createImage: () => ({
    draw: ({ programs }) => routedCalls.push(["image-draw", programs.map((program) => program.text)]),
  }),
});

const routedProgram = "alkala:\n  ļtala\nlyala:\n  fřala\nlyula:\n  trala";

routedApp.lance(routedProgram);
assert.equal(routedReadout.className, "ok");
assert.equal(
  routedReadout.textContent,
  "▶ musique 1 couche / 1 mot   ·   image 1 couche / 1 mot   ·   animation 1 couche / 1 mot   ·   visuel animation",
);
assert.deepEqual(routedCalls[0], ["animation-programs", ["trala"]]);
assert.equal(routedCalls[1], "music-start");
assert.equal(routedCalls[2][0], "layers");
assert.deepEqual(routedCalls[2][1].map((layer) => layer.sequence[0].text), ["ļtala"]);

routedApp.imageFixe(routedProgram);
assert.deepEqual(routedCalls.slice(-3), [
  "clear",
  "animation-pause",
  ["image-draw", ["fřala"]],
]);

const imageLastProgram = "alkala:\n  ļtala\nlyula:\n  trala\nlyala:\n  fřala";
routedApp.lance(imageLastProgram);
assert.equal(routedReadout.className, "ok");
assert.equal(
  routedReadout.textContent,
  "▶ musique 1 couche / 1 mot   ·   image 1 couche / 1 mot   ·   animation 1 couche / 1 mot   ·   visuel image",
);
const imageLastTail = routedCalls.slice(-4);
assert.deepEqual(imageLastTail[0], "animation-pause");
assert.deepEqual(imageLastTail[1], ["image-draw", ["fřala"]]);
assert.equal(imageLastTail[2], "music-start");
assert.equal(imageLastTail[3][0], "layers");
assert.deepEqual(imageLastTail[3][1].map((layer) => layer.sequence[0].text), ["ļtala"]);

console.log("ikal-poc ok");
