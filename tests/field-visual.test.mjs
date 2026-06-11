import assert from "node:assert/strict";

import {
  STEP_SECONDS,
  activeWordIndex,
  createFieldVisual,
  frameToHtml,
  frameToText,
  operatorForProgram,
  renderFieldFrame,
} from "../src/engines/field-visual.js";
import { parseIkalProgram } from "../src/parser/ikal-parser.js";

function imageLayersFor(text) {
  const result = parseIkalProgram(text);
  assert.equal(result.error, undefined);
  return result.imageLayers;
}

function animationLayersFor(text) {
  const result = parseIkalProgram(text);
  assert.equal(result.error, undefined);
  return result.animationLayers;
}

function inkOf(frame) {
  return frameToText(frame).split("").filter((ch) => ch !== " " && ch !== "\n").length;
}

const SIZE = { cols: 72, rows: 26 };

// Déterminisme : même programme = même image fixe.
const layersA = imageLayersFor("lyala:\n  avtala ufthalölba");
const first = renderFieldFrame({ ...SIZE, layers: layersA, mode: "image", t: 0 });
const second = renderFieldFrame({ ...SIZE, layers: layersA, mode: "image", t: 0 });
assert.equal(frameToText(first), frameToText(second));
assert.equal(frameToHtml(first), frameToHtml(second));
assert.ok(inkOf(first) > 50, "l'image fixe doit contenir de la matière");

// Composition intra-ligne : deux mots sur une ligne lyala: changent le rendu.
const solo = renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  avtala"), mode: "image" });
assert.notEqual(frameToText(first), frameToText(solo));
assert.ok(inkOf(solo) > 50);

// Un affixe visuel transforme le champ au lieu d'ajouter de la matière.
const plain = renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  avtala"), mode: "image" });
const warped = renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  avtalävha"), mode: "image" });
assert.notEqual(frameToText(plain), frameToText(warped));

// Affiliation -> opérateur de conjugaison (CSL par défaut).
assert.equal(operatorForProgram({}), "independant");
assert.equal(operatorForProgram({ ithkuil: { ca: {} } }), "independant");
assert.equal(operatorForProgram({ ithkuil: { ca: { affiliation: "ASO" } } }), "associatif");
assert.equal(operatorForProgram({ ithkuil: { ca: { affiliation: "COA" } } }), "complementaire");
assert.equal(operatorForProgram({ ithkuil: { ca: { affiliation: "VAR" } } }), "conflictuel");

// Chaque opérateur produit une conjugaison différente des mêmes mots.
function withAffiliation(layers, affiliation) {
  return layers.map((layer) => ({
    ...layer,
    sequence: layer.sequence.map((program, index) => index === 0 ? program : {
      ...program,
      ithkuil: { ...program.ithkuil, ca: { ...program.ithkuil?.ca, affiliation } },
    }),
  }));
}

const base = imageLayersFor("lyala:\n  avtala ufthala");
const renders = ["CSL", "ASO", "COA", "VAR"].map((affiliation) => frameToText(renderFieldFrame({
  ...SIZE,
  layers: withAffiliation(base, affiliation),
  mode: "image",
})));
assert.equal(new Set(renders).size, 4, "les 4 affiliations doivent donner 4 images différentes");

// Étape 5.7 — la conjugaison est écrivable : une forme d'Affiliation tapée
// porte son opérateur jusqu'au moteur.
const typedCoa = imageLayersFor("lyala:\n  avtala uftharļa");
assert.equal(operatorForProgram(typedCoa[0].sequence[1]), "complementaire");

// La graine d'un mot vient de son mot de base : entre ces quatre programmes,
// seule la conjugaison change, et chacune donne une image différente.
const typedRenders = ["ufthala", "ufthanļa", "uftharļa", "ufthaňa"].map((cloud) => frameToText(renderFieldFrame({
  ...SIZE,
  layers: imageLayersFor("lyala:\n  avtala " + cloud),
  mode: "image",
})));
assert.equal(new Set(typedRenders).size, 4, "les formes d'Affiliation tapées doivent donner 4 images différentes");

