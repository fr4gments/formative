import assert from "node:assert/strict";

import { visualStyleForProgram } from "../src/engines/poc-animation.js";
import { createPocImage, renderAsciiImage, renderColorAsciiImage } from "../src/engines/poc-image.js";

const program = {
  root: "s",
  motion: "STA",
  number: "DPX",
  matter: "NRM",
  suffixes: ["tx"],
};

const image = renderAsciiImage({
  cols: 10,
  rows: 4,
  program,
});

assert.equal(image.split("\n").length, 4);
assert.equal(image.split("\n")[0].length, 10);
assert.equal(
  image,
  renderAsciiImage({
    cols: 10,
    rows: 4,
    program,
  }),
);

assert.notEqual(
  image,
  renderAsciiImage({
    cols: 10,
    rows: 4,
    frame: 7,
    program,
  }),
);

const colorImage = renderColorAsciiImage({
  cols: 5,
  rows: 2,
  program,
});

assert.equal(colorImage.includes("<span"), false);
assert.equal(colorImage.split("\n").length, 2);

const layeredImage = renderColorAsciiImage({
  cols: 5,
  rows: 2,
  programs: [
    program,
    { ...program, root: "r", suffixes: ["šk"] },
  ],
});

assert.equal(layeredImage.includes("<span"), false);
assert.equal(layeredImage.split("\n").length, 2);

const styleCalls = [];
const screen = {
  innerHTML: "old",
  textContent: "old",
  style: {
    setProperty: (name, value) => styleCalls.push([name, value]),
  },
};
const engine = createPocImage({ screen });
const drawn = engine.draw({ cols: 6, rows: 2, program });

assert.equal(screen.textContent, drawn);
assert.equal(screen.textContent.split("\n").length, 2);
assert.deepEqual(
  styleCalls.map(([name]) => name),
  Object.keys(visualStyleForProgram(program)),
);

engine.clear();
assert.equal(screen.textContent, "");

const layeredStyleCalls = [];
const layeredScreen = {
  textContent: "",
  style: {
    setProperty: (name, value) => layeredStyleCalls.push([name, value]),
  },
};
const layeredEngine = createPocImage({ screen: layeredScreen });
layeredEngine.draw({
  cols: 6,
  rows: 2,
  programs: [
    program,
    { ...program, root: "r", suffixes: ["šk"] },
  ],
});
assert.equal(layeredScreen.textContent.split("\n").length, 2);
assert.deepEqual(
  layeredStyleCalls.map(([name]) => name),
  Object.keys(visualStyleForProgram(program)),
);

console.log("poc-image ok");
