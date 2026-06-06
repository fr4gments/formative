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

console.log("ikal-poc ok");
