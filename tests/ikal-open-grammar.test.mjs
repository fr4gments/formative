// Étape 7 — grammaire OUVERTE. Trois garanties :
// 1. Vérité de référence : chaque forme des fixtures (ex-manifests) est
//    DÉCOMPOSÉE par le parser avec exactement les affixes / affiliations /
//    graines attendus — plus aucune consultation de liste.
// 2. Combinaisons illimitées : des formes absentes des fixtures (degrés
//    arbitraires, affiliation + affixes) sont acceptées et décomposées,
//    et les diagnostics restent justes sur des formes jamais vues.
// 3. Conformité croisée : le runtime extrait (navigateur) décompose chaque
//    forme exactement comme la bibliothèque @zsnout/ithkuil de référence.
import assert from "node:assert/strict";

import { parseWord as referenceParseWord } from "@zsnout/ithkuil/parse/index.js";

import { parseWord as bundledParseWord } from "../src/parser/generated/ithkuil-runtime.js";
import { generateIthkuilWord } from "../src/parser/ithkuil-adapter.js";
import { analyzeIthkuilToken } from "../src/parser/ithkuil-program-parser.js";
import {
  composeIkalForm,
  ikalAffiliationSuggestionForms,
  ikalAudioSuggestionForms,
  ikalVisualSuggestionForms,
} from "../src/parser/ikal-form-composer.js";
import { IKAL_GENERATED_AUDIO_AFFIX_FORMS } from "./fixtures/ikal-audio-affixed-forms.js";
import { IKAL_GENERATED_VISUAL_AFFIX_FORMS } from "./fixtures/ikal-visual-affixed-forms.js";
import { IKAL_GENERATED_AFFILIATION_FORMS } from "./fixtures/ikal-affiliation-forms.js";

const fixtures = [
  ...IKAL_GENERATED_AUDIO_AFFIX_FORMS,
  ...IKAL_GENERATED_VISUAL_AFFIX_FORMS,
  ...IKAL_GENERATED_AFFILIATION_FORMS,
];

// --- 1. Chaque forme de fixture se décompose vers la vérité enregistrée. ---

for (const entry of fixtures) {
  const result = analyzeIthkuilToken(entry.form, 1);

  assert.equal(result.error, undefined, "forme rejetée : " + entry.form);

  const ithkuil = result.word.ithkuil;

  assert.equal(ithkuil.root, entry.root, "racine de " + entry.form);
  assert.deepEqual(ithkuil.affixes.slotV, entry.slotVAffixes || [], "Slot V de " + entry.form);
  assert.deepEqual(ithkuil.affixes.slotVII, entry.slotVIIAffixes || [], "Slot VII de " + entry.form);
  assert.equal(result.word.seedRoot?.form, entry.baseForm, "graine de " + entry.form);

  if (entry.affiliation) {
    assert.equal(ithkuil.ca.affiliation, entry.affiliation, "affiliation de " + entry.form);
    assert.equal(result.word.params.conjugation.affiliation, entry.affiliation);
  }

  const codes = result.diagnostics.map((diagnostic) => diagnostic.code);

  if (entry.kind === "diagnostic-too-many") {
    assert.equal(codes.includes("too-many-audio-effects") || codes.includes("too-many-visual-effects"), true,
      "diagnostic « trop d'effets » attendu pour " + entry.form);
  }

  if (entry.kind === "diagnostic-slot-v") {
    assert.equal(codes.includes("unsupported-audio-affix-slot") || codes.includes("unsupported-visual-affix-slot"), true,
      "diagnostic Slot V attendu pour " + entry.form);
  }
}

// --- 2a. Combinaisons absentes des fixtures : acceptées et décomposées. ---

// Trois affixes audio à degrés arbitraires (les fixtures ne couvrent que les
// combos à degrés par défaut).
const tripleLibre = generateIthkuilWord({
  root: "ļt",
  slotVIIAffixes: [
    { cs: "ţm", degree: 3, type: 1 },
    { cs: "jm", degree: 2, type: 1 },
    { cs: "mp", degree: 4, type: 1 },
  ],
});

assert.equal(fixtures.some((entry) => entry.form === tripleLibre), false,
  "le test doit porter sur une forme hors fixtures");

const triple = analyzeIthkuilToken(tripleLibre, 1);

