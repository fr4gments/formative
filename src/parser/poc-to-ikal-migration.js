export const POC_TO_IKAL_MIGRATION = [
  {
    poc: "kal",
    ikal: "ļtala",
    kind: "word",
    status: "candidate",
    summary: "clic statique, net, unitaire",
    rationale: "racine ļt : ticking/clicking/tapping sound",
  },
  {
    poc: "ras",
    ikal: "alxrasa",
    kind: "word",
    status: "candidate",
    summary: "roulement statique / duo",
    rationale: "racine lxr : roll/wheeling/winding, avec Ca configuration DPX pour le duo",
  },
  {
    aliases: ["sus"],
    poc: "suš",
    ikal: "ačxwuža",
    kind: "word",
    status: "candidate",
    summary: "bruit dynamique dense",
    rationale: "racine čxw : raucous sound/noise, avec Function DYN et Ca MFC pour la masse dynamique",
  },
  {
    poc: "kul",
    ikal: "ļtutļa",
    kind: "word",
    status: "candidate",
    summary: "clic dynamique fantome",
    rationale: "racine ļt : ticking/clicking/tapping sound, avec Function DYN et Ca essence RPV",
  },
  {
    poc: "sal",
    ikal: "pswatļa",
    kind: "word",
    status: "candidate",
    summary: "souffle statique fantome",
    rationale: "racine psw : respiration/breathing, avec Ca essence RPV",
  },
  {
    aliases: ["rur"],
    poc: "ruř",
    ikal: "alxružla",
    kind: "word",
    status: "candidate",
    summary: "roulement dynamique dense / fantome",
    rationale: "racine lxr : roll/wheeling/winding, avec Function DYN, Ca MFC et essence RPV",
  },
  {
    poc: "-tx",
    ikal: "sčala",
    kind: "operator-word",
    status: "candidate",
    summary: "dechirement / bitcrush / glitch",
    rationale: "racine sč : break apart/break into pieces/crumble",
  },
  {
    aliases: ["-sk"],
    poc: "-šk",
    ikal: "affrala",
    kind: "operator-word",
    status: "candidate",
    summary: "saturation / repli / distorsion",
    rationale: "racine ffr : bending/distortion/twisting/warping",
  },
];

const POC_MIGRATION_INDEX = new Map();

for (const entry of POC_TO_IKAL_MIGRATION) {
  POC_MIGRATION_INDEX.set(entry.poc, entry);

  for (const alias of entry.aliases || []) {
    POC_MIGRATION_INDEX.set(alias, entry);
  }
}

export function migrationForPocToken(token) {
  return POC_MIGRATION_INDEX.get(token);
}

export function migrationForIthkuilForm(form) {
  return POC_TO_IKAL_MIGRATION.find((entry) => entry.ikal === form);
}
