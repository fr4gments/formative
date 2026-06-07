import assert from "node:assert/strict";

import { parseIthkuilWord } from "../src/parser/ithkuil-adapter.js";
import { seedRootForIthkuil } from "../src/parser/ithkuil-seed-roots.js";
import { paramsForIthkuilWord, resolveIkalParams } from "../src/parser/ithkuil-to-params.js";

function paramsForForm(form) {
  const parsed = parseIthkuilWord(form);
  assert.equal(parsed.error, undefined, form);

  const seedRoot = seedRootForIthkuil(parsed.ithkuil);
  const result = paramsForIthkuilWord({ ithkuil: parsed.ithkuil, seedRoot });

  assert.equal(result.diagnostics.length, 0, form);
  assert.ok(result.baseParams, form);
  assert.ok(result.params, form);
  assert.deepEqual(result.userParams, {}, form);
  assert.deepEqual(result.params, result.baseParams, form);

  return result.params;
}

const click = paramsForForm("ļtala");
assert.equal(click.version, 1);
assert.equal(click.role, "voice");
assert.equal(click.family, "click");
assert.equal(click.motion.kind, "static");
assert.equal(click.multiplicity.configuration, "UPX");
assert.equal(click.multiplicity.count, 1);
assert.equal(click.representation.essence, "NRM");
assert.equal(click.representation.ghost, 0);

const ghostClick = paramsForForm("ļtutļa");
assert.equal(ghostClick.family, "click");
assert.equal(ghostClick.motion.kind, "dynamic");
assert.equal(ghostClick.representation.essence, "RPV");
assert.equal(ghostClick.representation.ghost > 0, true);

const duplexRoll = paramsForForm("alxrasa");
assert.equal(duplexRoll.family, "roll");
assert.equal(duplexRoll.multiplicity.configuration, "DPX");
assert.equal(duplexRoll.multiplicity.count, 2);
assert.equal(duplexRoll.multiplicity.texture, "duplex");

const noiseCloud = paramsForForm("ačxwuža");
assert.equal(noiseCloud.family, "noise");
assert.equal(noiseCloud.motion.kind, "dynamic");
assert.equal(noiseCloud.multiplicity.configuration, "MFC");
assert.equal(noiseCloud.multiplicity.texture, "multiplex-fuzzy-connected");
assert.equal(noiseCloud.effects.roughness > 0.7, true);

const ghostBreath = paramsForForm("pswatļa");
assert.equal(ghostBreath.family, "breath");
assert.equal(ghostBreath.representation.kind, "representative");

const breakApart = paramsForForm("sčala");
assert.equal(breakApart.role, "modifier");
assert.equal(breakApart.family, "break-apart");
assert.equal(breakApart.effects.tear > 0.8, true);
assert.equal(breakApart.effects.bitcrush > 0.5, true);

const distortion = paramsForForm("affrala");
assert.equal(distortion.role, "modifier");
assert.equal(distortion.family, "distortion");
assert.equal(distortion.effects.distortion > 0.8, true);
assert.equal(distortion.effects.drive > 0.7, true);

const musicMode = paramsForForm("alkala");
assert.equal(musicMode.role, "mode");
assert.equal(musicMode.mode, "music");

const animationMode = paramsForForm("lyula");
assert.equal(animationMode.role, "mode");
assert.equal(animationMode.mode, "animation");
assert.equal(animationMode.motion.kind, "dynamic");

const withAffix = {
  ...parseIthkuilWord("ļtala").ithkuil,
  affixes: { slotV: [{}], slotVII: [] },
};
const affixResult = paramsForIthkuilWord({ ithkuil: withAffix, seedRoot: seedRootForIthkuil(withAffix) });
assert.ok(affixResult.params);
assert.equal(affixResult.diagnostics[0].code, "unsupported-affixes");

const base = paramsForForm("alxružla");
const resolved = resolveIkalParams(base, {
  effects: { drive: 1.4, roughness: 0.4 },
  family: "noise",
  motion: { amount: 0.25 },
  representation: { ghost: 0.8 },
});
assert.equal(resolved.params.family, "roll");
assert.equal(resolved.params.effects.drive, 1);
assert.equal(resolved.params.effects.roughness, 0.4);
assert.equal(resolved.params.motion.amount, 0.25);
assert.equal(resolved.params.representation.ghost, 0.8);
assert.equal(resolved.diagnostics[0].code, "unsupported-user-param");

const invalid = resolveIkalParams(base, { effects: { drive: "loud" } });
assert.equal(invalid.params.effects.drive, base.effects.drive);
assert.equal(invalid.diagnostics[0].code, "invalid-user-param");

console.log("ithkuil-to-params ok");