assert.equal(triple.error, undefined);
assert.equal(triple.diagnostics.length, 0);
assert.equal(triple.word.params.audioEffects.intensity, 0.3);
assert.equal(triple.word.params.audioEffects.randomModulation, 0.2);
assert.equal(triple.word.params.audioEffects.reverb, 0.4);

// Affiliation + affixe visuel sur le même mot (deux fixtures séparées avant,
// jamais combinées) : la conjugaison ET l'effet sont lus ensemble.
const conjugueAffixe = composeIkalForm(
  { cr: "vt", form: "avtala" },
  { affiliation: "COA", slotVIIAffixes: [{ cs: "x", degree: 7, type: 1 }] },
);

assert.equal(fixtures.some((entry) => entry.form === conjugueAffixe), false);

const sculpteEchelle = analyzeIthkuilToken(conjugueAffixe, 1);

assert.equal(sculpteEchelle.error, undefined);
assert.equal(sculpteEchelle.diagnostics.length, 0);
assert.equal(sculpteEchelle.word.params.conjugation.affiliation, "COA");
assert.equal(sculpteEchelle.word.params.visualAffixes.scale, 7);
assert.equal(sculpteEchelle.word.seedRoot.form, "avtala",
  "la graine de bruit vient du mot de base, pas du texte tapé");

// --- 2b. Diagnostics sur des formes jamais vues. ---

// Racine Ithkuil valide mais hors vocabulaire IKAL.
const inconnue = analyzeIthkuilToken("wala", 1);

assert.equal(inconnue.error, undefined);
assert.equal(inconnue.diagnostics.some((diagnostic) => diagnostic.code === "unmapped-root"), true);

// Affixe Ithkuil valide mais non mappé artistiquement, sur racine connue.
const affixeInconnu = analyzeIthkuilToken(
  generateIthkuilWord({ root: "ļt", slotVIIAffixes: [{ cs: "pļ", degree: 5, type: 1 }] }),
  1,
);

assert.equal(affixeInconnu.error, undefined);
assert.equal(affixeInconnu.diagnostics.some((diagnostic) => diagnostic.code === "unsupported-affixes"), true);

// Quatre affixes audio à degrés arbitraires : trop d'effets, même hors fixtures.
const quatre = analyzeIthkuilToken(
  generateIthkuilWord({
    root: "psw",
    slotVIIAffixes: [
      { cs: "ţm", degree: 2, type: 1 },
      { cs: "jm", degree: 3, type: 1 },
      { cs: "sm", degree: 4, type: 1 },
      { cs: "mp", degree: 5, type: 1 },
    ],
  }),
  1,
);

assert.equal(quatre.diagnostics.some((diagnostic) => diagnostic.code === "too-many-audio-effects"), true);

// Affixe audio sur une racine visuelle : incompatible, à n'importe quel degré.
const incompatible = analyzeIthkuilToken(
  generateIthkuilWord({ root: "vt", slotVIIAffixes: [{ cs: "ţm", degree: 8, type: 1 }] }),
  1,
);

assert.equal(incompatible.diagnostics.some((diagnostic) => diagnostic.code === "incompatible-audio-effect"), true);

// Le charabia reste rejeté avec une erreur lisible.
assert.match(analyzeIthkuilToken("xxxx", 1).error, /forme Ithkuil non reconnue/);

// --- 3. Conformité croisée : runtime extrait vs bibliothèque de référence. ---

for (const entry of fixtures) {
  assert.deepEqual(
    bundledParseWord(entry.form),
    referenceParseWord(entry.form),
    "divergence bundle/référence sur " + entry.form,
  );
}

// Et le composeur (suggestions à la volée) reproduit exactement les formes
// des fixtures : même génération, plus de liste embarquée.
const fixtureKeys = new Set(fixtures
  .filter((entry) => !entry.kind.startsWith("diagnostic"))
  .map((entry) => entry.baseForm + ">" + entry.form));
const composedKeys = new Set([
  ...ikalAudioSuggestionForms(),
  ...ikalVisualSuggestionForms(),
  ...ikalAffiliationSuggestionForms(),
].map((entry) => entry.baseForm + ">" + entry.form));

assert.deepEqual([...composedKeys].sort(), [...fixtureKeys].sort(),
  "les suggestions composées doivent reproduire les formes des fixtures");

console.log("ikal-open-grammar ok (" + fixtures.length + " formes de fixtures décomposées + conformité croisée)");