// Seule sur sa ligne, une variante ASO / COA n'a rien à conjuguer : même
// matière que le mot de base. Une variante VAR déplace au lieu de dessiner.
assert.equal(
  frameToText(renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  uftharļa"), mode: "image" })),
  frameToText(renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  ufthala"), mode: "image" })),
);
const soloVar = renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  ufthaňa"), mode: "image" });
assert.notEqual(frameToText(soloVar), frameToText(renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  ufthala"), mode: "image" })));
assert.ok(inkOf(soloVar) > 20, "un mot VAR seul doit rester visible");

// Couches superposées : chaque mot garde ses contrôles, pas de fusion globale.
const oneLayer = renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  avtala"), mode: "image" });
const twoLayers = renderFieldFrame({
  ...SIZE,
  layers: imageLayersFor("lyala:\n  avtala\n  ufthala"),
  mode: "image",
});
assert.ok(inkOf(twoLayers) >= inkOf(oneLayer), "superposer ne doit jamais retirer de matière");

// Animation : la séquence d'une ligne lyula: avance d'un mot par pas.
const animLayers = animationLayersFor("lyula:\n  trala glala");
assert.equal(activeWordIndex(animLayers[0], 0), 0);
assert.equal(activeWordIndex(animLayers[0], STEP_SECONDS * 1.1), 1);
assert.equal(activeWordIndex(animLayers[0], STEP_SECONDS * 2.1), 0);

const stepOne = renderFieldFrame({ ...SIZE, layers: animLayers, mode: "animation", t: 0.1 });
const stepTwo = renderFieldFrame({ ...SIZE, layers: animLayers, mode: "animation", t: STEP_SECONDS * 1.1 });
assert.notEqual(frameToText(stepOne), frameToText(stepTwo));
assert.ok(inkOf(stepOne) > 20);
assert.ok(inkOf(stepTwo) > 20);

// Le même mot animé bouge dans le temps.
const t0 = renderFieldFrame({ ...SIZE, layers: animationLayersFor("lyula:\n  trala"), mode: "animation", t: 0.1 });
const t1 = renderFieldFrame({ ...SIZE, layers: animationLayersFor("lyula:\n  trala"), mode: "animation", t: 0.5 });
assert.notEqual(frameToText(t0), frameToText(t1));

// Un mot glitch en animation déforme la ligne mais n'occupe pas de pas :
// glala + sčala reste du glala déformé, pas une alternance.
const glitchedAnim = animationLayersFor("lyula:\n  glala sčala");
assert.equal(activeWordIndex(glitchedAnim[0], 0), 0);
assert.equal(activeWordIndex(glitchedAnim[0], STEP_SECONDS * 1.1), 0);
assert.equal(activeWordIndex(glitchedAnim[0], STEP_SECONDS * 7.3), 0);
const glitchedFrame = renderFieldFrame({ ...SIZE, layers: glitchedAnim, mode: "animation", t: STEP_SECONDS * 1.1 });
assert.ok(inkOf(glitchedFrame) > 20);

// Symétrie du vocabulaire visuel : un mot de mouvement se fige en image.
const frozenMotion = renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  trala"), mode: "image" });
assert.ok(inkOf(frozenMotion) > 50);
assert.equal(frameToText(frozenMotion), frameToText(renderFieldFrame({ ...SIZE, layers: imageLayersFor("lyala:\n  trala"), mode: "image" })));

// Sans couche : écran vide.
const empty = renderFieldFrame({ ...SIZE, layers: [], mode: "image" });
assert.equal(inkOf(empty), 0);

// Consommateur DOM minimal : still + clear basculent la classe field-mode.
const classes = new Set();
const screen = {
  innerHTML: "",
  classList: {
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  },
};
const visual = createFieldVisual({ screen, win: { cancelAnimationFrame: () => {} } });
visual.drawStill({ cols: 24, rows: 10, layers: layersA });
assert.ok(classes.has("field-mode"));
assert.ok(screen.innerHTML.includes("<span"));
visual.clear();
assert.ok(!classes.has("field-mode"));
assert.equal(screen.innerHTML, "");

console.log("field-visual ok");
