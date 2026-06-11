// L'Affiliation Ithkuil (Slot VI, bloc Ca) dit comment les membres d'un
// ensemble se relient entre eux. IKAL la lit comme l'opérateur de conjugaison
// entre les mots d'une même ligne visuelle (vérifié sur ithkuil.net, chap. 3 ;
// formes Ca standalone : ASO = nļ, COA = rļ, VAR = ň, section 3.6).
export const IKAL_AFFILIATIONS = [
  {
    aliases: ["consolidatif", "independant", "territoires"],
    code: "CSL",
    ithkuilName: "consolidatif",
    label: "territoires indépendants",
    detail: "chaque mot garde son territoire (maximum des champs)",
    operator: "independant",
  },
  {
    aliases: ["associatif", "renforce", "fusion"],
    code: "ASO",
    ithkuilName: "associatif",
    label: "renforce la ligne",
    detail: "renforcement mutuel borné (fusion écran)",
    operator: "associatif",
  },
  {
    aliases: ["coalescent", "sculpte"],
    code: "COA",
    ithkuilName: "coalescent",
    label: "sculpte la ligne",
    detail: "le mot sculpte la matière accumulée (multiplication)",
    operator: "complementaire",
  },
  {
    aliases: ["variatif", "deforme"],
    code: "VAR",
    ithkuilName: "variatif",
    label: "déforme la ligne",
    detail: "le mot déplace les coordonnées des autres (déplacement)",
    operator: "conflictuel",
  },
];

// Les variantes générées : CSL est le défaut de toute forme non marquée.
export const IKAL_MARKED_AFFILIATIONS = IKAL_AFFILIATIONS.filter((entry) => entry.code !== "CSL");

export const OPERATOR_FOR_AFFILIATION = Object.freeze(Object.fromEntries(
  IKAL_AFFILIATIONS.map((entry) => [entry.code, entry.operator]),
));

export function affiliationForCode(code) {
  return IKAL_AFFILIATIONS.find((entry) => entry.code === code);
}

export function formatAffiliationSignature(code) {
  const entry = affiliationForCode(code);

  if (!entry) {
    return "";
  }

  return entry.code + " " + entry.ithkuilName + " · " + entry.label;
}
