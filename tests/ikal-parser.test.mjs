import assert from "node:assert/strict";

import { parseIkalProgram } from "../src/parser/ikal-parser.js";

assert.deepEqual(parseIkalProgram(""), { sourceSyntax: "poc", stop: true });

const poc = parseIkalProgram("kal ras");
assert.equal(poc.error, undefined);
assert.equal(poc.sourceSyntax, "poc");
assert.equal(poc.sequence.length, 2);
assert.equal(poc.sequence[0].root, "k");
assert.equal(poc.musicLayers.length, 1);
assert.equal(poc.imageLayers.length, 1);
assert.equal(poc.animationLayers.length, 1);

const one = parseIkalProgram("ļtala");
assert.equal(one.error, undefined);
assert.equal(one.sourceSyntax, "ithkuil");
assert.equal(one.sequence.length, 1);
assert.equal(one.sequence[0].text, "ļtala");
assert.equal(one.sequence[0].params.family, "click");
assert.equal(one.sequence[0].params.role, "voice");
assert.equal(one.sequence[0].baseParams.family, "click");
assert.deepEqual(one.sequence[0].userParams, {});

const sequence = parseIkalProgram("ļtala alxrasa ačxwuža");
assert.equal(sequence.error, undefined);
assert.equal(sequence.sourceSyntax, "ithkuil");
assert.equal(sequence.sequence.length, 3);
assert.deepEqual(
  sequence.sequence.map((program) => program.params.family),
  ["click", "roll", "noise"],
);
assert.equal(sequence.sequence[1].params.multiplicity.configuration, "DPX");
assert.equal(sequence.sequence[2].params.motion.kind, "dynamic");

const positionedDistortion = parseIkalProgram("affrala(0.85)");
assert.equal(positionedDistortion.error, undefined);
assert.equal(positionedDistortion.sequence[0].text, "affrala(0.85)");
assert.deepEqual(positionedDistortion.sequence[0].userParams, {
  effects: { distortion: 0.85 },
});
assert.equal(positionedDistortion.sequence[0].params.effects.distortion, 0.85);
assert.equal(positionedDistortion.sequence[0].params.effects.drive, 0.75);

const positionedBreak = parseIkalProgram("sčala(0.12, 0.34)");
assert.equal(positionedBreak.error, undefined);
assert.deepEqual(positionedBreak.sequence[0].userParams, {
  effects: { bitcrush: 0.34, tear: 0.12 },
});
assert.equal(positionedBreak.sequence[0].params.effects.tear, 0.12);
assert.equal(positionedBreak.sequence[0].params.effects.bitcrush, 0.34);

const positionedRoll = parseIkalProgram("alxružla(0.8, 0.95, 0.4)");
assert.equal(positionedRoll.error, undefined);
assert.deepEqual(positionedRoll.sequence[0].userParams, {
  motion: { amount: 0.8 },
  multiplicity: { density: 0.95 },
  representation: { ghost: 0.4 },
});
assert.equal(positionedRoll.sequence[0].params.motion.amount, 0.8);
assert.equal(positionedRoll.sequence[0].params.multiplicity.density, 0.95);
assert.equal(positionedRoll.sequence[0].params.representation.ghost, 0.4);

const affixedAudio = parseIkalProgram("ļtaloţmařčompa");
assert.equal(affixedAudio.error, undefined);
assert.equal(affixedAudio.sourceSyntax, "ithkuil");
assert.equal(affixedAudio.sequence[0].text, "ļtaloţmařčompa");
assert.equal(affixedAudio.sequence[0].params.audioEffects.intensity, 0.7);
assert.equal(affixedAudio.sequence[0].params.audioEffects.degradation, 0.9);
assert.equal(affixedAudio.sequence[0].params.audioEffects.reverb, 0.7);
assert.equal(affixedAudio.sequence[0].diagnostics.length, 0);

const tooManyAffixes = parseIkalProgram("ļtaloţmöjmüsmařča");
assert.equal(tooManyAffixes.error, undefined);
assert.equal(
  tooManyAffixes.diagnostics.some((item) => item.code === "too-many-audio-effects"),
  true,
);

assert.equal(
  parseIkalProgram("affrala(0.777)").error,
  "paramètre invalide : « 0.777 » (attendu : nombre entre 0 et 1, maximum 2 décimales)",
);
assert.equal(
  parseIkalProgram("affrala(1.2)").error,
  "paramètre invalide : « 1.2 » (attendu : nombre entre 0 et 1, maximum 2 décimales)",
);
assert.equal(
  parseIkalProgram("affrala(-0.1)").error,
  "paramètre invalide : « -0.1 » (attendu : nombre entre 0 et 1, maximum 2 décimales)",
);
assert.equal(
  parseIkalProgram("affrala(0.1,0.2,0.3,0.4)").error,
  "trop de paramètres pour « affrala » : attendu 3, reçu 4",
);
assert.equal(
  parseIkalProgram("alkala(0.5)").error,
  "ce mot IKAL n'accepte pas encore de paramètres : « alkala »",
);

