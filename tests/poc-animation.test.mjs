import assert from "node:assert/strict";

import {
  applyVisualStyle,
  glyphe,
  glyphColor,
  renderAsciiFrame,
  renderColorAsciiFrame,
  visualStyleForProgram,
  visualStyleForPrograms,
} from "../src/engines/poc-animation.js";
import { parseIkalProgram } from "../src/parser/ikal-parser.js";

const program = {
  root: "r",
  motion: "DYN",
  number: "MPX",
  matter: "RPV",
  suffixes: ["šk", "tx"],
};

assert.equal(typeof glyphe(0, 0, 0, null), "string");
assert.equal(glyphe(0, 0, 0, null).length, 1);
assert.equal(typeof glyphe(3, 4, 8, program), "string");
assert.equal(glyphe(3, 4, 8, program).length, 1);
assert.equal(glyphColor(3, 4, 8, program).length, 3);
assert.equal(glyphColor(3, 4, 8, program).every((channel) => channel >= 0 && channel <= 255), true);

const frame = renderAsciiFrame({
  cols: 8,
  rows: 3,
  frame: 12,
  program,
});

assert.equal(frame.split("\n").length, 3);
assert.equal(frame.split("\n")[0].length, 8);
assert.equal(
  frame,
  renderAsciiFrame({
    cols: 8,
    rows: 3,
    frame: 12,
    program,
  }),
);

const colorFrame = renderColorAsciiFrame({
  cols: 4,
  rows: 2,
  frame: 12,
  program,
});

assert.equal(colorFrame.includes("<span"), false);
assert.equal(colorFrame.split("\n").length, 2);

const layeredFrame = renderAsciiFrame({
  cols: 8,
  rows: 3,
  frame: 12,
  programs: [
    program,
    { ...program, root: "s", suffixes: ["tx"] },
  ],
});

assert.equal(layeredFrame.split("\n").length, 3);
assert.equal(layeredFrame.split("\n")[0].length, 8);

const style = visualStyleForProgram(program, 12);
assert.equal(style["--ikal-a"].startsWith("rgb("), true);
assert.equal(style["--ikal-b"].startsWith("rgb("), true);
assert.equal(style["--ikal-c"].startsWith("rgb("), true);
assert.equal(style["--ikal-d"].startsWith("rgb("), true);
assert.equal(style["--ikal-angle"].endsWith("deg"), true);
assert.equal(style["--ikal-shift"].endsWith("%"), true);
assert.equal(style["--ikal-drift"].endsWith("%"), true);
assert.equal(style["--ikal-stop-a"].endsWith("%"), true);
assert.equal(style["--ikal-stop-b"].endsWith("%"), true);
assert.equal(style["--ikal-stop-c"].endsWith("%"), true);
assert.equal(style["--ikal-stop-d"].endsWith("%"), true);
assert.equal(style["--ikal-red-x"].endsWith("px"), true);
assert.equal(style["--ikal-cyan-x"].endsWith("px"), true);
assert.equal(style["--ikal-skew"].endsWith("deg"), true);
assert.equal(Number(style["--ikal-contrast"]) > 1, true);
assert.equal(Number(style["--ikal-saturate"]) > 1, true);
assert.equal(Number(style["--ikal-band-alpha"]) > 0, true);

const layeredStyle = visualStyleForPrograms([
  program,
  { ...program, root: "s", suffixes: ["tx"] },
], 12);
assert.equal(layeredStyle["--ikal-d"].startsWith("rgb("), true);
assert.equal(Number(layeredStyle["--ikal-saturate"]) >= Number(style["--ikal-saturate"]), true);

const styleCalls = [];
applyVisualStyle({
  style: {
    setProperty: (name, value) => styleCalls.push([name, value]),
  },
}, program, 12);
assert.deepEqual(
  styleCalls.map(([name]) => name),
  Object.keys(style),
);

const ikalPrograms = parseIkalProgram("ļtala alxrasa ačxwuža").sequence;
const ikalFrame = renderAsciiFrame({
  cols: 8,
  rows: 3,
  frame: 12,
  programs: ikalPrograms,
});
assert.equal(ikalFrame.split("\n").length, 3);
assert.equal(ikalFrame.split("\n")[0].length, 8);

const ikalStyle = visualStyleForProgram(parseIkalProgram("affrala").sequence[0], 12);
assert.equal(Number(ikalStyle["--ikal-saturate"]) > 1, true);
assert.equal(Number(ikalStyle["--ikal-contrast"]) > 1, true);

console.log("poc-animation ok");
