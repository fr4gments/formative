import assert from "node:assert/strict";

import {
  IKAL_TEMPO_DECLARATIONS,
  stepSecondsForTempo,
  tempoForDeclaration,
} from "../src/parser/ikal-tempo.js";
import { parseIkalProgram } from "../src/parser/ikal-parser.js";

// ── Reconnaissance des 9 formes de tempo (dvy + affixe gradué lc) ───────────
assert.equal(Object.keys(IKAL_TEMPO_DECLARATIONS).length, 9);
assert.equal(tempoForDeclaration("dvyalalca"), 1);
assert.equal(tempoForDeclaration("dvyalëilca"), 5);
assert.equal(tempoForDeclaration("dvyalulca"), 9);
assert.equal(tempoForDeclaration("amžvala"), null); // un vrai mot, mais pas un tempo
assert.equal(tempoForDeclaration("dvyala"), null); // forme nue non reconnue

// ── degré → vitesse : plus le degré est haut, plus c'est rapide ─────────────
assert.equal(stepSecondsForTempo(1), 0.42); // le plus lent
assert.equal(stepSecondsForTempo(9), 0.1); // le plus rapide
assert.ok(stepSecondsForTempo(1) > stepSecondsForTempo(5));
assert.ok(stepSecondsForTempo(5) > stepSecondsForTempo(9));
assert.ok(stepSecondsForTempo(5) > 0.25 && stepSecondsForTempo(5) < 0.27); // ≈ défaut
// bornes : un degré hors 1-9 est ramené dans la plage.
assert.equal(stepSecondsForTempo(0), stepSecondsForTempo(1));
assert.equal(stepSecondsForTempo(42), stepSecondsForTempo(9));

// ── L'en-tête de tempo fixe le tempo global ET n'est PAS une couche jouée ────
const withTempo = parseIkalProgram("dvyalölca:\nalkala:\n  amžvala");
assert.equal(withTempo.error, undefined);
assert.equal(withTempo.tempo, 6); // dvyalölca = degré 6
assert.equal(withTempo.musicLayers.length, 1);
assert.equal(withTempo.musicLayers[0].sequence[0].text, "amžvala"); // pas dvyalölca

// ── Sans en-tête → tempo null (le moteur garde sa vitesse par défaut) ───────
const withoutTempo = parseIkalProgram("alkala:\n  amžvala");
assert.equal(withoutTempo.tempo, null);

// ── En-tête de tempo avec autre chose sur la ligne → erreur lisible ─────────
const badTempo = parseIkalProgram("dvyalalca: amžvala");
assert.ok(badTempo.error && /tempo/.test(badTempo.error));

console.log("ikal-tempo ok");