const layers = parseIkalProgram("ļtala alxrasa\načxwuža pswatļa");
assert.equal(layers.error, undefined);
assert.equal(layers.sourceSyntax, "ithkuil");
assert.equal(layers.layers.length, 2);
assert.equal(layers.layers[0].sequence.length, 2);
assert.equal(layers.layers[1].sequence.length, 2);
assert.equal(layers.layers[0].mode, "music");
assert.equal(layers.layers[0].implicitMode, true);
assert.equal(layers.musicLayers.length, 2);
assert.equal(layers.imageLayers.length, 0);
assert.equal(layers.animationLayers.length, 0);
assert.deepEqual(
  layers.layers.map((layer) => layer.sequence[0].params.family),
  ["click", "noise"],
);

const declaredModeLayers = parseIkalProgram("alkala:\n  ļtala\nlyala:\n  fřala\nlyula:\n  trala");
assert.equal(declaredModeLayers.error, undefined);
assert.equal(declaredModeLayers.sourceSyntax, "ithkuil");
assert.equal(declaredModeLayers.layers.length, 3);
assert.deepEqual(
  declaredModeLayers.layers.map((layer) => layer.mode),
  ["music", "image", "animation"],
);
assert.deepEqual(
  declaredModeLayers.layers.map((layer) => layer.modeToken),
  ["alkala", "lyala", "lyula"],
);
assert.deepEqual(
  declaredModeLayers.musicLayers.map((layer) => layer.sequence[0].text),
  ["ļtala"],
);
assert.deepEqual(
  declaredModeLayers.imageLayers.map((layer) => layer.sequence[0].text),
  ["fřala"],
);
assert.deepEqual(
  declaredModeLayers.animationLayers.map((layer) => layer.sequence[0].text),
  ["trala"],
);
assert.equal(declaredModeLayers.sequence[0].text, "ļtala");

const declaredModeBlocks = parseIkalProgram("alkala:\n  ļtala ļtalompa\n  alxrasa\nlyala:\n  fřala\nlyula:\n  trala");
assert.equal(declaredModeBlocks.error, undefined);
assert.equal(declaredModeBlocks.sourceSyntax, "ithkuil");
assert.equal(declaredModeBlocks.layers.length, 4);
assert.deepEqual(
  declaredModeBlocks.layers.map((layer) => layer.mode),
  ["music", "music", "image", "animation"],
);
assert.deepEqual(
  declaredModeBlocks.musicLayers.map((layer) => layer.sequence.map((program) => program.text)),
  [["ļtala", "ļtalompa"], ["alxrasa"]],
);
assert.deepEqual(
  declaredModeBlocks.imageLayers.map((layer) => layer.sequence.map((program) => program.text)),
  [["fřala"]],
);
assert.deepEqual(
  declaredModeBlocks.animationLayers.map((layer) => layer.sequence.map((program) => program.text)),
  [["trala"]],
);

const withModeWord = parseIkalProgram("alkala ļtala");
assert.equal(withModeWord.error, undefined);
assert.equal(withModeWord.sequence.length, 1);
assert.equal(withModeWord.sequence[0].text, "ļtala");
assert.equal(withModeWord.words[0].params.role, "mode");

assert.equal(
  parseIkalProgram("kšala").error,
  "forme Ithkuil valide, mais racine non encore mappée par IKAL : root=kš",
);
assert.equal(
  parseIkalProgram("ļtala\nkšala").error,
  "ligne 2 : forme Ithkuil valide, mais racine non encore mappée par IKAL : root=kš",
);
assert.equal(
  parseIkalProgram("alkala").error,
  "aucun mot IKAL exploitable dans la ligne",
);
assert.equal(
  parseIkalProgram("alkala:").error,
  "aucune couche IKAL exploitable",
);
assert.equal(
  parseIkalProgram("alkala: ļtala").error,
  "déclaration de mode invalide : « alkala: » doit être seule sur sa ligne",
);
assert.equal(
  parseIkalProgram("alkala:\nļtala").error,
  "ligne 2 : instruction de bloc non indentée : « ļtala »",
);
assert.equal(
  parseIkalProgram("lyala:\n  ļtala").error,
  "ligne 2 : mot « ļtala » du domaine music incompatible avec le mode image",
);
assert.equal(
  parseIkalProgram("alkala:\n  fřala").error,
  "ligne 2 : mot « fřala » du domaine image incompatible avec le mode music",
);
assert.equal(
  parseIkalProgram("lyula:\n  fřala").error,
  "ligne 2 : mot « fřala » du domaine image incompatible avec le mode animation",
);

console.log("ikal-parser ok");
