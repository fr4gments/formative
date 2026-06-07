import assert from "node:assert/strict";

import { analyzeIthkuilToken, parseIthkuilProgram } from "../src/parser/ithkuil-program-parser.js";

assert.deepEqual(parseIthkuilProgram(""), { stop: true });

const mapped = analyzeIthkuilToken("alkala");
assert.equal(mapped.error, undefined);
assert.equal(mapped.word.text, "alkala");
assert.equal(mapped.word.ithkuil.type, "formative");
assert.equal(mapped.word.ithkuil.root, "lk");
assert.equal(mapped.word.seedRoot.family, "music");
assert.deepEqual(mapped.word.userParams, {});
assert.deepEqual(mapped.word.params, mapped.word.baseParams);
assert.equal(mapped.word.params.role, "mode");
assert.equal(mapped.word.params.mode, "music");
assert.deepEqual(mapped.diagnostics, []);

const dynamicVisual = analyzeIthkuilToken("lyula");
assert.equal(dynamicVisual.word.ithkuil.root, "ly");
assert.equal(dynamicVisual.word.ithkuil.function, "DYN");
assert.equal(dynamicVisual.word.seedRoot.domain, "animation");
assert.equal(dynamicVisual.word.params.motion.kind, "dynamic");

const migrated = analyzeIthkuilToken("alxružla");
assert.equal(migrated.word.seedRoot.family, "ghost-roll-cloud");
assert.equal(migrated.word.params.family, "roll");
assert.equal(migrated.word.params.multiplicity.configuration, "MFC");
assert.equal(migrated.word.params.representation.essence, "RPV");

const unmapped = analyzeIthkuilToken("kšala");
assert.equal(unmapped.error, undefined);
assert.equal(unmapped.word.ithkuil.root, "kš");
assert.equal(unmapped.word.seedRoot, null);
assert.equal(unmapped.word.baseParams, null);
assert.equal(unmapped.word.params, null);
assert.equal(unmapped.diagnostics.length, 1);
assert.equal(unmapped.diagnostics[0].code, "unmapped-root");
assert.equal(
  unmapped.diagnostics[0].message,
  "forme Ithkuil valide, mais racine non encore mappée par IKAL : root=kš",
);

const referential = analyzeIthkuilToken("royež");
assert.equal(referential.error, undefined);
assert.equal(referential.word.ithkuil.type, "referential");
assert.equal(referential.word.seedRoot, null);
assert.equal(referential.word.baseParams, null);
assert.equal(referential.word.params, null);
assert.equal(referential.diagnostics[0].code, "unsupported-word-type");

assert.equal(
  parseIthkuilProgram("hlarrau-laza").error,
  "forme Ithkuil non reconnue : « hlarrau-laza »",
);
assert.equal(
  parseIthkuilProgram("alkala\nhlarrau-laza").error,
  "ligne 2 : forme Ithkuil non reconnue : « hlarrau-laza »",
);

const layered = parseIthkuilProgram("alkala lyala\nkšala royež");
assert.equal(layered.error, undefined);
assert.equal(layered.text, "alkala lyala\nkšala royež");
assert.equal(layered.layers.length, 2);
assert.equal(layered.layers[0].mode, "music");
assert.equal(layered.layers[0].implicitMode, true);
assert.equal(layered.words.length, 4);
assert.equal(layered.words[0].ithkuil.root, "lk");
assert.equal(layered.words[1].seedRoot.family, "visual-design");
assert.equal(layered.words[2].ithkuil.root, "kš");
assert.equal(layered.words[3].ithkuil.type, "referential");
assert.deepEqual(
  layered.diagnostics.map((item) => item.code),
  ["unmapped-root", "unsupported-word-type"],
);
assert.deepEqual(
  layered.diagnostics.map((item) => item.line),
  [2, 2],
);

const declaredModes = parseIthkuilProgram("alkala:\n  ļtala\nlyala:\n  fřala\nlyula:\n  trala");
assert.equal(declaredModes.error, undefined);
assert.deepEqual(
  declaredModes.layers.map((layer) => layer.mode),
  ["music", "image", "animation"],
);
assert.deepEqual(
  declaredModes.layers.map((layer) => layer.implicitMode),
  [false, false, false],
);
assert.deepEqual(
  declaredModes.layers.map((layer) => layer.modeToken),
  ["alkala", "lyala", "lyula"],
);
assert.deepEqual(
  declaredModes.layers.map((layer) => layer.bodyText),
  ["ļtala", "fřala", "trala"],
);
assert.equal(declaredModes.layers[0].modeWord.params.role, "mode");
assert.equal(declaredModes.layers[0].words[0].text, "ļtala");
assert.equal(declaredModes.layers[1].words[0].text, "fřala");
assert.equal(declaredModes.layers[2].words[0].text, "trala");

const declaredBlocks = parseIthkuilProgram("alkala:\n  ļtala ļtalompa\n  alxrasa\nlyala:\n  fřala\nlyula:\n  trala");
assert.equal(declaredBlocks.error, undefined);
assert.deepEqual(
  declaredBlocks.layers.map((layer) => layer.mode),
  ["music", "music", "image", "animation"],
);
assert.deepEqual(
  declaredBlocks.layers.map((layer) => layer.implicitMode),
  [false, false, false, false],
);
assert.deepEqual(
  declaredBlocks.layers.map((layer) => layer.modeToken),
  ["alkala", "alkala", "lyala", "lyula"],
);
assert.deepEqual(
  declaredBlocks.layers.map((layer) => layer.bodyText),
  ["ļtala ļtalompa", "alxrasa", "fřala", "trala"],
);
assert.equal(declaredBlocks.layers[0].modeWord.text, "alkala");
assert.equal(declaredBlocks.layers[0].words[0].text, "ļtala");
assert.equal(declaredBlocks.layers[0].words[1].text, "ļtalompa");

assert.equal(
  parseIthkuilProgram("alkala: ļtala").error,
  "déclaration de mode invalide : « alkala: » doit être seule sur sa ligne",
);
assert.equal(
  parseIthkuilProgram("alkala:\nļtala").error,
  "ligne 2 : instruction de bloc non indentée : « ļtala »",
);
assert.equal(
  parseIthkuilProgram("ļtala: alxrasa").error,
  "déclaration de mode invalide : « ļtala: » (attendu : alkala:, lyala: ou lyula:)",
);

console.log("ithkuil-program-parser ok");
