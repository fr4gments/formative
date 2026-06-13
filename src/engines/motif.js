// Un mot musical = un MOTIF (une phrase entière), pas une note — comme un mot
// visuel = un champ entier, pas un pixel. Ce module porte la logique validée à
// l'oreille dans prototypes/motif-synth.html : à partir de la FORME du motif
// (départ, contour, intervalle, nombre de notes), il produit la suite de degrés
// pentatoniques de la phrase. Pur (sans Web Audio) → testable en isolation.

// Pentatonique majeure, en demi-tons depuis la tonique : Do Ré Mi Sol La.
// (Les 7 autres demi-tons {1,3,5,6,8,10,11} sont réservés — voir ROADMAP Étape 6.)
export const PENTATONIC = [0, 2, 4, 7, 9];

// Un degré entier quelconque (même 0 ou négatif) tombe sur une note
// pentatonique : l'index parcourt la gamme et change d'octave aux passages.
// Stem → octave de base : 1 = Do3, 2 = Do4, 3 = Do5 (MIDI 48 / 60 / 72).
export function midiForStep(step, stem = 2) {
  const idx = step - 1;
  const semis = Math.floor(idx / 5) * 12 + PENTATONIC[((idx % 5) + 5) % 5];
  return 48 + (stem - 1) * 12 + semis;
}

export function freqForMidi(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Génère les degrés d'un motif depuis sa forme.
//   start    : degré pentatonique de la première note (entier, défaut 1)
//   contour  : "up" (montant) | "down" (descendant) | "wave" (ondulant)
//   interval : "step" (par pas, voisins) | "leap" (par sauts, ~tierces → arpège)
//   count    : nombre de notes (>= 1)
export function generateMotif({ start = 1, contour = "up", interval = "step", count = 1 } = {}) {
  const n = Math.max(1, Math.floor(count));
  const inc = interval === "leap" ? 2 : 1;
  const degrees = [];

  if (contour === "down") {
    for (let i = 0; i < n; i++) degrees.push(start - i * inc);
  } else if (contour === "wave") {
    // monte jusqu'à un sommet puis redescend (triangle)
    const up = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const k = i < up ? i : (2 * up - 2 - i);
      degrees.push(start + k * inc);
    }
  } else {
    for (let i = 0; i < n; i++) degrees.push(start + i * inc);
  }

  return degrees;
}

// Pratique : un motif (+ octave par Stem) → ses fréquences en Hz.
export function motifFrequencies(motif, stem = 2) {
  return generateMotif(motif).map((degree) => freqForMidi(midiForStep(degree, stem)));
}
