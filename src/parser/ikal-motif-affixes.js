// Affixes de FORME du motif (modèle « un mot = une phrase », Étape 6).
// Ce sont des conventions IKAL (comme ITY/DTS pour les effets) : Ithkuil n'a
// pas d'affixe « gamme musicale ». On choisit des Cs dont le sens officiel est
// au moins adjacent, et le degré 1-9 règle un paramètre de forme.
//   - départ    (Cs lc) : degré = marche pentatonique de la 1re note
//   - contour   (Cs fb) : sens de la ligne (montant / ondulant / descendant)
//   - intervalle (Cs řks): taille du pas (par pas voisins ↔ par sauts/arpège)
//   - nombre    (Cs vj) : degré 1-9 = nombre de notes du motif
// Le nombre de notes était d'abord porté par la Configuration, mais celle-ci ne
// distingue que un / deux / « plusieurs » (cf. grammaire Ithkuil) — impossible
// d'avoir 4 ou 5 notes. On le porte donc par un affixe gradué (décision révisée
// le 2026-06-13). Cs vj = officiellement « avec N instances/parties/nœuds », le
// sens le plus proche de « nombre de ». (accord/arpège = Function, octave =
// Stem, consonance = Affiliation : ça, c'est de la vraie morphologie.)
export const IKAL_MOTIF_AFFIXES = Object.freeze({
  start: { cs: "lc", abbreviation: "PCH", label: "départ", type: 1 },
  contour: { cs: "fb", abbreviation: "CTR", label: "contour", type: 1 },
  interval: { cs: "řks", abbreviation: "ITV", label: "intervalle", type: 1 },
  count: { cs: "vj", abbreviation: "CNT", label: "nombre", type: 1 },
});

const BY_CS = new Map(
  Object.entries(IKAL_MOTIF_AFFIXES).map(([role, def]) => [def.cs, { role, ...def }]),
);

export function isMotifAffix(affix) {
  return Boolean(affix) && BY_CS.has(affix.cs);
}

export function motifAffixDefinitionFor(affix) {
  return affix ? BY_CS.get(affix.cs) : undefined;
}

// degré (1-9) → contour. Cs fb : 1 = poussée vers le haut … 9 = vers le bas.
export function contourFromDegree(degree) {
  if (degree <= 3) return "up";
  if (degree <= 6) return "wave";
  return "down";
}

// degré (1-9) → intervalle. Cs řks : 1 = tassé (petits pas) … 9 = épars (sauts).
export function intervalFromDegree(degree) {
  return degree >= 6 ? "leap" : "step";
}

// degré (1-9) → nombre de notes. Cs vj : le degré EST le compte (1 à 9).
export function countFromDegree(degree) {
  return Math.max(1, Math.min(9, Math.round(degree)));
}

function degreesByRole(slotVII = []) {
  const out = {};
  for (const affix of slotVII) {
    const def = BY_CS.get(affix?.cs);
    if (def && Number.isInteger(affix.degree)) {
      out[def.role] = affix.degree;
    }
  }
  return out;
}

// Construit la forme du motif depuis les affixes de forme + la morphologie
// structurelle déjà extraite (octave par Stem, nb par Configuration, etc.).
export function motifShapeFromAffixes(slotVII = [], { stem = 1, deploy = "sequence" } = {}) {
  const degrees = degreesByRole(slotVII);

  return {
    start: degrees.start ?? 1,
    contour: degrees.contour != null ? contourFromDegree(degrees.contour) : "up",
    interval: degrees.interval != null ? intervalFromDegree(degrees.interval) : "step",
    count: degrees.count != null ? countFromDegree(degrees.count) : 1,
    stem,
    deploy,
  };
}

// Signature lisible pour l'inspecteur / autocomplétion (Étape suivante).
export function formatMotifAffixSignature(slotVII = []) {
  const degrees = degreesByRole(slotVII);
  const parts = [];

  if (degrees.start != null) parts.push("départ " + degrees.start);
  if (degrees.count != null) parts.push(countFromDegree(degrees.count) + " notes");
  if (degrees.contour != null) parts.push("contour " + contourFromDegree(degrees.contour));
  if (degrees.interval != null) parts.push("intervalle " + intervalFromDegree(degrees.interval));

  return parts.join(", ");
}
