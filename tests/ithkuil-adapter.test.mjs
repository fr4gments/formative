import assert from "node:assert/strict";

import { generateIthkuilWord, parseIthkuilWord } from "../src/parser/ithkuil-adapter.js";

const simple = parseIthkuilWord("kšala");
assert.equal(simple.error, undefined);
assert.equal(simple.ithkuil.source, "kšala");
assert.equal(simple.ithkuil.normalized, "kšala");
assert.equal(simple.ithkuil.type, "formative");
assert.equal(simple.ithkuil.wordType, "formative");
assert.equal(simple.ithkuil.formativeType, "UNF/C");
assert.equal(simple.ithkuil.root, "kš");
assert.equal(simple.ithkuil.stem, 1);
assert.equal(simple.ithkuil.function, "STA");
assert.equal(simple.ithkuil.specification, "BSC");
assert.equal(simple.ithkuil.context, "EXS");
assert.deepEqual(simple.ithkuil.ca, {});
assert.deepEqual(simple.ithkuil.affixes, {
  slotV: [],
  slotVII: [],
});
assert.equal(simple.ithkuil.parsed.root, "kš");
assert.equal(simple.ithkuil.parsed.function, "STA");
assert.equal(simple.ithkuil.parsed.case, "THM");
assert.equal(typeof simple.ithkuil.gloss, "string");
assert.equal(simple.ithkuil.gloss.length > 0, true);
assert.equal(simple.ithkuil.gloss, simple.ithkuil.glosses.short);
assert.equal(simple.ithkuil.glosses.full.length > 0, true);
assert.equal(simple.ithkuil.gloss.includes("[object Object]"), false);

const generated = generateIthkuilWord({
  type: "UNF/C",
  root: "lxr",
  function: "DYN",
  ca: {
    configuration: "MFC",
    essence: "RPV",
  },
});

assert.equal(generated, "alxružla");

const mapped = parseIthkuilWord("ļtutļa");
assert.equal(mapped.error, undefined);
assert.equal(mapped.ithkuil.type, "formative");
assert.equal(mapped.ithkuil.root, "ļt");
assert.equal(mapped.ithkuil.function, "DYN");
assert.equal(mapped.ithkuil.ca.essence, "RPV");
assert.equal(mapped.ithkuil.parsed.case, "THM");

const affixed = parseIthkuilWord("ļtaloţmařčompa");
assert.equal(affixed.error, undefined);
assert.equal(affixed.ithkuil.type, "formative");
assert.equal(affixed.ithkuil.root, "ļt");
assert.equal(affixed.ithkuil.normalized, "ļtaloţmařčompa");
assert.deepEqual(affixed.ithkuil.affixes.slotV, []);
assert.deepEqual(affixed.ithkuil.affixes.slotVII, [
  { cs: "ţm", degree: 7, type: 1 },
  { cs: "řč", degree: 1, type: 1 },
  { cs: "mp", degree: 7, type: 1 },
]);
assert.deepEqual(affixed.ithkuil.parsed.slotVIIAffixes, affixed.ithkuil.affixes.slotVII);

const slotVAffixed = parseIthkuilWord("ļtaţmolla");
assert.equal(slotVAffixed.error, undefined);
assert.deepEqual(slotVAffixed.ithkuil.affixes.slotV, [
  { cs: "ţm", degree: 7, type: 1 },
]);
assert.deepEqual(slotVAffixed.ithkuil.affixes.slotVII, []);

const generatedNoiseReverb = parseIthkuilWord("ačxwužumpa");
assert.equal(generatedNoiseReverb.error, undefined);
assert.equal(generatedNoiseReverb.ithkuil.root, "čxw");
assert.equal(generatedNoiseReverb.ithkuil.function, "DYN");
assert.deepEqual(generatedNoiseReverb.ithkuil.affixes.slotVII, [
  { cs: "mp", degree: 9, type: 1 },
]);

const visualScale = parseIthkuilWord("ufthalöxa");
assert.equal(visualScale.error, undefined);
assert.equal(visualScale.ithkuil.root, "fth");
assert.equal(visualScale.ithkuil.stem, 3);
assert.deepEqual(visualScale.ithkuil.affixes.slotVII, [
  { cs: "x", degree: 6, type: 1 },
]);

const visualCombo = parseIthkuilWord("avtalöxäňva");
assert.equal(visualCombo.error, undefined);
assert.equal(visualCombo.ithkuil.root, "vt");
assert.deepEqual(visualCombo.ithkuil.affixes.slotVII, [
  { cs: "x", degree: 6, type: 1 },
  { cs: "ňv", degree: 2, type: 1 },
]);

const coalescentFilament = parseIthkuilWord("avtarļa");
assert.equal(coalescentFilament.error, undefined);
assert.equal(coalescentFilament.ithkuil.root, "vt");
assert.equal(coalescentFilament.ithkuil.normalized, "avtarļa");
assert.equal(coalescentFilament.ithkuil.ca.affiliation, "COA");
assert.deepEqual(coalescentFilament.ithkuil.affixes, {
  slotV: [],
  slotVII: [],
});

const associativeCloud = parseIthkuilWord("ufthanļa");
assert.equal(associativeCloud.error, undefined);
assert.equal(associativeCloud.ithkuil.root, "fth");
assert.equal(associativeCloud.ithkuil.stem, 3);
assert.equal(associativeCloud.ithkuil.ca.affiliation, "ASO");

const variativeMotion = parseIthkuilWord("traňa");
assert.equal(variativeMotion.error, undefined);
assert.equal(variativeMotion.ithkuil.root, "tr");
assert.equal(variativeMotion.ithkuil.ca.affiliation, "VAR");

const referential = parseIthkuilWord("royež");
assert.equal(referential.error, undefined);
assert.equal(referential.ithkuil.type, "referential");
assert.equal(referential.ithkuil.root, undefined);
assert.deepEqual(referential.ithkuil.parsed.referents, ["1m:BEN"]);
assert.equal(referential.ithkuil.parsed.case, "ERG");

assert.equal(
  parseIthkuilWord("").error,
  "mot Ithkuil vide",
);
assert.equal(
  parseIthkuilWord("hlarrau-laza").error,
  "forme Ithkuil non reconnue : « hlarrau-laza »",
);

console.log("ithkuil-adapter ok");
