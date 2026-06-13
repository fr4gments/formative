// Tempo GLOBAL de la composition (MVP). Un en-tête « mot de rythme » fixe la
// vitesse de toute la pièce — comme les en-têtes de mode (alkala:/lyala:/lyula:),
// reconnus par forme exacte.
//
// Mot-clé = racine dvy (« sound pattern / rhythm », motif sonore / rythme) + un
// affixe gradué lc (degré 1-9 = lent → rapide). Les 9 formes sont produites par
// @zsnout/ithkuil et vérifiées (génération + re-parse) ; les diacritiques
// distinguent les degrés (dvyalalca = 1, dvyalälca = 2…), donc on reconnaît la
// forme EXACTE, pas son approximation ASCII.
export const IKAL_TEMPO_ROOT = "dvy";

export const IKAL_TEMPO_DECLARATIONS = Object.freeze({
  "dvyalalca": 1,
  "dvyalälca": 2,
  "dvyalelca": 3,
  "dvyalilca": 4,
  "dvyalëilca": 5,
  "dvyalölca": 6,
  "dvyalolca": 7,
  "dvyalülca": 8,
  "dvyalulca": 9,
});

// degré le plus lent / le plus rapide, en secondes par pas (cale sur la plage du
// prototype : ~0,4 s lent … ~0,1 s rapide ; le degré 5 ≈ 0,26 s = défaut actuel).
const SLOWEST_STEP = 0.42;
const STEP_PER_DEGREE = 0.04;

export function tempoForDeclaration(form) {
  return Object.prototype.hasOwnProperty.call(IKAL_TEMPO_DECLARATIONS, form)
    ? IKAL_TEMPO_DECLARATIONS[form]
    : null;
}

// degré 1-9 → durée d'un pas (secondes). 1 = lent, 9 = rapide.
export function stepSecondsForTempo(degree) {
  const clamped = Math.max(1, Math.min(9, Math.round(degree)));
  return Math.round((SLOWEST_STEP - (clamped - 1) * STEP_PER_DEGREE) * 1000) / 1000;
}
