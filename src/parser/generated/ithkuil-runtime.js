// Généré par scripts/extract-ithkuil-runtime.mjs — ne pas éditer à la main.
// Régénérer : npm run generate:ithkuil-runtime
//
// Ce fichier embarque un sous-ensemble de @zsnout/ithkuil@0.1.122
// (parseWord + wordToIthkuil), extrait par tree-shaking esbuild.
//
// @zsnout/ithkuil — MIT License
// Copyright (c) 2023 Zachary Sakowitz
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// node_modules/@zsnout/ithkuil/generate/helpers/dipthongs.js
var ALL_DIPTHONGS = /* @__PURE__ */ deepFreeze([
  "ai",
  "ei",
  "\xEBi",
  "oi",
  "ui",
  "au",
  "eu",
  "\xEBu",
  "ou",
  "iu"
]);

// node_modules/@zsnout/ithkuil/generate/helpers/has.js
function has(array, item) {
  return array.includes(item);
}

// node_modules/@zsnout/ithkuil/generate/helpers/insert-glottal-stop.js
function insertGlottalStop(vowelForm, isAtEndOfWord) {
  if (isAtEndOfWord) {
    if (vowelForm.length == 1) {
      return vowelForm + "'" + vowelForm;
    }
    if (vowelForm.length == 2) {
      return vowelForm[0] + "'" + vowelForm[1];
    }
  } else {
    if (vowelForm.length == 1 || has(ALL_DIPTHONGS, vowelForm)) {
      return vowelForm + "'";
    }
    if (vowelForm.length == 2) {
      return vowelForm[0] + "'" + vowelForm[1];
    }
  }
  throw new Error("Vowel forms may only 1 or 2 vowels.");
}
function insertGlottalStopIntoPossiblyWithWYAlternative(vowelForm, isAtEndOfWord) {
  if (typeof vowelForm == "string") {
    return insertGlottalStop(vowelForm, isAtEndOfWord);
  } else {
    return vowelForm.insertGlottalStop(isAtEndOfWord);
  }
}

// node_modules/@zsnout/ithkuil/generate/helpers/with-wy-alternative.js
var WithWYAlternative = class _WithWYAlternative {
  defaultValue;
  valueAfterW;
  valueAfterY;
  static add(first, second) {
    if (typeof first == "string") {
      if (typeof second == "string") {
        return first + second;
      }
      return first + second.withPreviousText(first);
    }
    return first.add(second);
  }
  /**
   * Coerces a string or `WithWYAlternative` as a `WithWYAlternative`.
   *
   * @param text The string or `WithWYAlternative` to create an object from.
   * @returns A `WithWYAlternative` containing the input data.
   */
  static of(text2) {
    if (text2 instanceof _WithWYAlternative) {
      return text2;
    }
    return new _WithWYAlternative(text2, text2, text2);
  }
  /**
   * Constructs a `WithWYAlternative`.
   *
   * @param defaultValue The default value.
   * @param valueAfterW The value when preceded by W.
   * @param valueAfterY The value when preceded by Y.
   * @returns The constructed, frozen `WithWYAlternative`.
   */
  constructor(defaultValue, valueAfterW, valueAfterY) {
    this.defaultValue = defaultValue;
    this.valueAfterW = valueAfterW;
    this.valueAfterY = valueAfterY;
    Object.freeze(this);
  }
  /**
   * Gets the appropriate field (defaultValue, precededByW, or precededByY)
   * based on the contents of text preceding this `WithWYAlternative`.
   *
   * @param text The text preceding this `WithWYAlternative`.
   * @returns The value of the appropriate field.
   */
  withPreviousText(text2) {
    if (text2.endsWith("w")) {
      return this.valueAfterW;
    }
    if (text2.endsWith("y")) {
      return this.valueAfterY;
    }
    return this.defaultValue;
  }
  /**
   * Adds this `WithWYAlternative` to a string or another `WithWYAlternative`.
   *
   * @param other A string or `WithWYAlternative` to add this to.
   * @returns A `WithWYAlternative` containing the appropriate outputs.
   */
  add(other) {
    other = _WithWYAlternative.of(other);
    return new _WithWYAlternative(this.defaultValue + other.withPreviousText(this.defaultValue), this.valueAfterW + other.withPreviousText(this.valueAfterW), this.valueAfterY + other.withPreviousText(this.valueAfterY));
  }
  /**
   * Stringifies this WithWYAlternative.
   *
   * @returns A stringified representation of this WithWYAlternative.
   */
  toString() {
    if (this.defaultValue != this.valueAfterW && this.defaultValue != this.valueAfterY) {
      return `(${this.defaultValue}/${this.valueAfterW}/${this.valueAfterY})`;
    }
    if (this.defaultValue != this.valueAfterW) {
      return `(${this.defaultValue}/${this.valueAfterW})`;
    }
    if (this.defaultValue != this.valueAfterY) {
      return `(${this.defaultValue}/${this.valueAfterY})`;
    }
    return this.defaultValue;
  }
  /**
   * Inserts glottal stops into this `WithWYAlternative`.
   *
   * @param isAtEndOfWord Whether this `WithWYAlternative` is at the end of a
   *   word.
   * @returns A `WithWYAlternative` containing the contents of this one, but
   *   with a glottal stop in each alternative.
   */
  insertGlottalStop(isAtEndOfWord) {
    return new _WithWYAlternative(insertGlottalStop(this.defaultValue, isAtEndOfWord), insertGlottalStop(this.valueAfterW, isAtEndOfWord), insertGlottalStop(this.valueAfterY, isAtEndOfWord));
  }
};
var EMPTY = /* @__PURE__ */ new WithWYAlternative("", "", "");
var IA_U\u00C4 = /* @__PURE__ */ new WithWYAlternative("ia", "ia", "u\xE4");
var IE_U\u00CB = /* @__PURE__ */ new WithWYAlternative("ie", "ie", "u\xEB");
var IO_\u00DC\u00C4 = /* @__PURE__ */ new WithWYAlternative("io", "io", "\xFC\xE4");
var I\u00D6_\u00DC\u00CB = /* @__PURE__ */ new WithWYAlternative("i\xF6", "i\xF6", "\xFC\xEB");
var U\u00D6_\u00D6\u00CB = /* @__PURE__ */ new WithWYAlternative("u\xF6", "\xF6\xEB", "u\xF6");
var UO_\u00D6\u00C4 = /* @__PURE__ */ new WithWYAlternative("uo", "\xF6\xE4", "uo");
var UE_I\u00CB = /* @__PURE__ */ new WithWYAlternative("ue", "i\xEB", "ue");
var UA_I\u00C4 = /* @__PURE__ */ new WithWYAlternative("ua", "i\xE4", "ua");

// node_modules/@zsnout/ithkuil/generate/helpers/deep-freeze.js
function deepFreeze(value) {
  if (value && typeof value == "object") {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
function deepFreezeAndNullPrototype(value) {
  if (value && typeof value == "object") {
    Object.setPrototypeOf(value, null);
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

// node_modules/@zsnout/ithkuil/data/affixes-map.js
function getIntegerCs(affix) {
  return {
    1e8: "k\u017C",
    "10000000000000000": "\u010Dg",
    1e4: "pc",
    1: "zc",
    2: "ks",
    3: "z",
    4: "p\u0161",
    5: "st",
    6: "cp",
    7: "ns",
    8: "\u010Dk",
    9: "l\u017C",
    0: "vr",
    100: "gz",
    15: "\u0163\u017C",
    14: "bc",
    13: "\u013Cj",
    12: "jd",
    11: "cg",
    10: "j"
  }["" + affix];
}

// node_modules/@zsnout/ithkuil/generate/helpers/fill-defaults.js
function fillDefaults(defaultValue, additions) {
  const output = { ...defaultValue };
  for (const key2 in additions) {
    const value = additions[key2];
    if (value != null) {
      output[key2] = value;
    }
  }
  return output;
}

// node_modules/@zsnout/ithkuil/generate/ca/affiliation.js
var ALL_AFFILIATIONS = /* @__PURE__ */ deepFreeze(["CSL", "COA", "ASO", "VAR"]);
var AFFILIATION_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  CSL: ["", ""],
  COA: ["r", "r\u013C"],
  ASO: ["l", "n\u013C"],
  VAR: ["\u0159", "\u0148"]
});
function affiliationToIthkuil(affiliation, isStandalone) {
  return AFFILIATION_TO_ITHKUIL_MAP[affiliation][+isStandalone];
}

// node_modules/@zsnout/ithkuil/generate/ca/configuration.js
var ALL_CONFIGURATIONS = /* @__PURE__ */ deepFreeze([
  "UPX",
  "DPX",
  "MSS",
  "MSC",
  "MSF",
  "MDS",
  "MDC",
  "MDF",
  "MFS",
  "MFC",
  "MFF",
  "DSS",
  "DSC",
  "DSF",
  "DDS",
  "DDC",
  "DDF",
  "DFS",
  "DFC",
  "DFF"
]);
var CONFIGURATION_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  UPX: "",
  DPX: "s",
  DSS: "c",
  DSC: "ks",
  DSF: "ps",
  DDS: "\u0163s",
  DDC: "fs",
  DDF: "\u0161",
  DFS: "\u010D",
  DFC: "k\u0161",
  DFF: "p\u0161",
  MSS: "t",
  MSC: "k",
  MSF: "p",
  MDS: "\u0163",
  MDC: "f",
  MDF: "\xE7",
  MFS: "z",
  MFC: "\u017E",
  MFF: "\u017C"
});
function configurationToIthkuil(configuration) {
  return CONFIGURATION_TO_ITHKUIL_MAP[configuration];
}

// node_modules/@zsnout/ithkuil/generate/ca/essence.js
var ALL_ESSENCES = /* @__PURE__ */ deepFreeze([
  "NRM",
  "RPV"
]);

// node_modules/@zsnout/ithkuil/generate/ca/extension.js
var ALL_EXTENSIONS = /* @__PURE__ */ deepFreeze([
  "DEL",
  "PRX",
  "ICP",
  "ATV",
  "GRA",
  "DPL"
]);
var EXTENSION_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  DEL: ["", ""],
  PRX: ["t", "d"],
  ICP: ["k", "g"],
  ATV: ["p", "b"],
  GRA: ["g", "gz"],
  DPL: ["b", "bz"]
});
function extensionToIthkuil(extension, isCAUniplex) {
  return EXTENSION_TO_ITHKUIL_MAP[extension][+isCAUniplex];
}

// node_modules/@zsnout/ithkuil/generate/phonotactics/general.js
var ILLEGAL_CONSONANT_FORMS = /[dt][szšžcżčjḑţ]|[kg][xň]|[cżčj][szšžç]|ç[szšžżjļh]|[szšžcżčjxļh]ç|m[pb][fvtd]|(?:m[pb]|n[tdkg]|ň[kg])[szšžcżčjç]|ň[kgxy]|x[szšžçgļňyhř]|[bdghç]ļ|ļ[hļszšžç]|[ļxç]h$|[rh]ř|s[šzž]|z[šžs]|š[zžs]|ž[šzs]|bp|pb|kg|gk|dp|pd|fv|ţḑ|sz|šž|vf|ḑţ|zs|žš|cż|żc|čj|jč|čc|jc|čż|jż|šc|šż|žc|žż|sż|nc|nč|nż|nj|ngḑ|np|nb|řr|nf(?!$)|nv(?!$)|[wy](?!$)/;
function isLegalConsonantForm(consonantForm) {
  return !ILLEGAL_CONSONANT_FORMS.test(consonantForm);
}

// node_modules/@zsnout/ithkuil/generate/ca/geminate.js
function attemptGemination(text2) {
  if (text2.length == 1) {
    return text2 + text2;
  }
  if (text2 == "t\u013C") {
    return "tt\u013C";
  }
  if (/^[tkpdgb][lrřwy]/.test(text2)) {
    return text2[0] + text2[0] + text2.slice(1);
  }
  {
    const nextText = text2.replace(/[sšzžçcčjż]/, (match) => match + match);
    if (nextText != text2) {
      return nextText;
    }
  }
  if (/^[fţvḑnmň]/.test(text2)) {
    return text2[0] + text2[0] + text2.slice(1);
  }
  if (/^[tkp][sšfţç]/.test(text2)) {
    return text2[0] + text2[1] + text2[1] + text2.slice(2);
  }
  if (text2.endsWith("pt"))
    return text2.replace(/pt$/, "bb\u1E11");
  if (text2.endsWith("pk"))
    return text2.replace(/pk$/, "bbv");
  if (text2.endsWith("kt"))
    return text2.replace(/kt$/, "gg\u1E11");
  if (text2.endsWith("kp"))
    return text2.replace(/kp$/, "ggv");
  if (text2.endsWith("tk"))
    return text2.replace(/tk$/, "\u1E11vv");
  if (text2.endsWith("tp"))
    return text2.replace(/tp$/, "ddv");
  if (text2.endsWith("pm"))
    return text2.replace(/pm$/, "vvm");
  if (text2.endsWith("pn"))
    return text2.replace(/pn$/, "vvn");
  if (text2.endsWith("km"))
    return text2.replace(/km$/, "xxm");
  if (text2.endsWith("kn"))
    return text2.replace(/kn$/, "xxn");
  if (text2.endsWith("tm"))
    return text2.replace(/tm$/, "\u1E11\u1E11m");
  if (text2.endsWith("tn"))
    return text2.replace(/tn$/, "\u1E11\u1E11n");
  if (text2.endsWith("bm"))
    return text2.replace(/bm$/, "mmw");
  if (text2.endsWith("bn"))
    return text2.replace(/bn$/, "mml");
  if (text2.endsWith("gm"))
    return text2.replace(/gm$/, "\u0148\u0148w");
  if (text2.endsWith("gn"))
    return text2.replace(/gn$/, "\u0148\u0148l");
  if (text2.endsWith("dm"))
    return text2.replace(/dm$/, "nnw");
  if (text2.endsWith("dn"))
    return text2.replace(/dn$/, "nnl");
  if (/^[lrř]/.test(text2)) {
    const rest = attemptGemination(text2.slice(1));
    const firstAttempt = text2[0] + rest;
    if (rest != text2.slice(1) && isLegalConsonantForm(firstAttempt)) {
      return firstAttempt;
    }
    return text2[0] + text2[0] + text2.slice(1);
  }
  return text2;
}

// node_modules/@zsnout/ithkuil/generate/ca/perspective-and-essence.js
function perspectiveAndEssenceToIthkuil(perspective, essence, isStandalone, isPrecededByKPT) {
  if (perspective == "G") {
    return essence == "RPV" ? "\u0159" : "r";
  }
  if (perspective == "M") {
    return essence == "RPV" ? isStandalone ? "t\u013C" : "l" : isStandalone ? "l" : "";
  }
  if (essence == "NRM") {
    return perspective == "N" ? isStandalone ? "v" : "w" : isStandalone ? "j" : "y";
  }
  return perspective == "N" ? isPrecededByKPT ? "h" : "m" : isPrecededByKPT ? "\xE7" : "n";
}

// node_modules/@zsnout/ithkuil/generate/ca/perspective.js
var ALL_PERSPECTIVES = /* @__PURE__ */ deepFreeze(["M", "G", "N", "A"]);

// node_modules/@zsnout/ithkuil/generate/ca/index.js
function makeCAAllomorphicSubstitutions(ca) {
  return ca.replace(/pp/g, "mp").replace(/tt/g, "nt").replace(/kk/g, "nk").replace(/ll/g, "p\u013C").replace(/pb/g, "mb").replace(/kg/g, "ng").replace(/çy/g, "nd").replace(/rr/g, "ns").replace(/rř/g, "n\u0161").replace(/řr/g, "\u0148s").replace(/řř/g, "\u0148\u0161").replace(/(.)gm/g, "$1x").replace(/(.)gn/g, "$1\u0148").replace(/nň/g, "\u0148n").replace(/(.)çx/g, "$1xw").replace(/(.)bm/g, "$1v").replace(/(.)bn/g, "$1\u1E11").replace(/fv/g, "vw").replace(/ţḑ/g, "\u1E11y");
}
function caToIthkuil(ca) {
  const ca2 = fillInDefaultCAValues(ca);
  const configuration = configurationToIthkuil(ca2.configuration);
  const extension = extensionToIthkuil(ca2.extension, ca2.configuration == "UPX");
  const affiliation = affiliationToIthkuil(ca2.affiliation, configuration == "" && extension == "" && ca2.perspective == "M" && ca2.essence == "NRM");
  const perspectiveAndEssence = perspectiveAndEssenceToIthkuil(ca2.perspective, ca2.essence, affiliation == "" && configuration == "" && extension == "", !!(affiliation + configuration + extension).match(/[kpt]$/));
  const core = affiliation + configuration + extension + perspectiveAndEssence;
  return makeCAAllomorphicSubstitutions(core);
}
function geminateCa(ca) {
  const geminate2 = attemptGemination(ca);
  if (ca == geminate2) {
    return geminate2[0] + geminate2;
  }
  return geminate2;
}
function geminatedCAToIthkuil(ca) {
  return geminateCa(caToIthkuil(ca));
}
var DEFAULT_CA = /* @__PURE__ */ deepFreeze({
  affiliation: "CSL",
  configuration: "UPX",
  extension: "DEL",
  perspective: "M",
  essence: "NRM"
});
function fillInDefaultCAValues(ca) {
  return fillDefaults(DEFAULT_CA, ca);
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-9/case.js
var ALL_CASES = /* @__PURE__ */ deepFreeze([
  "THM",
  "INS",
  "ABS",
  "AFF",
  "STM",
  "EFF",
  "ERG",
  "DAT",
  "IND",
  "POS",
  "PRP",
  "GEN",
  "ATT",
  "PDC",
  "ITP",
  "OGN",
  "IDP",
  "PAR",
  "APL",
  "PUR",
  "TRA",
  "DFR",
  "CRS",
  "TSP",
  "CMM",
  "CMP",
  "CSD",
  "FUN",
  "TFM",
  "CLA",
  "RSL",
  "CSM",
  "CON",
  "AVR",
  "CVS",
  "SIT",
  "PRN",
  "DSP",
  "COR",
  "CPS",
  "COM",
  "UTL",
  "PRD",
  "RLT",
  "ACT",
  "ASI",
  "ESS",
  "TRM",
  "SEL",
  "CFM",
  "DEP",
  "VOC",
  "LOC",
  "ATD",
  "ALL",
  "ABL",
  "ORI",
  "IRL",
  "INV",
  "NAV",
  "CNR",
  "ASS",
  "PER",
  "PRO",
  "PCV",
  "PCR",
  "ELP",
  "PLM"
]);
var ALL_CASES_SKIPPING_DEGREE_8 = /* @__PURE__ */ deepFreeze([
  "THM",
  "INS",
  "ABS",
  "AFF",
  "STM",
  "EFF",
  "ERG",
  "DAT",
  "IND",
  "POS",
  "PRP",
  "GEN",
  "ATT",
  "PDC",
  "ITP",
  "OGN",
  "IDP",
  "PAR",
  "APL",
  "PUR",
  "TRA",
  "DFR",
  "CRS",
  "TSP",
  "CMM",
  "CMP",
  "CSD",
  "FUN",
  "TFM",
  "CLA",
  "RSL",
  "CSM",
  "CON",
  "AVR",
  "CVS",
  "SIT",
  "PRN",
  "DSP",
  "COR",
  "CPS",
  "COM",
  "UTL",
  "PRD",
  ,
  "RLT",
  "ACT",
  "ASI",
  "ESS",
  "TRM",
  "SEL",
  "CFM",
  "DEP",
  ,
  "VOC",
  "LOC",
  "ATD",
  "ALL",
  "ABL",
  "ORI",
  "IRL",
  "INV",
  ,
  "NAV",
  "CNR",
  "ASS",
  "PER",
  "PRO",
  "PCV",
  "PCR",
  "ELP",
  ,
  "PLM"
]);
var CASE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  /** The `false` branch is used in non-concatenated formatives. */
  false: {
    THM: "a",
    INS: "\xE4",
    ABS: "e",
    AFF: "i",
    STM: "\xEBi",
    EFF: "\xF6",
    ERG: "o",
    DAT: "\xFC",
    IND: "u",
    POS: "ai",
    PRP: "au",
    GEN: "ei",
    ATT: "eu",
    PDC: "\xEBu",
    ITP: "ou",
    OGN: "oi",
    IDP: "iu",
    PAR: "ui",
    APL: IA_U\u00C4,
    PUR: IE_U\u00CB,
    TRA: IO_\u00DC\u00C4,
    DFR: I\u00D6_\u00DC\u00CB,
    CRS: "e\xEB",
    TSP: U\u00D6_\u00D6\u00CB,
    CMM: UO_\u00D6\u00C4,
    CMP: UE_I\u00CB,
    CSD: UA_I\u00C4,
    FUN: "ao",
    TFM: "a\xF6",
    CLA: "eo",
    RSL: "e\xF6",
    CSM: "o\xEB",
    CON: "\xF6e",
    AVR: "oe",
    CVS: "\xF6a",
    SIT: "oa",
    PRN: "a'a",
    DSP: "\xE4'\xE4",
    COR: "e'e",
    CPS: "i'i",
    COM: "\xEB'i",
    UTL: "\xF6'\xF6",
    PRD: "o'o",
    RLT: "u'u",
    ACT: "a'i",
    ASI: "a'u",
    ESS: "e'i",
    TRM: "e'u",
    SEL: "\xEB'u",
    CFM: "o'u",
    DEP: "o'i",
    VOC: "u'i",
    LOC: "i'a",
    ATD: "i'e",
    ALL: "i'o",
    ABL: "i'\xF6",
    ORI: "e'\xEB",
    IRL: "u'\xF6",
    INV: "u'o",
    NAV: "u'a",
    CNR: "a'o",
    ASS: "a'\xF6",
    PER: "e'o",
    PRO: "e'\xF6",
    PCV: "o'\xEB",
    PCR: "\xF6'e",
    ELP: "o'e",
    PLM: "o'a"
  },
  /** The `true` branch is used in concatenated formatives. */
  true: {
    THM: "a",
    INS: "\xE4",
    ABS: "e",
    AFF: "i",
    STM: "\xEBi",
    EFF: "\xF6",
    ERG: "o",
    DAT: "\xFC",
    IND: "u",
    POS: "ai",
    PRP: "au",
    GEN: "ei",
    ATT: "eu",
    PDC: "\xEBu",
    ITP: "ou",
    OGN: "oi",
    IDP: "iu",
    PAR: "ui",
    APL: IA_U\u00C4,
    PUR: IE_U\u00CB,
    TRA: IO_\u00DC\u00C4,
    DFR: I\u00D6_\u00DC\u00CB,
    CRS: "e\xEB",
    TSP: U\u00D6_\u00D6\u00CB,
    CMM: UO_\u00D6\u00C4,
    CMP: UE_I\u00CB,
    CSD: UA_I\u00C4,
    FUN: "ao",
    TFM: "a\xF6",
    CLA: "eo",
    RSL: "e\xF6",
    CSM: "o\xEB",
    CON: "\xF6e",
    AVR: "oe",
    CVS: "\xF6a",
    SIT: "oa",
    PRN: "a",
    DSP: "\xE4",
    COR: "e",
    CPS: "i",
    COM: "\xEBi",
    UTL: "\xF6",
    PRD: "o",
    RLT: "u",
    ACT: "ai",
    ASI: "au",
    ESS: "ei",
    TRM: "eu",
    SEL: "\xEBu",
    CFM: "ou",
    DEP: "oi",
    VOC: "ui",
    LOC: IA_U\u00C4,
    ATD: IE_U\u00CB,
    ALL: IO_\u00DC\u00C4,
    ABL: I\u00D6_\u00DC\u00CB,
    ORI: "e\xEB",
    IRL: U\u00D6_\u00D6\u00CB,
    INV: UO_\u00D6\u00C4,
    NAV: UA_I\u00C4,
    CNR: "ao",
    ASS: "a\xF6",
    PER: "eo",
    PRO: "e\xF6",
    PCV: "o\xEB",
    PCR: "\xF6e",
    ELP: "oe",
    PLM: "oa"
  }
});
var CASE_AFFIX_TO_CS_MAP = /* @__PURE__ */ deepFreeze({
  false: [, "s", "z", "\u010D"],
  true: [, "\u0161", "\u017E", "j"]
});
function caseToIthkuil(case_, elideIfPossible, hideGlottalStop) {
  if (elideIfPossible && case_ == "THM") {
    return "";
  }
  return CASE_TO_ITHKUIL_MAP[`${hideGlottalStop}`][case_];
}

// node_modules/@zsnout/ithkuil/generate/helpers/vowel-table.js
var STANDARD_VOWEL_TABLE = /* @__PURE__ */ deepFreeze([
  void 0,
  ["ae", "a", "\xE4", "e", "i", "\xEBi", "\xF6", "o", "\xFC", "u"],
  ["ea", "ai", "au", "ei", "eu", "\xEBu", "ou", "oi", "iu", "ui"],
  ["\xFCo", IA_U\u00C4, IE_U\u00CB, IO_\u00DC\u00C4, I\u00D6_\u00DC\u00CB, "e\xEB", U\u00D6_\u00D6\u00CB, UO_\u00D6\u00C4, UE_I\u00CB, UA_I\u00C4],
  ["\xFC\xF6", "ao", "a\xF6", "eo", "e\xF6", "o\xEB", "\xF6e", "oe", "\xF6a", "oa"]
]);
var ONE_INDEXED_STANDARD_VOWEL_TABLE = /* @__PURE__ */ deepFreeze([
  ["ae", "a", "\xE4", "e", "i", "\xEBi", "\xF6", "o", "\xFC", "u"],
  ["ea", "ai", "au", "ei", "eu", "\xEBu", "ou", "oi", "iu", "ui"],
  ["\xFCo", IA_U\u00C4, IE_U\u00CB, IO_\u00DC\u00C4, I\u00D6_\u00DC\u00CB, "e\xEB", U\u00D6_\u00D6\u00CB, UO_\u00D6\u00C4, UE_I\u00CB, UA_I\u00C4],
  ["\xFC\xF6", "ao", "a\xF6", "eo", "e\xF6", "o\xEB", "\xF6e", "oe", "\xF6a", "oa"]
]);

// node_modules/@zsnout/ithkuil/generate/helpers/permutations.js
function allPermutationsOf(array) {
  const permutation = array.slice();
  const length = permutation.length;
  const result = [permutation.slice()];
  const c = new Array(length).fill(0);
  let i = 1;
  let k, p;
  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}

// node_modules/@zsnout/ithkuil/generate/phonotactics/letters.js
var VOWEL = /[aeiouäëöü]/g;
function extractAllConsonants(text2) {
  return text2.replace(VOWEL, "");
}

// node_modules/@zsnout/ithkuil/generate/phonotactics/word-final.js
var LEGAL_WORD_FINAL_2_CONSONANT_FORMS = /^(?:cc|çç|čč|ḑḑ|ff|hh|jj|ll|ļļ|mm|nn|ňň|rr|řř|ss|šš|ţţ|vv|ww|yy|xx|zz|žž|żż|[tkp][fţsšhļ]|[bdg][vḑzžx]|[kp]t|[bg]d|[sšç][ptk]|[zž][bdg]|[cč][tk]|[żj][dg]|f[tksšç]|v[dgzž]|ţ[tk]|ḑ[dg]|[ļx][ptk]|[mn][pbtdkgfvţḑszšžxļ]|ň[tdfvţḑszšž]|r[^wyh']|l[^hwyrň'])$/;
var LEGAL_WORD_FINAL_3_CONSONANT_FORMS = /^(?:[rřl]p[tkfţxsšhļç]|[mň]p[hļç]|[sšç]p[fţsšļç]|[lrř]t[kfxhļç]|nt[kfxh]|[mňsšç]t[hļç]|[lrř]k[tfţsšhç]|[nfţļ]k[hç]|mk[fţhç]|[sšç]k[fţsšhç]|[rř]b[dgvḑzž]|lb[vḑzž]|[rř]d[bgv]|[rř]g[bdvḑzž]|lg[vḑzž]|[lrřmň]f[tkfsš]|[ptk]f[kf]|ff[tksš]|[pkrlřmnň]ţ[tkţ]|ţţ[tk]|[rlř]x[tx]|[ptfsšnm]xx|xxt|[ptrřmnň]ļ[tkļ]|[ļl]ļ[tk]|[rlřmnňpkf]s[ptkfţxs]|ţs[ptks]|ss[ptkfţx]|[rlřmnňpkf]š[ptkfţxs]|ţš[ptkš]|š š[ptkfţx]|[rřl]v[vzž]|[bgmň]vv|vv[zž]|[pgrřlnmň]ḑḑ|[rřlnmň]z[bdgz]|[bgv]zz|zz[bdg]|[rřlnmň]ž[bdgž]|[bgv]žž|žž[bdg]|[rřl]c[tkch]|[rřl]č[tkčh]|[rřl]ż[dgż]|[rřl]j[dgj]|[rlř]m[ptkbdfţxsšvḑzžmļç]|mm[ptkbdfţxsšvḑzžļç]|[rř]n[tkdgfţxsšvḑzžnļç]|ln[tkdgţsšzžļç]|nn[tkdgfţxsšvḍzžļç]|[rř]ň[tdfţsšvḑzžňç]|lňň|ňň[tdfţsšvḑzžç]|ll[ptkbdgfţxsšvḍzžcčżjmnňç]|rr[ptkbdgfţxsšvḍzžcčżjmnňlļç]|řř[ptkbdgfţxsšvḍzžcčżjmnňlļç]|[ptkmnňrlř]ç[tkç]|çç[tk])$/;
var LEGAL_WORD_FINAL_4_CONSONANT_FORMS = /^(?:[lrř][kp][sšţç][tk]|[lrř]tç[tk]|[lrř]pf[tk]|[lrř][fsfš][tk]|r[nňm][sšţç][tk]|r[ňm]f[tk])$/;
var didShowWarning = false;
function isLegalWordFinalConsonantForm(consonantForm) {
  if (!isLegalConsonantForm(consonantForm)) {
    return false;
  }
  if (consonantForm.length == 1) {
    return consonantForm != "w" && consonantForm != "y" && consonantForm != "'" && consonantForm != "h";
  }
  if (consonantForm.length == 2) {
    return LEGAL_WORD_FINAL_2_CONSONANT_FORMS.test(consonantForm);
  }
  if (consonantForm.length == 3) {
    return LEGAL_WORD_FINAL_3_CONSONANT_FORMS.test(consonantForm);
  }
  if (consonantForm.length == 4) {
    return LEGAL_WORD_FINAL_4_CONSONANT_FORMS.test(consonantForm);
  }
  if (consonantForm.length == 5 && !didShowWarning) {
    didShowWarning = true;
    console.warn("'isLegalWordFinalConsonantForm' does not accurately test 5-consonant structures and may return a false negative (i.e. disallowing a consonant cluster that is valid in speech).");
  }
  return false;
}

// node_modules/@zsnout/ithkuil/generate/phonotactics/word-initial.js
var LEGAL_WORD_INITIAL_2_CONSONANT_FORMS = /^(?:[pbtdkg][rlřwy]|[pk][sšç]|[bg][zž]|[kg][mn]|[sš][ptkfţxcčř]|[zž][bdgvḑżjmnňrwyl]|[szšž][mnňlrwyřv]|[cżčj][rlmnňwv]|[cč][ptkfţh]|[żj][bdgvḑx]|x[ptcčmnlrw]|ç[ptcčkmnňlrřw]|[fvţḑ][rlmnňwyř]|[fţ][ptkcčç]|[vḑ][bdgżj]|ļ[pktcčçmnňwy]|h[lrmnw]|[mn][lrwyř]|ň[lrw]|[lr][wy]|bv|bḑ|dv|gv|gḑ|kf|kh|kç|kţ|pf|ph|px|pç|pļ|pţ|tf|th|tx|tç|tļ)$/;
var LEGAL_WORD_INITIAL_3_CONSONANT_FORMS = /^(?:[pk][sš].|[bd][zž].|[ptk][fţhļ][wy]|[bdg][vḑ][wy]|[tkpbdg][lr][wy]|[ptk]ç[mnň]|[pk][fţ][wy]|[pt]ļ[wy]|[sšç][ptk][wyřlr]|[zž][bdg][wyřlr]|[sšzžç][mnň][wy]|hlw|hrw|hmw|hnw|hmy|hny|hll|hrr|hmm|hnn|[cč][ptk][rlwyř]|[żj][bdg][rlwyř]|[cčżj][mnň][wy]|[fţ]l[wy]|x[pt][lrwy]|x[mn][wy]|x[cč]w)$/;
function isLegalWordInitialConsonantForm(text2) {
  if (!isLegalConsonantForm(text2)) {
    return false;
  }
  if (text2.length == 1) {
    return text2 != "\u013C";
  }
  if (text2.length == 2) {
    return LEGAL_WORD_INITIAL_2_CONSONANT_FORMS.test(text2);
  }
  if (text2.length == 3) {
    return LEGAL_WORD_INITIAL_3_CONSONANT_FORMS.test(text2);
  }
  if (text2.length == 4) {
    return "tkp".includes(text2[2]) && "lr\u0159wy".includes(text2[3]) && LEGAL_WORD_INITIAL_3_CONSONANT_FORMS.test(text2.slice(0, 3)) || "sz\u0161\u017Ec\u017C\u010Dj\xE7".includes(text2[0]) && "tkpbdg".includes(text2[1]) && text2[2] == "l" && text2[3] == "y" && LEGAL_WORD_INITIAL_3_CONSONANT_FORMS.test(text2.slice(0, 3));
  }
  return false;
}

// node_modules/@zsnout/ithkuil/generate/referential/perspective.js
var REFERENTIAL_PERSPECTIVE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  M: "",
  G: "\u013C",
  N: "\xE7",
  A: "w"
});
var REFERENTIAL_PERSPECTIVE_TO_ITHKUIL_MAP_ALT = /* @__PURE__ */ deepFreeze({
  M: "",
  G: "t\u013C",
  N: "x",
  A: "y"
});
function referentialPerspectiveToIthkuil(perspective) {
  return REFERENTIAL_PERSPECTIVE_TO_ITHKUIL_MAP[perspective];
}
function referentialPerspectiveToIthkuilAlt(perspective) {
  return REFERENTIAL_PERSPECTIVE_TO_ITHKUIL_MAP_ALT[perspective];
}

// node_modules/@zsnout/ithkuil/generate/referential/referent/list.js
function assembleReferentList(referents, perspective, isReferentialAffix, isSecondReferent) {
  const text2 = referents.map((referent) => referentToIthkuil(referent, isReferentialAffix));
  let output = "";
  let index = 0;
  if (isSecondReferent) {
    for (; index < text2.length; index++) {
      output += text2[index];
    }
  } else {
    for (; index < text2.length; index++) {
      if (isLegalWordInitialConsonantForm(output + text2[index])) {
        output += text2[index];
      } else {
        output = "\xEB" + output + text2.slice(index);
        break;
      }
    }
  }
  const persp = referentialPerspectiveToIthkuil(perspective);
  const persp2 = referentialPerspectiveToIthkuilAlt(perspective);
  if (output.startsWith("\xEB")) {
    if (isLegalConsonantForm(output.slice(1) + persp)) {
      return output + persp;
    }
    if (isLegalConsonantForm(persp + output.slice(1))) {
      return "\xEB" + persp + output.slice(1);
    }
    return output + persp;
  }
  const isLegal = isSecondReferent ? isLegalWordFinalConsonantForm : isLegalWordInitialConsonantForm;
  if (isLegal(output + persp)) {
    return output + persp;
  }
  if (isLegal(persp + output)) {
    return persp + output;
  }
  if (isLegal(output + persp2)) {
    return output + persp2;
  }
  if (isLegal(persp2 + output)) {
    return persp2 + output;
  }
  if (isSecondReferent) {
    return output + persp;
  } else {
    return "\xEB" + output + persp;
  }
}
function referentListToIthkuil(referents, perspective, isSecondReferent) {
  const all = allPermutationsOf(referents.slice().sort()).map((referentList) => assembleReferentList(referentList, perspective, false, isSecondReferent)).sort((a, b) => a.length < b.length ? -1 : a.length > b.length ? 1 : 0);
  if (isSecondReferent) {
    const valid3 = all.find((text2) => isLegalWordFinalConsonantForm(text2));
    return valid3 ?? all[0];
  }
  const valid = all.find((text2) => isLegalWordInitialConsonantForm(text2));
  if (valid) {
    return valid;
  }
  const valid2 = all.find((text2) => text2.startsWith("\xEB"));
  return valid2 || all[0];
}
function referentialAffixToIthkuil(referents, perspective) {
  if (
    // @ts-ignore
    perspective == "A"
  ) {
    throw new Error("Referents may not be marked Abstract in referential affixes.");
  }
  const options = allPermutationsOf(referents.slice().sort()).flatMap((referents2) => [
    referents2.map((referent) => referentToIthkuil(referent, true)).join("") + referentialPerspectiveToIthkuil(perspective),
    referents2.map((referent) => referentToIthkuil(referent, true)).join("") + referentialPerspectiveToIthkuilAlt(perspective),
    referentialPerspectiveToIthkuil(perspective) + referents2.map((referent) => referentToIthkuil(referent, true)).join(""),
    referentialPerspectiveToIthkuilAlt(perspective) + referents2.map((referent) => referentToIthkuil(referent, true)).join("")
  ]);
  for (const option of options) {
    if (isLegalConsonantForm(option)) {
      return option;
    }
  }
  if (options[0]) {
    return options[0];
  }
  throw new Error("Unable to construct referential affix.");
}
function nonReferentialAffixReferentToIthkuil(referent) {
  return referentToIthkuil(referent, false);
}
function referentListToPersonalReferenceRoot(list) {
  const sorted = list.slice().sort().reverse();
  const fallback = sorted.map(nonReferentialAffixReferentToIthkuil).join("");
  for (const permututation of allPermutationsOf(sorted)) {
    const output = permututation.map(nonReferentialAffixReferentToIthkuil).join("");
    if (isLegalConsonantForm(output)) {
      return output;
    }
  }
  return fallback;
}

// node_modules/@zsnout/ithkuil/generate/referential/referent/referent.js
var ALL_REFERENTS = /* @__PURE__ */ deepFreeze([
  "1m:NEU",
  "1m:BEN",
  "1m:DET",
  "2m:NEU",
  "2m:BEN",
  "2m:DET",
  "2p:NEU",
  "2p:BEN",
  "2p:DET",
  "ma:NEU",
  "ma:BEN",
  "ma:DET",
  "pa:NEU",
  "pa:BEN",
  "pa:DET",
  "mi:NEU",
  "mi:BEN",
  "mi:DET",
  "pi:NEU",
  "pi:BEN",
  "pi:DET",
  "Mx:NEU",
  "Mx:BEN",
  "Mx:DET",
  "Rdp:NEU",
  "Rdp:BEN",
  "Rdp:DET",
  "Obv:NEU",
  "Obv:BEN",
  "Obv:DET",
  "PVS:NEU",
  "PVS:BEN",
  "PVS:DET"
]);
var REFERENT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  /** The `false` branch is used in referentials and personal-reference roots. */
  false: {
    "1m:NEU": "l",
    "1m:BEN": "r",
    "1m:DET": "\u0159",
    "2m:NEU": "s",
    "2m:BEN": "\u0161",
    "2m:DET": "\u017E",
    "2p:NEU": "n",
    "2p:BEN": "t",
    "2p:DET": "d",
    "ma:NEU": "m",
    "ma:BEN": "p",
    "ma:DET": "b",
    "pa:NEU": "\u0148",
    "pa:BEN": "k",
    "pa:DET": "g",
    "mi:NEU": "z",
    "mi:BEN": "\u0163",
    "mi:DET": "\u1E11",
    "pi:NEU": "\u017C",
    "pi:BEN": "f",
    "pi:DET": "v",
    "Mx:NEU": "c",
    "Mx:BEN": "\u010D",
    "Mx:DET": "j",
    "Rdp:NEU": "th",
    "Rdp:BEN": "ph",
    "Rdp:DET": "kh",
    "Obv:NEU": "ll",
    "Obv:BEN": "rr",
    "Obv:DET": "\u0159\u0159",
    "PVS:NEU": "mm",
    "PVS:BEN": "nn",
    "PVS:DET": "\u0148\u0148"
  },
  /** The `true` branch is used in referential affixes. */
  true: {
    "1m:NEU": "l",
    "1m:BEN": "r",
    "1m:DET": "\u0159",
    "2m:NEU": "s",
    "2m:BEN": "\u0161",
    "2m:DET": "\u017E",
    "2p:NEU": "n",
    "2p:BEN": "t",
    "2p:DET": "d",
    "ma:NEU": "m",
    "ma:BEN": "p",
    "ma:DET": "b",
    "pa:NEU": "\u0148",
    "pa:BEN": "k",
    "pa:DET": "g",
    "mi:NEU": "z",
    "mi:BEN": "\u0163",
    "mi:DET": "\u1E11",
    "pi:NEU": "\u017C",
    "pi:BEN": "f",
    "pi:DET": "v",
    "Mx:NEU": "c",
    "Mx:BEN": "\u010D",
    "Mx:DET": "j",
    "Rdp:NEU": "th",
    "Rdp:BEN": "ph",
    "Rdp:DET": "kh",
    "Obv:NEU": "l\xE7",
    "Obv:BEN": "r\xE7",
    "Obv:DET": "\u0159\xE7",
    "PVS:NEU": "m\xE7",
    "PVS:BEN": "n\xE7",
    "PVS:DET": "\u0148\xE7"
  }
});
function referentToIthkuil(referent, isReferentialAffix) {
  return REFERENT_TO_ITHKUIL_MAP[`${isReferentialAffix}`][referent];
}

// node_modules/@zsnout/ithkuil/generate/affix/index.js
var REFERENTIAL_AFFIX_CASE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  THM: "ao",
  INS: "a\xF6",
  ABS: "eo",
  AFF: "e\xF6",
  STM: "o\xEB",
  EFF: "\xF6e",
  ERG: "oe",
  DAT: "\xF6a",
  IND: "oa",
  POS: IA_U\u00C4,
  PRP: IE_U\u00CB,
  GEN: IO_\u00DC\u00C4,
  ATT: I\u00D6_\u00DC\u00CB,
  PDC: "e\xEB",
  ITP: U\u00D6_\u00D6\u00CB,
  OGN: UO_\u00D6\u00C4,
  IDP: UE_I\u00CB,
  PAR: UA_I\u00C4
});
function affixToIthkuil(affix, metadata) {
  let vowel2 = WithWYAlternative.of("ca" in affix && affix.ca ? "\xFC\xF6" : "referents" in affix && affix.referents ? REFERENTIAL_AFFIX_CASE_TO_ITHKUIL_MAP[affix.case ?? "THM"] : "case" in affix && affix.case ? caseToIthkuil(affix.case, false, true) : STANDARD_VOWEL_TABLE[affix.type][affix.degree]);
  if (metadata.insertGlottalStop) {
    vowel2 = vowel2.insertGlottalStop(metadata.isGlottalStopWordFinal ?? false);
  }
  const consonant2 = "ca" in affix && affix.ca ? caToIthkuil(affix.ca) : "referents" in affix && affix.referents ? referentialAffixToIthkuil(affix.referents, affix.perspective ?? "M") : "case" in affix && affix.case ? ("type" in affix && affix.type ? CASE_AFFIX_TO_CS_MAP[`${affix.isInverse}`][affix.type] : "l") + (ALL_CASES.indexOf(affix.case) >= 36 ? "y" : "w") : (typeof affix.cs == "number" || typeof affix.cs == "bigint") && getIntegerCs(affix.cs) || "" + affix.cs;
  if (metadata.reversed) {
    return WithWYAlternative.of(consonant2 + vowel2.withPreviousText(consonant2));
  } else {
    return vowel2.add(consonant2);
  }
}

// node_modules/@zsnout/ithkuil/generate/helpers/stress.js
var VOWEL_TO_STRESSED_VOWEL_MAP = /* @__PURE__ */ deepFreeze({
  a: "\xE1",
  \u00E4: "\xE2",
  e: "\xE9",
  \u00EB: "\xEA",
  i: "\xED",
  o: "\xF3",
  \u00F6: "\xF4",
  u: "\xFA",
  \u00FC: "\xFB"
});
function stressVowelForm(vowelForm) {
  if (vowelForm.length == 0) {
    throw new Error("Expected a vowel form; found ''.");
  }
  const firstChar = vowelForm[0];
  if (firstChar in VOWEL_TO_STRESSED_VOWEL_MAP) {
    return VOWEL_TO_STRESSED_VOWEL_MAP[firstChar] + vowelForm.slice(1);
  }
  throw new Error("Expected a vowel form; found '" + vowelForm + "'.");
}
function countVowelForms(text2) {
  return text2.match(/[aeëou]i|[aeëio]u|[aeiouäëöü]/g)?.length || 0;
}
function applyStress(word, position) {
  const sequences = word.match(/[aeëou]i|[aeëio]u|[aeiouäëöü]|[^aeiouäëöü]+/g);
  if (!sequences) {
    throw new Error("Cannot add stress to an empty word.");
  }
  const vowelFormIndices = sequences.map((value, index) => [value, index]).filter(([value]) => /[aeiouäëöü]/.test(value));
  const stressType = position == -1 ? "ultimate" : position == -2 ? "penultimate" : position == -3 ? "antepenultimate" : position == -4 ? "preantepenultimate" : "(unknown stress)";
  const item = vowelFormIndices.at(position);
  if (!item) {
    throw new Error("Cannot apply " + stressType + " stress to a word with " + vowelFormIndices.length + " vowel form" + (vowelFormIndices.length == 1 ? "" : "s") + ".");
  }
  sequences[item[1]] = stressVowelForm(item[0]);
  return sequences.join("");
}

// node_modules/@zsnout/ithkuil/generate/adjunct/affixual/scope.js
var AFFIXUAL_ADJUNCT_SCOPE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  vs: {
    "V:DOM": "a",
    "V:SUB": "u",
    "VII:DOM": "e",
    "VII:SUB": "i",
    FORMATIVE: "o",
    ADJACENT: "\xF6"
  },
  cz: {
    "V:DOM": "h",
    "V:SUB": "'h",
    "VII:DOM": "'hl",
    "VII:SUB": "'hr",
    FORMATIVE: "hw",
    ADJACENT: "'hw"
  }
});
function affixualAdjunctScopeToIthkuil(scope, type, omitWhenPossible) {
  if (type == "vs" && scope == "V:DOM" && omitWhenPossible) {
    return "";
  }
  return AFFIXUAL_ADJUNCT_SCOPE_TO_ITHKUIL_MAP[type == "vz" ? "vs" : type][scope];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/affixual/index.js
function affixualAdjunctToIthkuil(adjunct) {
  if (adjunct.affixes.length == 1) {
    const affix = affixToIthkuil(adjunct.affixes[0], {
      reversed: false
    }).defaultValue;
    const scope2 = affixualAdjunctScopeToIthkuil(adjunct.scope ?? "V:DOM", "vs", (adjunct.appliesToConcatenatedStemOnly ?? false) && isLegalWordFinalConsonantForm(extractAllConsonants(affix)));
    if (adjunct.appliesToConcatenatedStemOnly) {
      const output2 = affix + scope2;
      if (countVowelForms(output2) == 1) {
        return output2;
      } else {
        return applyStress(output2, -1);
      }
    }
    return affix + scope2;
  }
  const rawAffix1 = affixToIthkuil(adjunct.affixes[0], {
    reversed: true
  }).defaultValue;
  const affix1 = isLegalWordInitialConsonantForm(extractAllConsonants(rawAffix1)) ? rawAffix1 : "\xEB" + rawAffix1;
  const cz = affixualAdjunctScopeToIthkuil(adjunct.scope ?? "V:DOM", "cz", false);
  const main = adjunct.affixes.slice(1).map((affix) => affixToIthkuil(affix, { reversed: false })).reduce((a, b) => a + b.withPreviousText(a), affix1 + cz);
  const scope = adjunct.scope2 ? affixualAdjunctScopeToIthkuil(adjunct.scope2, "vz", false) : "ai";
  const output = main + scope;
  if (adjunct.appliesToConcatenatedStemOnly) {
    return applyStress(output, -1);
  }
  return output;
}

// node_modules/@zsnout/ithkuil/generate/adjunct/bias.js
var ALL_BIAS_ADJUNCTS = /* @__PURE__ */ deepFreeze([
  "ACC",
  "ACH",
  "ADS",
  "ANN",
  "ANP",
  "APB",
  "APH",
  "ARB",
  "ATE",
  "CMD",
  "CNV",
  "COI",
  "CRP",
  "CRR",
  "CTP",
  "CTV",
  "DCC",
  "DEJ",
  "DES",
  "DFD",
  "DIS",
  "DLC",
  "DOL",
  "DPB",
  "DRS",
  "DUB",
  "EUH",
  "EUP",
  "EXA",
  "EXG",
  "FOR",
  "FSC",
  "GRT",
  "IDG",
  "IFT",
  "IPL",
  "IPT",
  "IRO",
  "ISP",
  "IVD",
  "MAN",
  "MNF",
  "OPT",
  "PES",
  "PPT",
  "PPX",
  "PPV",
  "PSC",
  "PSM",
  "RAC",
  "RFL",
  "RSG",
  "RPU",
  "RVL",
  "SAT",
  "SGS",
  "SKP",
  "SOL",
  "STU",
  "TRP",
  "VEX"
]);
var BIAS_ADJUNCT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  ACC: "lf",
  ACH: "m\xE7t",
  ADS: "l\u013C",
  ANN: "drr",
  ANP: "lst",
  APB: "\u0159s",
  APH: "vvz",
  ARB: "xt\u013C",
  ATE: "\u0148j",
  CMD: "p\u013C\u013C",
  CNV: "rrj",
  COI: "\u0161\u0161\u010D",
  CRP: "g\u017E\u017E",
  CRR: "\u0148\u0163",
  CTP: "k\u0161\u0161",
  CTV: "gvv",
  DCC: "gzj",
  DEJ: "\u017E\u017Eg",
  DES: "m\u0159\u0159",
  DFD: "c\u010D",
  DIS: "kff",
  DLC: "\u017Cmm",
  DOL: "\u0159\u0159x",
  DPB: "ffx",
  DRS: "pfc",
  DUB: "mmf",
  EUH: "gzz",
  EUP: "vvt",
  EXA: "k\xE7\xE7",
  EXG: "rrs",
  FOR: "lzp",
  FSC: "\u017E\u017Ej",
  GRT: "mmh",
  IDG: "p\u0161\u0161",
  IFT: "vvr",
  IPL: "vll",
  IPT: "\u017E\u017Ev",
  IRO: "mm\u017E",
  ISP: "l\xE7p",
  IVD: "\u0159\u0159n",
  MAN: "msk",
  MNF: "pss",
  OPT: "\xE7\xE7k",
  PES: "ksp",
  PPT: "mll",
  PPX: "llh",
  PPV: "sl",
  PSC: "\u017E\u017Et",
  PSM: "nn\u0163",
  RAC: "kll",
  RFL: "llm",
  RSG: "msf",
  RPU: "\u0161\u0161t\u013C",
  RVL: "mm\u013C",
  SAT: "\u013C\u0163",
  SGS: "lt\xE7",
  SKP: "rn\u017E",
  SOL: "\u0148\u0148s",
  STU: "\u013C\u013C\u010D",
  TRP: "ll\u010D",
  VEX: "ksk"
});
var BIAS_ITHKUIL_TO_ADJUNCT_MAP = /* @__PURE__ */ deepFreeze({
  lf: "ACC",
  m\u00E7t: "ACH",
  l\u013C: "ADS",
  drr: "ANN",
  lst: "ANP",
  \u0159s: "APB",
  vvz: "APH",
  xt\u013C: "ARB",
  \u0148j: "ATE",
  p\u013C\u013C: "CMD",
  rrj: "CNV",
  \u0161\u0161\u010D: "COI",
  g\u017E\u017E: "CRP",
  \u0148\u0163: "CRR",
  k\u0161\u0161: "CTP",
  gvv: "CTV",
  gzj: "DCC",
  \u017E\u017Eg: "DEJ",
  m\u0159\u0159: "DES",
  c\u010D: "DFD",
  kff: "DIS",
  \u017Cmm: "DLC",
  \u0159\u0159x: "DOL",
  ffx: "DPB",
  pfc: "DRS",
  mmf: "DUB",
  gzz: "EUH",
  vvt: "EUP",
  k\u00E7\u00E7: "EXA",
  rrs: "EXG",
  lzp: "FOR",
  \u017E\u017Ej: "FSC",
  mmh: "GRT",
  p\u0161\u0161: "IDG",
  vvr: "IFT",
  vll: "IPL",
  \u017E\u017Ev: "IPT",
  mm\u017E: "IRO",
  l\u00E7p: "ISP",
  \u0159\u0159n: "IVD",
  msk: "MAN",
  pss: "MNF",
  \u00E7\u00E7k: "OPT",
  ksp: "PES",
  mll: "PPT",
  llh: "PPX",
  sl: "PPV",
  \u017E\u017Et: "PSC",
  nn\u0163: "PSM",
  kll: "RAC",
  llm: "RFL",
  msf: "RSG",
  \u0161\u0161t\u013C: "RPU",
  mm\u013C: "RVL",
  \u013C\u0163: "SAT",
  lt\u00E7: "SGS",
  rn\u017E: "SKP",
  \u0148\u0148s: "SOL",
  \u013C\u013C\u010D: "STU",
  ll\u010D: "TRP",
  ksk: "VEX"
});
function biasAdjunctToIthkuil(bias) {
  return BIAS_ADJUNCT_TO_ITHKUIL_MAP[bias];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/aspect.js
var ALL_ASPECTS = /* @__PURE__ */ deepFreeze([
  "RTR",
  "PRS",
  "HAB",
  "PRG",
  "IMM",
  "PCS",
  "REG",
  "SMM",
  "ATP",
  "RSM",
  "CSS",
  "PAU",
  "RGR",
  "PCL",
  "CNT",
  "ICS",
  "EXP",
  "IRP",
  "PMP",
  "CLM",
  "DLT",
  "TMP",
  "XPD",
  "LIM",
  "EPD",
  "PTC",
  "PPR",
  "DCL",
  "CCL",
  "CUL",
  "IMD",
  "TRD",
  "TNS",
  "ITC",
  "MTV",
  "SQN"
]);
var ASPECT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  RTR: "a",
  PRS: "\xE4",
  HAB: "e",
  PRG: "i",
  IMM: "\xEBi",
  PCS: "\xF6",
  REG: "o",
  SMM: "\xFC",
  ATP: "u",
  RSM: "ai",
  CSS: "au",
  PAU: "ei",
  RGR: "eu",
  PCL: "\xEBu",
  CNT: "ou",
  ICS: "oi",
  EXP: "iu",
  IRP: "ui",
  PMP: IA_U\u00C4,
  CLM: IE_U\u00CB,
  DLT: IO_\u00DC\u00C4,
  TMP: I\u00D6_\u00DC\u00CB,
  XPD: "e\xEB",
  LIM: U\u00D6_\u00D6\u00CB,
  EPD: UO_\u00D6\u00C4,
  PTC: UE_I\u00CB,
  PPR: UA_I\u00C4,
  DCL: "ao",
  CCL: "a\xF6",
  CUL: "eo",
  IMD: "e\xF6",
  TRD: "o\xEB",
  TNS: "\xF6e",
  ITC: "oe",
  MTV: "\xF6a",
  SQN: "oa"
});
function aspectToIthkuil(aspect) {
  return ASPECT_TO_ITHKUIL_MAP[aspect];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/case-scope.js
var CASE_SCOPE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  /**
   * The `false` branch is used when the case-scope occurs after non-aspectual
   * Vn forms.
   */
  false: {
    CCN: "h",
    CCA: "hl",
    CCS: "hr",
    CCQ: "hm",
    CCP: "hn",
    CCV: "h\u0148"
  },
  /**
   * The `true` branch is used when the case-scope occurs after aspectual Vn
   * forms.
   */
  true: {
    CCN: "w",
    CCA: "hw",
    CCS: "hrw",
    CCQ: "hmw",
    CCP: "hnw",
    CCV: "h\u0148w"
  }
});
function caseScopeToIthkuil(caseScope, vnType) {
  const value = CASE_SCOPE_TO_ITHKUIL_MAP[`${vnType == "aspect"}`][caseScope];
  if (value == "h" && vnType == "empty") {
    return "";
  }
  return value;
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/effect.js
var ALL_EFFECTS = /* @__PURE__ */ deepFreeze([
  "1:BEN",
  "2:BEN",
  "3:BEN",
  "SLF:BEN",
  "UNK",
  "SLF:DET",
  "3:DET",
  "2:DET",
  "1:DET"
]);
var EFFECT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  "1:BEN": IA_U\u00C4,
  "2:BEN": IE_U\u00CB,
  "3:BEN": IO_\u00DC\u00C4,
  "SLF:BEN": I\u00D6_\u00DC\u00CB,
  UNK: /* @__PURE__ */ WithWYAlternative.of("e\xEB"),
  "SLF:DET": U\u00D6_\u00D6\u00CB,
  "3:DET": UO_\u00D6\u00C4,
  "2:DET": UE_I\u00CB,
  "1:DET": UA_I\u00C4
});
function effectToIthkuil(effect) {
  return EFFECT_TO_ITHKUIL_MAP[effect];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/level.js
var ALL_LEVELS = /* @__PURE__ */ deepFreeze([
  "MIN",
  "SBE",
  "IFR",
  "DFT",
  "EQU",
  "SUR",
  "SPL",
  "SPQ",
  "MAX"
]);
var LEVEL_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  MIN: "ao",
  SBE: "a\xF6",
  IFR: "eo",
  DFT: "e\xF6",
  EQU: "o\xEB",
  SUR: "\xF6e",
  SPL: "oe",
  SPQ: "\xF6a",
  MAX: "oa"
});
function levelToIthkuil(level) {
  return LEVEL_TO_ITHKUIL_MAP[level];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/mood-or-case-scope.js
var key = /* @__PURE__ */ Symbol();
var MoodOrCaseScope = class {
  /** The mood this object represents. */
  mood;
  /** The case-scope this object represents. */
  caseScope;
  /**
   * The Cn value this object has when its corresponding Vn value isn't an
   * Aspect.
   */
  nonAspectualValue;
  /** The Cn value this object has when its corresponding Vn value is an Aspect. */
  aspectualValue;
  constructor(mood, caseScope, nonAspectualValue, aspectualValue, lock) {
    if (lock != key) {
      throw new Error("New `MoodOrCaseScope` objects cannot be constructed. Use the exported objects instead of constructing new ones.");
    }
    this.caseScope = caseScope;
    this.mood = mood;
    this.nonAspectualValue = nonAspectualValue;
    this.aspectualValue = aspectualValue;
    Object.freeze(this);
  }
  /**
   * Converts this `MoodOrCaseScope` into a Cn form.
   *
   * @param isAspectual Whether the corresponding Vn value is an Aspect.
   * @returns Romanized Ithkuilic text representing this Cn value.
   */
  toString(isAspectual) {
    return isAspectual ? this.aspectualValue : this.nonAspectualValue;
  }
  /**
   * Converts this `MoodOrCaseScope` into JSON.
   *
   * @returns A string containing slash-separated mood and case-scope.
   */
  toJSON() {
    return this.mood + "/" + this.caseScope;
  }
};
var X = MoodOrCaseScope;
var FAC_CCN = /* @__PURE__ */ new X("FAC", "CCN", "h", "w", key);
var SUB_CCA = /* @__PURE__ */ new X("SUB", "CCA", "hl", "hw", key);
var ASM_CCS = /* @__PURE__ */ new X("ASM", "CCS", "hr", "hrw", key);
var SPC_CCQ = /* @__PURE__ */ new X("SPC", "CCQ", "hm", "hmw", key);
var COU_CCP = /* @__PURE__ */ new X("COU", "CCP", "hn", "hnw", key);
var HYP_CCV = /* @__PURE__ */ new X("HYP", "CCV", "h\u0148", "h\u0148w", key);

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/mood.js
var ALL_MOODS = /* @__PURE__ */ deepFreeze([
  "FAC",
  "SUB",
  "ASM",
  "SPC",
  "COU",
  "HYP"
]);
var MOOD_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  /**
   * The `false` branch is used when the mood occurs after non-aspectual Vn
   * forms.
   */
  false: {
    FAC: "h",
    SUB: "hl",
    ASM: "hr",
    SPC: "hm",
    COU: "hn",
    HYP: "h\u0148"
  },
  /** The `true` branch is used when the mood occurs after aspectual Vn forms. */
  true: {
    FAC: "w",
    SUB: "hw",
    ASM: "hrw",
    SPC: "hmw",
    COU: "hnw",
    HYP: "h\u0148w"
  }
});
function moodToIthkuil(mood, vnType) {
  const value = MOOD_TO_ITHKUIL_MAP[`${vnType == "aspect"}`][mood];
  if (value == "h" && vnType == "empty") {
    return "";
  }
  return value;
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/phase.js
var ALL_PHASES = /* @__PURE__ */ deepFreeze([
  "PUN",
  "ITR",
  "REP",
  "ITM",
  "RCT",
  "FRE",
  "FRG",
  "VAC",
  "FLC"
]);
var PHASE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  PUN: "ai",
  ITR: "au",
  REP: "ei",
  ITM: "eu",
  RCT: "\xEBu",
  FRE: "ou",
  FRG: "oi",
  VAC: "iu",
  FLC: "ui"
});
function phaseToIthkuil(phase) {
  return PHASE_TO_ITHKUIL_MAP[phase];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/valence.js
var ALL_VALENCES = [
  "MNO",
  "PRL",
  "CRO",
  "RCP",
  "CPL",
  "DUP",
  "DEM",
  "CNG",
  "PTI"
];
var VALENCE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  MNO: "a",
  PRL: "\xE4",
  CRO: "e",
  RCP: "i",
  CPL: "\xEBi",
  DUP: "\xF6",
  DEM: "o",
  CNG: "\xFC",
  PTI: "u"
});
function valenceToIthkuil(valence, omitDefaultValence) {
  if (omitDefaultValence && valence == "MNO") {
    return "";
  }
  return VALENCE_TO_ITHKUIL_MAP[valence];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-8/index.js
function vnToIthkuil(vn, omitDefaultValence) {
  return has(ALL_VALENCES, vn) ? valenceToIthkuil(vn, omitDefaultValence) : has(ALL_PHASES, vn) ? phaseToIthkuil(vn) : has(ALL_EFFECTS, vn) ? effectToIthkuil(vn) : has(ALL_LEVELS, vn) ? levelToIthkuil(vn) : aspectToIthkuil(vn);
}
function cnToIthkuil(cn, vnType) {
  return cn instanceof MoodOrCaseScope ? vnType == "empty" && cn == FAC_CCN ? "" : vnType == "aspect" ? cn.aspectualValue : cn.nonAspectualValue : has(ALL_MOODS, cn) ? moodToIthkuil(cn, vnType) : caseScopeToIthkuil(cn, vnType);
}
function slotVIIIToIthkuil(slot, metadata) {
  if (metadata.omitDefault && slot.vn == "MNO" && (slot.cn == "CCN" || slot.cn == "FAC")) {
    return EMPTY;
  }
  const vn = vnToIthkuil(slot.vn, false);
  const vnType = has(ALL_ASPECTS, slot.vn) ? "aspect" : "non-aspect";
  const cn = cnToIthkuil(slot.cn, vnType);
  if (typeof vn == "string") {
    return WithWYAlternative.of(vn + cn);
  } else {
    return vn.add(cn);
  }
}

// node_modules/@zsnout/ithkuil/generate/adjunct/modular/scope.js
var MODULAR_ADJUNCT_SCOPE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  "CASE/MOOD+ILL/VAL": "a",
  "CASE/MOOD": "e",
  FORMATIVE: "i",
  ADJACENT: "o"
});
function modularAdjunctScopeToIthkuil(scope) {
  return MODULAR_ADJUNCT_SCOPE_TO_ITHKUIL_MAP[scope];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/modular/type.js
var MODULAR_ADJUNCT_TYPE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  WHOLE: "",
  PARENT: "w",
  CONCAT: "y"
});
function modularAdjunctTypeToIthkuil(type) {
  return MODULAR_ADJUNCT_TYPE_TO_ITHKUIL_MAP[type];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/modular/index.js
function modularAdjunctToIthkuil(adjunct) {
  const type = modularAdjunctTypeToIthkuil(adjunct.type ?? "WHOLE");
  if (adjunct.scope == null && adjunct.vn3 == null) {
    const aspect = WithWYAlternative.of(aspectToIthkuil(adjunct.vn1)).withPreviousText(type);
    return type + aspect;
  }
  const vn1 = slotVIIIToIthkuil({ cn: adjunct.cn || "CCN", vn: adjunct.vn1 }, { omitDefault: false }).withPreviousText(type);
  const vn2 = adjunct.vn2 ? WithWYAlternative.of(vnToIthkuil(adjunct.vn2, false)).withPreviousText(type + vn1) + (has(ALL_ASPECTS, adjunct.vn2) ? "n" : "\u0148") : "";
  const output = type + vn1 + vn2;
  if (adjunct.vn3) {
    const vn3 = vnToIthkuil(adjunct.vn3, false);
    return WithWYAlternative.add(output, vn3);
  }
  return output + VOWEL_TO_STRESSED_VOWEL_MAP[modularAdjunctScopeToIthkuil(adjunct.scope)];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/numeric.js
function numericAdjunctToIthkuil(number) {
  return "" + number;
}

// node_modules/@zsnout/ithkuil/generate/adjunct/parsing.js
var ALL_PARSING_ADJUNCTS = /* @__PURE__ */ deepFreeze([
  "monosyllabic",
  "ultimate",
  "penultimate",
  "antepenultimate"
]);
var PARSING_ADJUNCT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  monosyllabic: "a'",
  ultimate: "e'",
  penultimate: "o'",
  antepenultimate: "u'"
});
function parsingAdjunctToIthkuil(adjunct) {
  return PARSING_ADJUNCT_TO_ITHKUIL_MAP[adjunct];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/register.js
var ALL_REGISTER_ADJUNCTS = /* @__PURE__ */ deepFreeze(["DSV", "PNT", "SPF", "EXM", "CGT", "END"]);
var ALL_SINGLE_REGISTER_ADJUNCTS = /* @__PURE__ */ deepFreeze([
  "DSV:START",
  "DSV:END",
  "PNT:START",
  "PNT:END",
  "SPF:START",
  "SPF:END",
  "EXM:START",
  "EXM:END",
  "CGT:START",
  "CGT:END",
  "END:END"
]);
var REGISTER_ADJUNCT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  NRR: ["", ""],
  DSV: ["ha", "hai"],
  PNT: ["he", "hei"],
  SPF: ["hi", "hiu"],
  EXM: ["ho", "hoi"],
  CGT: ["hu", "hui"],
  END: ["", "h\xFC"]
});
var SINGLE_REGISTER_ADJUNCT_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  "NRR:START": "",
  "NRR:END": "",
  "DSV:START": "ha",
  "DSV:END": "hai",
  "PNT:START": "he",
  "PNT:END": "hei",
  "SPF:START": "hi",
  "SPF:END": "hiu",
  "EXM:START": "ho",
  "EXM:END": "hoi",
  "CGT:START": "hu",
  "CGT:END": "hui",
  "END:END": "h\xFC"
});
var SINGLE_REGISTER_ITHKUIL_TO_ADJUNCT_MAP = /* @__PURE__ */ deepFreeze({
  ha: "DSV:START",
  hai: "DSV:END",
  he: "PNT:START",
  hei: "PNT:END",
  hi: "SPF:START",
  hiu: "SPF:END",
  ho: "EXM:START",
  hoi: "EXM:END",
  hu: "CGT:START",
  hui: "CGT:END",
  h\u00FC: "END:END"
});
function registerAdjunctToIthkuil(adjunct) {
  return REGISTER_ADJUNCT_TO_ITHKUIL_MAP[adjunct];
}
function singleRegisterAdjunctToIthkuil(adjunct) {
  return SINGLE_REGISTER_ADJUNCT_TO_ITHKUIL_MAP[adjunct];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/suppletive/type.js
var SUPPLETIVE_ADJUNCT_TYPE_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  CAR: "hl",
  QUO: "hm",
  NAM: "hn",
  PHR: "h\u0148"
});
function suppletiveAdjunctTypeToIthkuil(type) {
  return SUPPLETIVE_ADJUNCT_TYPE_TO_ITHKUIL_MAP[type];
}

// node_modules/@zsnout/ithkuil/generate/adjunct/suppletive/index.js
function suppletiveAdjunctToIthkuil(adjunct) {
  const type = suppletiveAdjunctTypeToIthkuil(adjunct.type);
  return WithWYAlternative.add(type, caseToIthkuil(adjunct.case, false, false));
}

// node_modules/@zsnout/ithkuil/generate/adjunct/index.js
function adjunctToIthkuil(adjunct) {
  if (typeof adjunct == "number" || typeof adjunct == "bigint") {
    return numericAdjunctToIthkuil(adjunct);
  }
  if (typeof adjunct == "string") {
    if (has(ALL_BIAS_ADJUNCTS, adjunct)) {
      return biasAdjunctToIthkuil(adjunct);
    }
    if (has(ALL_PARSING_ADJUNCTS, adjunct)) {
      return parsingAdjunctToIthkuil(adjunct);
    }
    if (has(ALL_SINGLE_REGISTER_ADJUNCTS, adjunct)) {
      return singleRegisterAdjunctToIthkuil(adjunct);
    }
    if (has(ALL_REGISTER_ADJUNCTS, adjunct)) {
      const [initial, final] = registerAdjunctToIthkuil(adjunct);
      return (initial ? initial + " " : "") + "..." + (final ? " " + final : "");
    }
    throw new Error("Unrecognized adjunct: '" + adjunct + "'.");
  }
  if ("affixes" in adjunct && adjunct.affixes) {
    return affixualAdjunctToIthkuil(adjunct);
  }
  if ("vn1" in adjunct && adjunct.vn1) {
    return modularAdjunctToIthkuil(adjunct);
  }
  if ("type" in adjunct && adjunct.type) {
    return suppletiveAdjunctToIthkuil(adjunct);
  }
  throw new Error("Unrecognized adjunct: '" + adjunct + "'.", {
    cause: adjunct
  });
}

// node_modules/@zsnout/ithkuil/data/roots-map.js
function getIntegerCr(root) {
  return {
    1e8: "k\u017C",
    "10000000000000000": "\u010Dg",
    1e4: "pc",
    1: "ll",
    2: "ks",
    3: "z",
    4: "p\u0161",
    5: "st",
    6: "cp",
    7: "ns",
    8: "\u010Dk",
    9: "l\u017C",
    0: "vr",
    100: "gz",
    15: "\u0163\u017C",
    14: "bc",
    13: "\u013Cj",
    12: "jd",
    11: "cg",
    10: "j"
  }["" + root];
}

// node_modules/@zsnout/ithkuil/generate/referential/default.js
var DEFAULT_REFERENTIAL = /* @__PURE__ */ deepFreeze({
  referents: ["1m:NEU"],
  perspective: "M",
  case: "THM",
  essence: "NRM"
});
var DEFAULT_SUPPLETIVE_REFERENTIAL = /* @__PURE__ */ deepFreeze({
  type: "CAR",
  case: "THM",
  essence: "NRM"
});
function fillInDefaultReferentialSlots(referential) {
  if (referential.perspective2 || referential.referents2) {
    if (referential.specification || referential.affixes && referential.affixes.length) {
      throw new Error("A referential cannot specify a second referent/perspective and a specification or affix at the same time.", { cause: referential });
    }
    return referential.type ? fillDefaults({
      ...DEFAULT_SUPPLETIVE_REFERENTIAL,
      perspective2: "M",
      // @ts-ignore
      referents2: "1m:NEU"
    }, referential) : fillDefaults({
      ...DEFAULT_REFERENTIAL,
      perspective2: "M",
      // @ts-ignore
      referents2: "1m:NEU"
    }, referential);
  }
  if (referential.specification || referential.affixes && referential.affixes.length) {
    if (referential.perspective2 || referential.referents2) {
      throw new Error("A referential cannot specify a second referent/perspective and a specification or affix at the same time.", { cause: referential });
    }
    return referential.type ? fillDefaults({
      ...DEFAULT_SUPPLETIVE_REFERENTIAL,
      specification: "BSC",
      affixes: []
    }, referential) : fillDefaults({
      ...DEFAULT_REFERENTIAL,
      specification: "BSC",
      affixes: []
    }, referential);
  }
  return referential.type ? fillDefaults(DEFAULT_SUPPLETIVE_REFERENTIAL, referential) : fillDefaults(DEFAULT_REFERENTIAL, referential);
}

// node_modules/@zsnout/ithkuil/generate/referential/essence.js
function applyReferentialEssence(word, essence) {
  if (essence == "NRM") {
    return word;
  }
  if (!word.startsWith("\xEB") && countVowelForms(word) < 2) {
    word = "\xEB" + word;
  }
  return applyStress(word, -1);
}

// node_modules/@zsnout/ithkuil/generate/referential/specification.js
var REFERENTIAL_SPECIFICATION_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  BSC: "x",
  CTE: "xt",
  CSV: "xp",
  OBJ: "xx"
});
function referentialSpecificationToIthkuil(specification) {
  return REFERENTIAL_SPECIFICATION_TO_ITHKUIL_MAP[specification];
}

// node_modules/@zsnout/ithkuil/generate/referential/referential.js
function completeReferentialToIthkuil(referential) {
  const slot1 = referential.referents ? referentListToIthkuil(referential.referents, referential.perspective, false) : (referential.specification && referential.affixes ? "a" : "\xFCo") + suppletiveAdjunctTypeToIthkuil(referential.type);
  const slot2 = WithWYAlternative.of(caseToIthkuil(referential.case, false, false)).withPreviousText(slot1);
  if (referential.specification && referential.affixes) {
    const slot3 = referentialSpecificationToIthkuil(referential.specification);
    const slot4 = referential.affixes.length ? referential.affixes.map((affix) => affixToIthkuil(affix, { reversed: false })).reduce((a, b) => a.add(b)).withPreviousText(slot1 + slot2 + slot3) : "";
    const slot5 = referential.case2 ? referential.case2 == "THM" ? "\xFCa" : WithWYAlternative.of(caseToIthkuil(referential.case2, false, false)).withPreviousText(slot1 + slot2 + slot3 + slot4) : referential.essence == "NRM" || countVowelForms(slot1 + slot2 + slot3 + slot4) >= 2 ? "" : "a";
    const word = slot1 + slot2 + slot3 + slot4 + slot5;
    return applyReferentialEssence(word, referential.essence);
  }
  if (referential.case2 || referential.perspective2 || referential.referents2) {
    const slot3 = "w" + WithWYAlternative.of(caseToIthkuil(referential.case2 || "THM", false, false)).valueAfterW;
    let slot4 = "";
    if (referential.referents2) {
      const referentList = referentListToIthkuil(referential.referents2, referential.perspective2, true);
      slot4 = isLegalWordFinalConsonantForm(referentList) ? referentList : referentList + "\xEB";
    }
    return applyReferentialEssence(slot1 + slot2 + slot3 + slot4, referential.essence);
  }
  return applyReferentialEssence(slot1 + slot2, referential.essence);
}
function referentialToIthkuil(referential) {
  return completeReferentialToIthkuil(fillInDefaultReferentialSlots(referential));
}

// node_modules/@zsnout/ithkuil/generate/formative/default.js
var DEFAULT_NOMINAL_FORMATIVE = /* @__PURE__ */ deepFreeze({
  type: "UNF/C",
  concatenationType: "none",
  version: "PRC",
  stem: 1,
  root: "l",
  function: "STA",
  specification: "BSC",
  context: "EXS",
  slotVAffixes: [],
  ca: {
    affiliation: "CSL",
    configuration: "UPX",
    extension: "DEL",
    perspective: "M",
    essence: "NRM"
  },
  slotVIIAffixes: [],
  vn: "MNO",
  caseScope: "CCN",
  case: "THM",
  shortcut: false
});
var DEFAULT_UNFRAMED_VERBAL_FORMATIVE = /* @__PURE__ */ deepFreeze({
  type: "UNF/K",
  version: "PRC",
  stem: 1,
  root: "l",
  function: "STA",
  specification: "BSC",
  context: "EXS",
  slotVAffixes: [],
  ca: {
    affiliation: "CSL",
    configuration: "UPX",
    extension: "DEL",
    perspective: "M",
    essence: "NRM"
  },
  slotVIIAffixes: [],
  vn: "MNO",
  mood: "FAC",
  illocutionValidation: "OBS",
  shortcut: false
});
var DEFAULT_FRAMED_VERBAL_FORMATIVE = /* @__PURE__ */ deepFreeze({
  type: "FRM",
  version: "PRC",
  stem: 1,
  root: "l",
  function: "STA",
  specification: "BSC",
  context: "EXS",
  slotVAffixes: [],
  ca: {
    affiliation: "CSL",
    configuration: "UPX",
    extension: "DEL",
    perspective: "M",
    essence: "NRM"
  },
  slotVIIAffixes: [],
  vn: "MNO",
  caseScope: "CCN",
  case: "THM",
  shortcut: false
});
var DEFAULT_FORMATIVES_BY_TYPE = /* @__PURE__ */ deepFreeze({
  "UNF/C": DEFAULT_NOMINAL_FORMATIVE,
  "UNF/K": DEFAULT_UNFRAMED_VERBAL_FORMATIVE,
  FRM: DEFAULT_FRAMED_VERBAL_FORMATIVE
});
function fillInDefaultFormativeSlots(formative) {
  if (formative == null || formative.type == null) {
    throw new Error("You must provide the type of a formative: UNF/C, UNF/K, or FRM.");
  }
  if (formative.root == null) {
    throw new Error("You must provide the root of a formative.");
  }
  const defaultValue = DEFAULT_FORMATIVES_BY_TYPE[formative.type];
  const output = fillDefaults(defaultValue, formative);
  output.ca = formative.ca ? fillDefaults(defaultValue.ca, formative.ca) : defaultValue.ca;
  return output;
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-1/index.js
var SLOT_I_MAP = /* @__PURE__ */ deepFreeze({
  none: {
    none: "",
    w: "w",
    y: "y"
  },
  1: {
    none: "h",
    w: "hl",
    y: "hm"
  },
  2: {
    none: "hw",
    w: "hr",
    y: "hn"
  }
});
function slotIToIthkuil(slot) {
  return SLOT_I_MAP[`${slot.concatenationType}`][`${slot.caShortcutType}`];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-10/index.js
function applySlotXStress(word, stress) {
  const vowelFormCount = countVowelForms(word);
  if (stress == "UNF/C") {
    if (vowelFormCount >= 2) {
      return word;
    }
    throw new Error(`The formative '${word}' cannot be marked nominal.`);
  }
  if (stress == "UNF/K") {
    if (vowelFormCount == 1) {
      return word;
    }
    return applyStress(word, -1);
  }
  if (stress == "FRM") {
    return applyStress(word, -3);
  }
  throw new Error("Invalid stress type '" + stress + "'.");
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-4/index.js
var SLOT_IV_MAP = /* @__PURE__ */ deepFreeze({
  EXS: {
    STA: { BSC: "a", CTE: "\xE4", CSV: "e", OBJ: "i" },
    DYN: { BSC: "u", CTE: "\xFC", CSV: "o", OBJ: "\xF6" }
  },
  FNC: {
    STA: { BSC: "ai", CTE: "au", CSV: "ei", OBJ: "eu" },
    DYN: { BSC: "ui", CTE: "iu", CSV: "oi", OBJ: "ou" }
  },
  RPS: {
    STA: { BSC: IA_U\u00C4, CTE: IE_U\u00CB, CSV: IO_\u00DC\u00C4, OBJ: I\u00D6_\u00DC\u00CB },
    DYN: { BSC: UA_I\u00C4, CTE: UE_I\u00CB, CSV: UO_\u00D6\u00C4, OBJ: U\u00D6_\u00D6\u00CB }
  },
  AMG: {
    STA: { BSC: "ao", CTE: "a\xF6", CSV: "eo", OBJ: "e\xF6" },
    DYN: { BSC: "oa", CTE: "\xF6a", CSV: "oe", OBJ: "\xF6e" }
  }
});
var CONTEXT_TO_INDEX_MAP = /* @__PURE__ */ deepFreeze({
  EXS: 0,
  FNC: 1,
  RPS: 2,
  AMG: 3
});
function slotIVToIthkuil(slot, metadata) {
  const value = metadata.affixualFormativeDegree != null ? ONE_INDEXED_STANDARD_VOWEL_TABLE[CONTEXT_TO_INDEX_MAP[slot.context]][metadata.affixualFormativeDegree] : SLOT_IV_MAP[slot.context][slot.function][slot.specification];
  if (typeof value == "string") {
    return value;
  }
  return value.withPreviousText(metadata.slotIII);
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-2/index.js
var SLOT_II_MAP = /* @__PURE__ */ deepFreeze({
  undefined: [
    ["o", "\xF6"],
    ["a", "\xE4"],
    ["e", "i"],
    ["u", "\xFC"]
  ],
  "NEG/4": [
    ["oi", "ou"],
    ["ai", "au"],
    ["ei", "eu"],
    ["ui", "iu"]
  ],
  "DCD/4": [
    [UO_\u00D6\u00C4, U\u00D6_\u00D6\u00CB],
    [IA_U\u00C4, IE_U\u00CB],
    [IO_\u00DC\u00C4, I\u00D6_\u00DC\u00CB],
    [UA_I\u00C4, UE_I\u00CB]
  ],
  "DCD/5": [
    ["oe", "\xF6e"],
    ["ao", "a\xF6"],
    ["eo", "e\xF6"],
    ["oa", "\xF6a"]
  ]
});
var SLOT_II_SHORTCUT_MAP = /* @__PURE__ */ deepFreeze({
  1: { PRC: 1, CPT: 2 },
  2: { PRC: 3, CPT: 4 },
  3: { PRC: 9, CPT: 8 },
  0: { PRC: 7, CPT: 6 }
});
function slotIIToIthkuil(slot, metadata) {
  if (Array.isArray(metadata.slotIII)) {
    return metadata.doesSlotVHaveAtLeastTwoAffixes ? slot.version == "CPT" ? "e'a" : "a'e" : slot.version == "CPT" ? "ea" : "ae";
  }
  if (typeof metadata.slotIII == "object") {
    return metadata.doesSlotVHaveAtLeastTwoAffixes ? slot.version == "CPT" ? metadata.function == "DYN" ? "o'\xEB" : "\xEBu'" : metadata.function == "DYN" ? "e'\xEB" : "\xEBi'" : slot.version == "CPT" ? metadata.function == "DYN" ? "o\xEB" : "\xEBu" : metadata.function == "DYN" ? "e\xEB" : "\xEBi";
  }
  let value = SLOT_II_MAP[`${metadata.affixShortcut}`][slot.stem][+(slot.version == "CPT")];
  if (typeof metadata.slotIII == "string" && isLegalWordInitialConsonantForm(metadata.slotIII.replace(/(.)\1/g, "$1")) && metadata.slotI == "" && value == "a" && !metadata.doesSlotVHaveAtLeastTwoAffixes) {
    return "";
  }
  if (typeof value != "string") {
    value = value.withPreviousText(metadata.slotI);
  }
  if (metadata.doesSlotVHaveAtLeastTwoAffixes) {
    value = insertGlottalStop(value, false);
  }
  return value;
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-5/index.js
function slotVToIthkuil(slot, metadata) {
  if (slot.length == 0) {
    return EMPTY;
  }
  if (metadata.isSlotVIElided) {
    return slot.map((affix, index) => affixToIthkuil(affix, {
      reversed: false,
      insertGlottalStop: index == slot.length - 1
    })).reduce((a, b) => a.add(b));
  } else {
    return slot.map((affix) => affixToIthkuil(affix, { reversed: true })).reduce((a, b) => a.add(b));
  }
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-6/index.js
function slotVIToIthkuil(slot, metadata) {
  return metadata.isSlotVFilled ? geminatedCAToIthkuil(slot) : caToIthkuil(slot);
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-7/index.js
function slotVIIToIthkuil(slot) {
  if (slot.length == 0) {
    return EMPTY;
  }
  return slot.map((affix) => affixToIthkuil(affix, { reversed: false })).reduce((a, b) => a.add(b));
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-9/illocution-and-validation.js
var ILLOCUTION_AND_VALIDATION_TO_ITHKUIL_MAP = /* @__PURE__ */ deepFreeze({
  OBS: "a",
  REC: "\xE4",
  PUP: "e",
  RPR: "i",
  USP: "\xEBi",
  IMA: "\xF6",
  CVN: "o",
  ITU: "\xFC",
  INF: "u",
  DIR: "ai",
  DEC: "au",
  IRG: "ei",
  VRF: "eu",
  ADM: "ou",
  POT: "oi",
  HOR: "iu",
  CNJ: "ui"
});
function illocutionAndValidationToIthkuil(illocutionOrValidation, elideIfPossible) {
  if (elideIfPossible && illocutionOrValidation == "OBS") {
    return "";
  }
  return ILLOCUTION_AND_VALIDATION_TO_ITHKUIL_MAP[illocutionOrValidation];
}

// node_modules/@zsnout/ithkuil/generate/formative/slot-9/illocution.js
var ALL_ILLOCUTIONS = /* @__PURE__ */ deepFreeze([
  "ASR",
  "DIR",
  "DEC",
  "IRG",
  "VRF",
  "ADM",
  "POT",
  "HOR",
  "CNJ"
]);

// node_modules/@zsnout/ithkuil/generate/formative/slot-9/validation.js
var ALL_VALIDATIONS = /* @__PURE__ */ deepFreeze([
  "OBS",
  "REC",
  "PUP",
  "RPR",
  "USP",
  "IMA",
  "CVN",
  "ITU",
  "INF"
]);

// node_modules/@zsnout/ithkuil/generate/formative/slot-9/index.js
function slotIXToIthkuil(slot, metadata) {
  if (has(ALL_ILLOCUTIONS, slot) || has(ALL_VALIDATIONS, slot)) {
    return illocutionAndValidationToIthkuil(slot, metadata.elideIfPossible);
  } else {
    return caseToIthkuil(slot, metadata.elideIfPossible, metadata.isPartOfConcatenatedFormative);
  }
}

// node_modules/@zsnout/ithkuil/generate/formative/index.js
var isArray = /* @__PURE__ */ (() => Array.isArray)();
function completeFormativeToIthkuil(formative) {
  const slot3 = typeof formative.root == "string" ? formative.root : typeof formative.root == "number" || typeof formative.root == "bigint" ? getIntegerCr(formative.root) ?? String(formative.root) : isArray(formative.root) ? referentListToPersonalReferenceRoot(formative.root) : (typeof formative.root.cs == "number" || typeof formative.root.cs == "bigint") && getIntegerCs(formative.root.cs) || "" + formative.root.cs;
  let slot4 = slotIVToIthkuil(formative, {
    slotIII: slot3,
    affixualFormativeDegree: typeof formative.root == "object" && !isArray(formative.root) ? formative.root.degree : void 0
  });
  let slot6 = slotVIToIthkuil(formative.ca, {
    isSlotVFilled: formative.slotVAffixes.length > 0
  });
  let slot1 = slotIToIthkuil({
    concatenationType: formative.type == "UNF/C" ? formative.concatenationType : "none",
    caShortcutType: "none"
  });
  let slot2 = slotIIToIthkuil(formative, {
    slotI: slot1,
    slotIII: formative.root,
    function: formative.function,
    doesSlotVHaveAtLeastTwoAffixes: formative.slotVAffixes.length >= 2
  });
  const slotVIIAffixes = formative.slotVIIAffixes.slice();
  let didVIIShortcut = false;
  if (slotVIIAffixes.length != 0 && typeof formative.root == "string" && (formative.shortcut === true || formative.shortcut === "VII" || formative.shortcut === "VII+VIII")) {
    const finalSlotVIIAffix = slotVIIAffixes.pop();
    const shortcut = finalSlotVIIAffix && "cs" in finalSlotVIIAffix && finalSlotVIIAffix.cs && finalSlotVIIAffix.type == 1 ? finalSlotVIIAffix.cs == "r" && finalSlotVIIAffix.degree == 4 ? "NEG/4" : finalSlotVIIAffix.cs == "t" ? finalSlotVIIAffix.degree == 4 ? "DCD/4" : finalSlotVIIAffix.degree == 5 ? "DCD/5" : null : null : null;
    if (shortcut) {
      const slotII = SLOT_II_MAP[shortcut][formative.stem][formative.version == "CPT" ? 1 : 0];
      slot2 = WithWYAlternative.of(slotII).withPreviousText(slot1);
      didVIIShortcut = true;
    } else if (finalSlotVIIAffix) {
      slotVIIAffixes.push(finalSlotVIIAffix);
    }
  }
  let didVIIIShortcut = false;
  if (formative.slotVAffixes.length == 0 && (formative.shortcut === true || formative.shortcut === "VIII" || formative.shortcut === "VII+VIII") && formative.vn == "MNO" && (formative.type == "UNF/K" ? formative.mood != "FAC" : formative.caseScope != "CCN") && formative.ca.affiliation == "CSL" && formative.ca.configuration == "UPX" && formative.ca.extension == "DEL" && formative.ca.perspective == "M" && formative.ca.essence == "NRM") {
    didVIIIShortcut = true;
    slot6 = formative.type == "UNF/K" ? moodToIthkuil(formative.mood, "non-aspect") : caseScopeToIthkuil(formative.caseScope, "non-aspect");
  }
  if (!didVIIShortcut && !didVIIIShortcut && (formative.shortcut === true || formative.shortcut === "IV/VI") && (typeof formative.root == "string" || Array.isArray(formative.root)) && formative.specification == "BSC" && formative.context == "EXS" && formative.function == "STA" && formative.ca.configuration == "UPX" && formative.ca.affiliation == "CSL") {
    if (Array.isArray(formative.root)) {
      if (formative.ca.essence == "NRM" && formative.ca.perspective == "M" && (formative.ca.extension == "DEL" || formative.ca.extension == "PRX")) {
        slot1 = slotIToIthkuil({
          concatenationType: formative.type == "UNF/C" ? formative.concatenationType : "none",
          caShortcutType: formative.ca.extension == "DEL" ? "w" : "y"
        });
        slot4 = "";
        slot6 = "";
      }
    } else {
      const { extension, perspective, essence } = formative.ca;
      const shortcut = essence == "RPV" ? perspective == "M" && extension == "DEL" ? 1 : perspective == "G" && extension == "DEL" ? 3 : perspective == "M" && extension == "PRX" ? 3 : null : perspective == "M" && extension == "PRX" ? 0 : extension == "DEL" ? {
        M: 0,
        G: 1,
        N: 2,
        A: 2
      }[perspective] : null;
      const shortcutType = essence == "RPV" ? perspective == "M" && extension == "DEL" ? "y" : perspective == "G" && extension == "DEL" ? "y" : perspective == "M" && extension == "PRX" ? "y" : null : perspective == "M" && extension == "PRX" ? "y" : extension == "DEL" ? {
        M: "w",
        G: "w",
        N: "w",
        A: "y"
      }[perspective] : null;
      if (shortcut != null) {
        slot1 = slotIToIthkuil({
          concatenationType: formative.type == "UNF/C" ? formative.concatenationType : "none",
          caShortcutType: shortcutType
        });
        let slotII = WithWYAlternative.of(ONE_INDEXED_STANDARD_VOWEL_TABLE[shortcut][SLOT_II_SHORTCUT_MAP[formative.stem][formative.version]]);
        if (formative.slotVAffixes.length >= 2) {
          slotII = slotII.insertGlottalStop(false);
        }
        slot2 = slotII.withPreviousText(slot1);
        slot4 = "";
        slot6 = "";
      }
    }
  }
  const slot5 = slotVToIthkuil(formative.slotVAffixes, {
    isAtEndOfWord: false,
    isSlotVIElided: slot6 == ""
  }).withPreviousText(slot3 + slot4);
  const slot7 = slotVIIToIthkuil(slotVIIAffixes).withPreviousText(slot3 + slot4 + slot5 + slot6);
  if (slot1 == "" && slot2 == "" && !isLegalWordInitialConsonantForm(slot3)) {
    slot2 = "a";
  }
  if (formative.type == "UNF/C") {
    const slot8 = didVIIIShortcut ? "" : slotVIIIToIthkuil({
      vn: formative.vn,
      cn: formative.caseScope
    }, {
      omitDefault: true
    }).withPreviousText(slot3 + slot4 + slot5 + slot6 + slot7);
    const slot9 = WithWYAlternative.of(slotIXToIthkuil(formative.case, {
      elideIfPossible: false,
      isPartOfConcatenatedFormative: formative.concatenationType != "none"
    })).withPreviousText(slot3 + slot4 + slot5 + slot6 + slot7 + slot8);
    const word = slot1 + slot2 + slot3 + slot4 + slot5 + slot6 + slot7 + slot8 + slot9;
    if (formative.concatenationType == "none") {
      return applySlotXStress(word, "UNF/C");
    }
    if (ALL_CASES.indexOf(formative.case) >= 36) {
      return applyStress(word, -1);
    } else {
      return word;
    }
  }
  if (formative.type == "UNF/K") {
    const slot8 = didVIIIShortcut ? "" : slotVIIIToIthkuil({
      vn: formative.vn,
      cn: formative.mood
    }, {
      omitDefault: true
    }).withPreviousText(slot3 + slot4 + slot5 + slot6 + slot7);
    const slot9 = WithWYAlternative.of(slotIXToIthkuil(formative.illocutionValidation, {
      elideIfPossible: false,
      isPartOfConcatenatedFormative: false
    })).withPreviousText(slot3 + slot4 + slot5 + slot6 + slot7 + slot8);
    const word = slot1 + slot2 + slot3 + slot4 + slot5 + slot6 + slot7 + slot8 + slot9;
    return applySlotXStress(word, "UNF/K");
  }
  if (formative.type == "FRM") {
    if (countVowelForms(slot1 + slot2 + slot3 + slot4 + slot5 + slot6 + slot7) < 2 && slot2 == "" && formative.vn == "MNO" && formative.caseScope == "CCN") {
      slot2 = "a";
    }
    const slot8 = didVIIIShortcut ? "" : slotVIIIToIthkuil({
      vn: formative.vn,
      cn: formative.caseScope
    }, {
      omitDefault: countVowelForms(slot1 + slot2 + slot3 + slot4 + slot5 + slot6 + slot7) >= 2
    }).withPreviousText(slot3 + slot4 + slot5 + slot6 + slot7);
    const slot9 = WithWYAlternative.of(slotIXToIthkuil(formative.case, {
      elideIfPossible: false,
      isPartOfConcatenatedFormative: false
    })).withPreviousText(slot3 + slot4 + slot5 + slot6 + slot7 + slot8);
    if (countVowelForms(slot1 + slot2 + slot3 + slot4 + slot5 + slot6 + slot7 + slot8 + slot9) < 3 && slot2 == "") {
      slot2 = "a";
    }
    const word = slot1 + slot2 + slot3 + slot4 + slot5 + slot6 + slot7 + slot8 + slot9;
    return applySlotXStress(word, "FRM");
  }
  throw new Error("Unknown formative type '" + formative?.type + "'.");
}
function formativeToIthkuil(formative) {
  return completeFormativeToIthkuil(fillInDefaultFormativeSlots(formative));
}

// node_modules/@zsnout/ithkuil/generate/index.js
function assertWordIsNotFormative(word) {
}
function wordToIthkuil(word) {
  if (typeof word == "string" || typeof word == "number" || typeof word == "bigint") {
    return adjunctToIthkuil(word);
  }
  if ("vn1" in word && typeof word.vn1 == "string") {
    return modularAdjunctToIthkuil(word);
  }
  if ("root" in word && word.root != null) {
    return formativeToIthkuil(word);
  }
  assertWordIsNotFormative(word);
  if ("type" in word) {
    if ((word.type == "CAR" || word.type == "NAM" || word.type == "PHR" || word.type == "QUO") && "case" in word && typeof word.case == "string" && !("affixes" in word && word.affixes || "case2" in word && word.case2 || "essence" in word && word.essence != "RPV" || "perspective2" in word && word.perspective2 || "referents2" in word && word.referents2 || "specification" in word && word.specification)) {
      return suppletiveAdjunctToIthkuil(word);
    }
    return referentialToIthkuil(word);
  }
  if (word.affixes && (!("referents" in word) || word.referents == null)) {
    return affixualAdjunctToIthkuil(word);
  }
  if (word.referents) {
    return referentialToIthkuil(word);
  }
  throw new Error("Invalid word.", { cause: word });
}

// node_modules/@zsnout/ithkuil/parse/transform.js
var STRESSED_TO_UNSTRESSED_VOWEL_MAP = /* @__PURE__ */ deepFreezeAndNullPrototype({
  \u00E1: "a",
  \u00E9: "e",
  \u00ED: "i",
  \u00F3: "o",
  \u00FA: "u",
  \u00E2: "\xE4",
  \u00EA: "\xEB",
  \u00F4: "\xF6",
  \u00FB: "\xFC"
});
var LETTER_SUBSTITUTIONS = /* @__PURE__ */ deepFreezeAndNullPrototype({
  "\u200B": "",
  // The previous line is keyed with the Unicode Byte Order Mark
  "\u2019": "'",
  \u02BC: "'",
  "\u2018": "'",
  a\u0301: "\xE1",
  a\u0308: "\xE4",
  a\u0302: "\xE2",
  e\u0301: "\xE9",
  e\u0308: "\xEB",
  e\u0302: "\xEA",
  \u00EC: "i",
  \u0131: "i",
  i\u0300: "i",
  i\u0301: "\xED",
  o\u0301: "\xF3",
  o\u0308: "\xF6",
  o\u0302: "\xF4",
  \u00F9: "u",
  u\u0300: "u",
  u\u0301: "\xFA",
  u\u0308: "\xFC",
  u\u0302: "\xFB",
  c\u030C: "\u010D",
  c\u0327: "\xE7",
  \u1E6D: "\u0163",
  \u0167: "\u0163",
  \u021B: "\u0163",
  t\u0327: "\u0163",
  t\u0323: "\u0163",
  \u1E0D: "\u1E11",
  \u0111: "\u1E11",
  d\u0323: "\u1E11",
  d\u0327: "\u1E11",
  \u0142: "\u013C",
  \u1E37: "\u013C",
  l\u0323: "\u013C",
  l\u0327: "\u013C",
  s\u030C: "\u0161",
  z\u030C: "\u017E",
  z\u0307: "\u017C",
  \u1E93: "\u017C",
  z\u0323: "\u017C",
  \u1E47: "\u0148",
  n\u030C: "\u0148",
  n\u0327: "\u0148",
  n\u0323: "\u0148",
  \u1E5B: "\u0159",
  r\u030C: "\u0159",
  r\u0327: "\u0159",
  "r\u0355": "\u0159",
  \u0157: "\u0159",
  r\u0323: "\u0159"
});
var LETTER_SUBSTITUTION_REGEX = (
  // The first element of this character class is the Unicode Byte Order Mark
  /[​’ʼ‘ìıùṭŧțḍđłḷẓṇṛŗ]|á|ä|â|é|ë|ê|ì|í|ó|ö|ô|ù|ú|ü|û|č|ç|ţ|ṭ|ḍ|ḑ|ḷ|ļ|š|ž|ż|ẓ|ň|ņ|ṇ|ř|ŗ|r͕|ṛ/gu
);
function transformWord(word) {
  const original = word;
  word = word.toLowerCase().replace(LETTER_SUBSTITUTION_REGEX, (x) => LETTER_SUBSTITUTIONS[x]);
  if (word.startsWith("'")) {
    word = word.slice(1);
  }
  const syllables = word.match(/[aáeéëêoóuú][ií]|[aáeéëêiíoó][uú]|[aeiouäëöüáéíóúâêôû]/g);
  let stress;
  if (syllables == null) {
    stress = "zerosyllabic";
  } else if (syllables.length == 1) {
    stress = "monosyllabic";
  } else {
    const stressed = syllables.map((syllable) => /[áéíóúâêôû]/.test(syllable));
    const index = stressed.findIndex((x) => x);
    const lastIndex = stressed.findLastIndex((x) => x);
    if (index != lastIndex) {
      throw new Error("Two syllables are marked as stressed.");
    }
    if (index == -1) {
      stress = "penultimate";
    } else {
      const value = stressed.length - index;
      if (value == 1) {
        stress = "ultimate";
      } else if (value == 2) {
        stress = "penultimate";
      } else if (value == 3) {
        stress = "antepenultimate";
      } else {
        throw new Error("Invalid stress in '" + word + "'.");
      }
    }
  }
  return Object.freeze({
    original,
    word: word.replace(/[áéíóúâêôû]/g, (x) => STRESSED_TO_UNSTRESSED_VOWEL_MAP[x]),
    stress
  });
}

// node_modules/@zsnout/ithkuil/parse/lex/builder.js
var RegexPart = class _RegexPart {
  source;
  constructor(source) {
    this.source = source;
    Object.freeze(this);
  }
  /**
   * Creates a new RegexPart matching the contents of this one in a capture
   * group.
   *
   * @returns The new RegexPart.
   */
  asGroup() {
    return new AtomicRegexPart("(" + this.source + ")");
  }
  /**
   * Creates a new RegexPart matching the contents of this one in a named
   * capture group.
   *
   * @returns The new RegexPart.
   */
  asNamedGroup(name) {
    return new AtomicRegexPart("(?<" + name + ">" + this.source + ")");
  }
  /**
   * Creates a new RegexPart that matches the same content as this one, but is
   * optional.
   *
   * @returns The new RegexPart.
   */
  optional() {
    return new _RegexPart("(?:" + this.source + ")?");
  }
  /**
   * Creates a new RegexPart that matches zero or more repetitions of this
   * pattern.
   *
   * @returns The new RegexPart.
   */
  zeroOrMore() {
    return new _RegexPart("(?:" + this.source + ")*");
  }
  /**
   * Creates a new RegexPart that matches one or more repetitions of this
   * pattern.
   *
   * @returns The new RegexPart.
   */
  oneOrMore() {
    return new _RegexPart("(?:" + this.source + ")+");
  }
  /**
   * Creates a new RegexPart that matches this part's content, but only if it
   * will match the entire source string.
   *
   * @returns The new RegexPart.
   */
  matchEntireText() {
    return new _RegexPart("^" + this.source + "$");
  }
  /**
   * Creates a new RegexPart that is a negative lookahead that prevents the
   * future text from matching the current pattern.
   *
   * @returns The new RegexPart.
   */
  not() {
    return new AtomicRegexPart("(?!" + this.source + ")");
  }
  /**
   * Creates a regular expression matching the contents of this RegexPart.
   *
   * @param flags The flags to compile with.
   * @returns A regular expression.
   */
  compile(flags = "") {
    return new RegExp(this.source, flags);
  }
  /**
   * Gets the source text of this RegexPart.
   *
   * @returns The source text of this RegexPart.
   */
  toString() {
    return this.source;
  }
};
var AtomicRegexPart = class extends RegexPart {
  /**
   * Creates a new RegexPart that matches the same content as this one, but is
   * optional.
   *
   * @returns The new RegexPart.
   */
  optional() {
    return new RegexPart(this.source + "?");
  }
  /**
   * Creates a new RegexPart that matches zero or more repetitions of this
   * pattern.
   *
   * @returns The new RegexPart.
   */
  zeroOrMore() {
    return new RegexPart(this.source + "*");
  }
  /**
   * Creates a new RegexPart that matches one or more repetitions of this
   * pattern.
   *
   * @returns The new RegexPart.
   */
  oneOrMore() {
    return new RegexPart(this.source + "+");
  }
};
var RegexPartWithAlternates = class extends RegexPart {
  /**
   * Creates a new RegexPart that matches this part's content, but only if it
   * will match the entire source string.
   *
   * @returns The new RegexPart.
   */
  matchEntireText() {
    return new RegexPart("^(?:" + this.source + ")$");
  }
};
function escapeRegex(text2) {
  return text2.replace(/[\^$\\.*+?()[\]{}|-]/g, "\\$&");
}
function text(text2) {
  text2 = escapeRegex(text2);
  if (text2.length == 1) {
    return new AtomicRegexPart(text2);
  } else {
    return new RegexPart(text2);
  }
}
function charIn(chars) {
  return new AtomicRegexPart("[" + escapeRegex(chars) + "]");
}
function any(...parts) {
  return new RegexPartWithAlternates(parts.join("|"));
}
function anyText(...texts) {
  return new RegexPartWithAlternates(texts.map((x) => escapeRegex(x)).join("|"));
}
function seq(...parts) {
  return new RegexPart(parts.map((x) => x instanceof RegexPartWithAlternates ? "(?:" + x.source + ")" : x.source).join(""));
}

// node_modules/@zsnout/ithkuil/parse/lex/forms.js
var vowel = /* @__PURE__ */ charIn("aeiou\xE4\xEB\xF6\xFC'");
var nonGlottalStopVowel = /* @__PURE__ */ charIn("aeiou\xE4\xEB\xF6\xFC");
var consonant = /* @__PURE__ */ charIn("pbtdkgfv\u0163\u1E11sz\u0161\u017E\xE7xh\u013Cc\u017C\u010Djmn\u0148rlwy\u0159_");
var standardConsonant = /* @__PURE__ */ charIn("pbtdkgfv\u0163\u1E11sz\u0161\u017E\xE7x\u013Cc\u017C\u010Djmn\u0148rl\u0159_");
var specialConsonant = /* @__PURE__ */ charIn("hwy");
var GEMINATE = /* @__PURE__ */ anyText("pp", "bb", "tt", "dd", "kk", "gg", "ff", "vv", "\u0163\u0163", "\u1E11\u1E11", "ss", "zz", "\u0161\u0161", "\u017E\u017E", "\xE7\xE7", "xx", "\u013C\u013C", "cc", "\u017C\u017C", "\u010D\u010D", "jj", "mm", "nn", "\u0148\u0148", "rr", "ll", "\u0159\u0159");
var geminate = GEMINATE.compile();
var V = /* @__PURE__ */ vowel.oneOrMore();
var VG = /* @__PURE__ */ seq(
  /* @__PURE__ */ vowel.zeroOrMore(),
  /* @__PURE__ */ text("'"),
  /* @__PURE__ */ vowel.zeroOrMore()
);
var VNG = /* @__PURE__ */ seq(
  /* @__PURE__ */ nonGlottalStopVowel.oneOrMore(),
  /* @__PURE__ */ text("'").not()
);
var C = /* @__PURE__ */ seq(
  standardConsonant,
  /* @__PURE__ */ consonant.zeroOrMore()
);
var N = /* @__PURE__ */ new RegexPart("[\\d_]*\\d[\\d_]*");
var n = /* @__PURE__ */ N.matchEntireText().compile();
var R = /* @__PURE__ */ any(C, N);
var H = /* @__PURE__ */ seq(
  specialConsonant,
  /* @__PURE__ */ consonant.zeroOrMore()
);
var CG = /* @__PURE__ */ seq(
  /* @__PURE__ */ seq(standardConsonant, consonant.zeroOrMore()).optional(),
  GEMINATE,
  /* @__PURE__ */ consonant.zeroOrMore()
);
var CNG = /* @__PURE__ */ seq(
  /* @__PURE__ */ seq(consonant.zeroOrMore(), GEMINATE).not(),
  standardConsonant,
  /* @__PURE__ */ consonant.zeroOrMore()
);
var RNG = /* @__PURE__ */ any(CNG, N);

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/bias.js
var biasAdjunct = /* @__PURE__ */ C.matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/bias.js
function buildBiasAdjunct(word) {
  const match = biasAdjunct.exec(word);
  if (!match) {
    return;
  }
  if (Object.hasOwn(BIAS_ITHKUIL_TO_ADJUNCT_MAP, match[0])) {
    return BIAS_ITHKUIL_TO_ADJUNCT_MAP[match[0]];
  }
  throw new Error("Unknown Bias: " + match[0] + ".");
}

// node_modules/@zsnout/ithkuil/parse/formative/mood-or-case-scope.js
var CN_TO_MOOD_OR_CASE_SCOPE = /* @__PURE__ */ deepFreeze({
  h: FAC_CCN,
  hl: SUB_CCA,
  hr: ASM_CCS,
  hm: SPC_CCQ,
  hn: COU_CCP,
  h\u0148: HYP_CCV
});
var CN_TO_ASPECTUAL_MOOD_OR_CASE_SCOPE = /* @__PURE__ */ deepFreeze({
  w: FAC_CCN,
  y: FAC_CCN,
  hw: SUB_CCA,
  hrw: ASM_CCS,
  hmw: SPC_CCQ,
  hnw: COU_CCP,
  h\u0148w: HYP_CCV
});
function parseMoodOrCaseScope(cn) {
  if (cn in CN_TO_MOOD_OR_CASE_SCOPE) {
    return [
      CN_TO_MOOD_OR_CASE_SCOPE[cn],
      false
    ];
  }
  if (cn in CN_TO_ASPECTUAL_MOOD_OR_CASE_SCOPE) {
    return [
      CN_TO_ASPECTUAL_MOOD_OR_CASE_SCOPE[cn],
      true
    ];
  }
  throw new Error("Invalid Cn: '" + cn + "'.");
}

// node_modules/@zsnout/ithkuil/parse/vowel-form.js
var VowelForm = class _VowelForm {
  sequence;
  degree;
  hasGlottalStop;
  static of(text2) {
    let hasGlottalStop = text2.includes("'");
    text2 = text2.replace(/'/g, "");
    if (text2[0] == text2[1]) {
      return VOWEL_FORM_TO_OBJECT_MAP[text2[0]]?.withGlottalStop(hasGlottalStop);
    }
    return VOWEL_FORM_TO_OBJECT_MAP[text2]?.withGlottalStop(hasGlottalStop);
  }
  static parseOrThrow(text2) {
    let hasGlottalStop = text2.includes("'");
    text2 = text2.replace(/'/g, "");
    if (text2[0] == text2[1]) {
      return VOWEL_FORM_TO_OBJECT_MAP[text2[0]].withGlottalStop(hasGlottalStop);
    }
    if (text2 in VOWEL_FORM_TO_OBJECT_MAP) {
      return VOWEL_FORM_TO_OBJECT_MAP[text2].withGlottalStop(hasGlottalStop);
    }
    throw new Error("Invalid vowel form: " + text2 + ".");
  }
  constructor(sequence, degree, hasGlottalStop = false) {
    this.sequence = sequence;
    this.degree = degree;
    this.hasGlottalStop = hasGlottalStop;
    Object.freeze(this);
  }
  toString(isAtEndOfWord) {
    const form = STANDARD_VOWEL_TABLE[this.sequence][this.degree];
    if (this.hasGlottalStop) {
      return insertGlottalStopIntoPossiblyWithWYAlternative(form, isAtEndOfWord);
    } else {
      return form;
    }
  }
  /**
   * Creates a new `VowelForm` identical to this one, but with a glottal stop.
   *
   * @param hasGlottalStop Whether the output `VowelForm` will include a glottal
   *   stop. Defaults to `true`.
   * @returns The new `VowelForm`.
   */
  withGlottalStop(hasGlottalStop = true) {
    return new _VowelForm(this.sequence, this.degree, hasGlottalStop);
  }
};
var VOWEL_FORM_TO_OBJECT_MAP = /* @__PURE__ */ deepFreeze({
  ae: /* @__PURE__ */ new VowelForm(1, 0),
  a: /* @__PURE__ */ new VowelForm(1, 1),
  \u00E4: /* @__PURE__ */ new VowelForm(1, 2),
  e: /* @__PURE__ */ new VowelForm(1, 3),
  i: /* @__PURE__ */ new VowelForm(1, 4),
  \u00EBi: /* @__PURE__ */ new VowelForm(1, 5),
  \u00F6: /* @__PURE__ */ new VowelForm(1, 6),
  o: /* @__PURE__ */ new VowelForm(1, 7),
  \u00FC: /* @__PURE__ */ new VowelForm(1, 8),
  u: /* @__PURE__ */ new VowelForm(1, 9),
  ea: /* @__PURE__ */ new VowelForm(2, 0),
  ai: /* @__PURE__ */ new VowelForm(2, 1),
  au: /* @__PURE__ */ new VowelForm(2, 2),
  ei: /* @__PURE__ */ new VowelForm(2, 3),
  eu: /* @__PURE__ */ new VowelForm(2, 4),
  \u00EBu: /* @__PURE__ */ new VowelForm(2, 5),
  ou: /* @__PURE__ */ new VowelForm(2, 6),
  oi: /* @__PURE__ */ new VowelForm(2, 7),
  iu: /* @__PURE__ */ new VowelForm(2, 8),
  ui: /* @__PURE__ */ new VowelForm(2, 9),
  \u00FCo: /* @__PURE__ */ new VowelForm(3, 0),
  ia: /* @__PURE__ */ new VowelForm(3, 1),
  u\u00E4: /* @__PURE__ */ new VowelForm(3, 1),
  ie: /* @__PURE__ */ new VowelForm(3, 2),
  u\u00EB: /* @__PURE__ */ new VowelForm(3, 2),
  io: /* @__PURE__ */ new VowelForm(3, 3),
  \u00FC\u00E4: /* @__PURE__ */ new VowelForm(3, 3),
  i\u00F6: /* @__PURE__ */ new VowelForm(3, 4),
  \u00FC\u00EB: /* @__PURE__ */ new VowelForm(3, 4),
  e\u00EB: /* @__PURE__ */ new VowelForm(3, 5),
  u\u00F6: /* @__PURE__ */ new VowelForm(3, 6),
  \u00F6\u00EB: /* @__PURE__ */ new VowelForm(3, 6),
  uo: /* @__PURE__ */ new VowelForm(3, 7),
  \u00F6\u00E4: /* @__PURE__ */ new VowelForm(3, 7),
  ue: /* @__PURE__ */ new VowelForm(3, 8),
  i\u00EB: /* @__PURE__ */ new VowelForm(3, 8),
  ua: /* @__PURE__ */ new VowelForm(3, 9),
  i\u00E4: /* @__PURE__ */ new VowelForm(3, 9),
  \u00FC\u00F6: /* @__PURE__ */ new VowelForm(4, 0),
  ao: /* @__PURE__ */ new VowelForm(4, 1),
  a\u00F6: /* @__PURE__ */ new VowelForm(4, 2),
  eo: /* @__PURE__ */ new VowelForm(4, 3),
  e\u00F6: /* @__PURE__ */ new VowelForm(4, 4),
  o\u00EB: /* @__PURE__ */ new VowelForm(4, 5),
  \u00F6e: /* @__PURE__ */ new VowelForm(4, 6),
  oe: /* @__PURE__ */ new VowelForm(4, 7),
  \u00F6a: /* @__PURE__ */ new VowelForm(4, 8),
  oa: /* @__PURE__ */ new VowelForm(4, 9)
});

// node_modules/@zsnout/ithkuil/parse/formative/vn.js
var NON_ASPECTUAL_VNS = [
  void 0,
  ALL_VALENCES,
  ALL_PHASES,
  ALL_EFFECTS,
  ALL_LEVELS
];
function parseNonAspectualVn(vn) {
  if (vn.degree == 0) {
    throw new Error("Invalid Vn form: '" + vn + "'.");
  }
  return NON_ASPECTUAL_VNS[vn.sequence][vn.degree - 1];
}
function parseAspect(vn) {
  if (vn.degree == 0) {
    throw new Error("Invalid Vn form: '" + vn + "'.");
  }
  return ALL_ASPECTS[(vn.sequence - 1) * 9 + (vn.degree - 1)];
}

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/modular.js
var modularAdjunct = /* @__PURE__ */ seq(
  /* @__PURE__ */ anyText("w", "y").asGroup().optional(),
  /* @__PURE__ */ seq(
    /* @__PURE__ */ V.asGroup(),
    /* @__PURE__ */ H.asGroup(),
    /* @__PURE__ */ seq(
      /* @__PURE__ */ V.asGroup(),
      /* @__PURE__ */ anyText("n", "\u0148").asGroup()
    ).optional()
  ).optional(),
  /* @__PURE__ */ V.asGroup()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/modular.js
var VH_TO_SCOPE = {
  a: "CASE/MOOD+ILL/VAL",
  e: "CASE/MOOD",
  i: "FORMATIVE",
  u: "FORMATIVE",
  o: "ADJACENT"
};
function buildModularAdjunct(word, stress) {
  const match = modularAdjunct.exec(word);
  if (!match) {
    return;
  }
  const type = match[1] == "w" ? "PARENT" : match[1] == "y" ? "CONCAT" : void 0;
  if (!(match[2] || match[4])) {
    return {
      type,
      vn1: parseAspect(VowelForm.parseOrThrow(match[6]))
    };
  }
  const [cn, isVnAspectual] = parseMoodOrCaseScope(match[3]);
  const vn1 = isVnAspectual ? parseAspect(VowelForm.parseOrThrow(match[2])) : parseNonAspectualVn(VowelForm.parseOrThrow(match[2]));
  let vn2;
  if (match[4]) {
    vn2 = match[5] == "n" ? parseAspect(VowelForm.parseOrThrow(match[4])) : parseNonAspectualVn(VowelForm.parseOrThrow(match[4]));
  }
  let scope;
  if (stress == "ultimate") {
    scope = VH_TO_SCOPE[match[6]];
    if (scope == null) {
      throw new Error("Invalid Vh slot: " + match[6] + ".");
    }
    if (vn2) {
      return {
        type,
        vn1,
        cn,
        vn2,
        scope
      };
    }
    return {
      type,
      vn1,
      cn,
      scope
    };
  }
  if (vn2) {
    return {
      type,
      vn1,
      cn,
      vn2,
      vn3: parseNonAspectualVn(VowelForm.parseOrThrow(match[6]))
    };
  }
  return {
    type,
    vn1,
    cn,
    vn3: parseNonAspectualVn(VowelForm.parseOrThrow(match[6]))
  };
}

// node_modules/@zsnout/ithkuil/parse/formative/ca.js
function makeCaForms() {
  const ALL_CA_FORMS = /* @__PURE__ */ new Map();
  const ALL_GEMINATED_CA_FORMS = /* @__PURE__ */ new Map();
  for (const affiliation of ALL_AFFILIATIONS) {
    for (const configuration of ALL_CONFIGURATIONS) {
      for (const extension of ALL_EXTENSIONS) {
        for (const perspective of ALL_PERSPECTIVES) {
          for (const essence of ALL_ESSENCES) {
            const ca = {};
            if (affiliation != "CSL")
              ca.affiliation = affiliation;
            if (configuration != "UPX")
              ca.configuration = configuration;
            if (extension != "DEL")
              ca.extension = extension;
            if (perspective != "M")
              ca.perspective = perspective;
            if (essence != "NRM")
              ca.essence = essence;
            ALL_CA_FORMS.set(caToIthkuil(ca), ca);
            ALL_GEMINATED_CA_FORMS.set(geminatedCAToIthkuil(ca), ca);
          }
        }
      }
    }
  }
  return [ALL_CA_FORMS, ALL_GEMINATED_CA_FORMS];
}
var CA_FORMS = /* @__PURE__ */ makeCaForms();
function parseCa(ca) {
  const form = CA_FORMS[0].get(ca);
  if (form != null) {
    return form;
  }
  console.error(new Error().stack);
  throw new Error("Invalid Ca form: " + form + ".");
}
function parseGeminatedCa(ca) {
  const form = CA_FORMS[1].get(ca);
  if (form != null) {
    return form;
  }
  throw new Error("Invalid geminated Ca form: " + form + ".");
}

// node_modules/@zsnout/ithkuil/parse/formative/case.js
function parseCase(vc, isCaseOver36 = vc.hasGlottalStop) {
  const _case = ALL_CASES_SKIPPING_DEGREE_8[36 * +isCaseOver36 + 9 * (vc.sequence - 1) + vc.degree - 1];
  if (_case != null) {
    return _case;
  }
  throw new Error("Invalid Vc form: " + vc + " (" + vc.sequence + ":" + vc.degree + ":" + isCaseOver36 + ").");
}

// node_modules/@zsnout/ithkuil/parse/formative/affix.js
var INVALID_AFFIX_CS_FORMS = /* @__PURE__ */ deepFreeze([
  "w",
  "y",
  "\xE7",
  "\u013C",
  "\u013Cw",
  "\u013Cy"
]);
function parseAffix(vx, cs, isAlone) {
  if (cs[0] == "h" || cs[0] == "w" || cs[0] == "y") {
    throw new Error("Invalid Cs form: '" + cs + "'.");
  }
  if (vx.sequence == 4 && vx.degree == 0) {
    return { ca: parseCa(cs) };
  }
  if (/^[szčšžjl][wy]$/.test(cs)) {
    if (cs[0] == "l") {
      return {
        case: parseCase(vx, cs[1] == "y")
      };
    }
    return {
      case: parseCase(vx, cs[1] == "y"),
      isInverse: "\u0161\u017Ej".includes(cs[0]),
      type: cs[0] == "s" || cs[0] == "\u0161" ? 1 : cs[0] == "z" || cs[0] == "\u017E" ? 2 : 3
    };
  }
  if (vx.sequence == 4) {
    const [referents, perspective] = parseReferentListAndPerspective(cs, true);
    return {
      referents,
      perspective,
      case: ALL_CASES[vx.degree - 1]
    };
  }
  if (vx.sequence == 3) {
    if (isAlone) {
      const [referents, perspective] = parseReferentListAndPerspective(cs, true);
      return {
        referents,
        perspective,
        case: ALL_CASES[8 + vx.degree]
      };
    } else {
      if (INVALID_AFFIX_CS_FORMS.includes(cs)) {
        throw new Error("Invalid Cs form: '" + cs + "'.");
      }
      return {
        type: 3,
        degree: vx.degree,
        cs: n.test(cs) ? BigInt(cs.replaceAll(/_/g, "")) : cs
      };
    }
  } else {
    if (INVALID_AFFIX_CS_FORMS.includes(cs)) {
      throw new Error("Invalid Cs form: '" + cs + "'.");
    }
    return {
      type: vx.sequence,
      degree: vx.degree,
      cs: n.test(cs) ? BigInt(cs.replaceAll(/_/g, "")) : cs
    };
  }
}

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/multiple-affix.js
var multipleAffixAffixualAdjunct = /* @__PURE__ */ seq(
  /* @__PURE__ */ text("\xEB").optional(),
  /* @__PURE__ */ R.asGroup(),
  /* @__PURE__ */ any(
    /* @__PURE__ */ seq(
      /* @__PURE__ */ VG.asGroup(),
      /* @__PURE__ */ anyText("h", "hl", "hr", "hw").asGroup()
    ),
    /* @__PURE__ */ seq(
      /* @__PURE__ */ VNG.asGroup(),
      /* @__PURE__ */ anyText("h", "hw").asGroup()
    )
  ),
  /* @__PURE__ */ seq(V, R).oneOrMore().asGroup(),
  /* @__PURE__ */ anyText("a", "u", "e", "i", "o", "\xF6", "ai").asGroup().optional()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/multiple-affix.js
var AFFIX_REGEX = /([aeiouäëöü']+)([^aeiouäëöü']+)/g;
function parseAffixes(text2) {
  if (text2 == "") {
    return [];
  }
  const output = [];
  let match;
  while (match = AFFIX_REGEX.exec(text2)) {
    output.push(parseAffix(VowelForm.parseOrThrow(match[1]), match[2], false));
  }
  return output;
}
var CZ_TO_SCOPE_MAP = {
  h: "V:DOM",
  "'h": "V:SUB",
  "'hl": "VII:DOM",
  "'hr": "VII:SUB",
  hw: "FORMATIVE",
  "'hw": "ADJACENT"
};
var VZ_TO_SCOPE_MAP = {
  undefined: void 0,
  a: "V:DOM",
  u: "V:SUB",
  e: "VII:DOM",
  i: "VII:SUB",
  o: "FORMATIVE",
  \u00F6: "ADJACENT",
  ai: void 0
};
function buildMultipleAffixAffixualAdjunct(word, stress) {
  const match = multipleAffixAffixualAdjunct.exec(word);
  if (!match) {
    return;
  }
  const vx = VowelForm.parseOrThrow(match[2] || match[4]);
  let cz;
  if (match[2]) {
    cz = "'" + match[3];
  } else {
    cz = match[5];
  }
  const affixes2 = parseAffixes(match[6]);
  affixes2.unshift(parseAffix(vx, match[1], false));
  return {
    affixes: affixes2,
    scope: CZ_TO_SCOPE_MAP[cz],
    scope2: VZ_TO_SCOPE_MAP[match[7]],
    appliesToConcatenatedStemOnly: stress == "ultimate"
  };
}

// node_modules/@zsnout/ithkuil/parse/adjunct/numeric.js
function buildNumericAdjunct(word) {
  const match = n.exec(word);
  if (!match) {
    return;
  }
  return BigInt(match[0]);
}

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/parsing.js
var parsingAdjunct = /* @__PURE__ */ seq(charIn("aeou"), text("'")).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/parsing.js
function buildParsingAdjunct(word) {
  const match = parsingAdjunct.exec(word);
  if (!match) {
    return;
  }
  return {
    "a'": "monosyllabic",
    "e'": "ultimate",
    "o'": "penultimate",
    "u'": "antepenultimate"
  }[match[0]];
}

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/register.js
var registerAdjunct = /* @__PURE__ */ seq(
  /* @__PURE__ */ text("h"),
  /* @__PURE__ */ V.asGroup()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/register.js
function buildRegisterAdjunct(word) {
  const match = registerAdjunct.exec(word);
  if (!match) {
    return;
  }
  if (Object.hasOwn(SINGLE_REGISTER_ITHKUIL_TO_ADJUNCT_MAP, match[0])) {
    return SINGLE_REGISTER_ITHKUIL_TO_ADJUNCT_MAP[match[0]];
  }
  throw new Error("Unknown Register: " + match[0] + ".");
}

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/single-affix.js
var singleAffixAffixualAdjunct = /* @__PURE__ */ seq(
  /* @__PURE__ */ V.asGroup(),
  /* @__PURE__ */ R.asGroup(),
  /* @__PURE__ */ anyText("a", "u", "e", "i", "o", "\xF6").asGroup().optional()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/single-affix.js
var VS_TO_SCOPE_MAP = {
  undefined: void 0,
  a: "V:DOM",
  u: "V:SUB",
  e: "VII:DOM",
  i: "VII:SUB",
  o: "FORMATIVE",
  \u00F6: "ADJACENT"
};
function buildSingleAffixAffixualAdjunct(word, stress) {
  const match = singleAffixAffixualAdjunct.exec(word);
  if (!match) {
    return;
  }
  return {
    affixes: [parseAffix(VowelForm.parseOrThrow(match[1]), match[2], false)],
    scope: VS_TO_SCOPE_MAP[match[3]],
    appliesToConcatenatedStemOnly: stress == "ultimate"
  };
}

// node_modules/@zsnout/ithkuil/parse/lex/adjunct/suppletive.js
var suppletiveAdjunct = /* @__PURE__ */ seq(
  /* @__PURE__ */ anyText("hl", "hm", "hn", "h\u0148").asGroup(),
  /* @__PURE__ */ V.asGroup()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/adjunct/suppletive.js
var CP_TO_SUPPLETIVE_ADJUNCT = {
  hl: "CAR",
  hm: "QUO",
  hn: "NAM",
  h\u0148: "PHR"
};
function buildSuppletiveAdjunct(word) {
  const match = suppletiveAdjunct.exec(word);
  if (!match) {
    return;
  }
  return {
    type: CP_TO_SUPPLETIVE_ADJUNCT[match[1]],
    case: parseCase(VowelForm.parseOrThrow(match[2]))
  };
}

// node_modules/@zsnout/ithkuil/parse/adjunct/index.js
function parseAdjunct(text2) {
  const { word, stress } = transformWord(text2);
  return buildBiasAdjunct(word) ?? buildNumericAdjunct(word) ?? buildParsingAdjunct(word) ?? buildRegisterAdjunct(word) ?? buildSuppletiveAdjunct(word) ?? buildModularAdjunct(word, stress) ?? buildSingleAffixAffixualAdjunct(word, stress) ?? buildMultipleAffixAffixualAdjunct(word, stress);
}

// node_modules/@zsnout/ithkuil/parse/lex/formative/a+ca-shortcut.js
var ccShortcut = /* @__PURE__ */ anyText("w", "y", "hl", "hr", "hm", "hn");
var shortcutFormative = /* @__PURE__ */ seq(
  // Slot I: Cc
  /* @__PURE__ */ ccShortcut.asGroup(),
  // Slot II: Vv
  /* @__PURE__ */ V.asGroup(),
  // Slot III: Cr
  /* @__PURE__ */ R.asGroup(),
  // Slot V: (VxCs...')
  /* @__PURE__ */ seq(/* @__PURE__ */ seq(VNG, R).zeroOrMore(), VG, R).asGroup().optional(),
  // Slot VII: (VxCs...)
  /* @__PURE__ */ seq(V, R).zeroOrMore().asGroup(),
  // Slot VIII: (VnCn)
  /* @__PURE__ */ seq(
    /* @__PURE__ */ V.asGroup(),
    /* @__PURE__ */ H.asGroup()
  ).optional(),
  // Slot IX: (Vc/Vf/Vk)
  /* @__PURE__ */ V.asGroup().optional()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/lex/formative/cn-shortcut.js
var ccNoShortcut = /* @__PURE__ */ anyText("hw", "h");
var cnShortcutFormative = /* @__PURE__ */ seq(
  /* @__PURE__ */ seq(
    // Slot I: Cc
    /* @__PURE__ */ ccNoShortcut.asGroup().optional(),
    // Slot II: Vv
    /* @__PURE__ */ V.asGroup()
  ).optional(),
  // Slot III: Cr
  /* @__PURE__ */ R.asGroup(),
  // Slot IV: Vr
  /* @__PURE__ */ V.asGroup(),
  // Slot VI: Cn
  /* @__PURE__ */ anyText("hl", "hr", "hm", "hn", "h\u0148").asGroup(),
  // Slot VII: (VxCs...)
  /* @__PURE__ */ seq(V, R).zeroOrMore().asGroup(),
  // Slot IX: (Vc/Vf/Vk)
  /* @__PURE__ */ V.asGroup().optional()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/lex/formative/default.js
var ccNoShortcut2 = /* @__PURE__ */ anyText("hw", "h");
var combinationReferentialSpecification = /* @__PURE__ */ anyText("xx", "xt", "xp", "x");
var nonShortcutFormative = /* @__PURE__ */ seq(
  seq(
    // Slot I: Cc
    ccNoShortcut2.asGroup().optional(),
    // Slot II: Vv
    V.asGroup()
  ).optional(),
  // Slot III: Cr
  R.asGroup(),
  // Slot IV: Vr
  V.asGroup(),
  any(
    seq(
      // Slot V: (CsVx...)
      seq(RNG, V).oneOrMore().asGroup(),
      // Prevent combination referentials from matching
      combinationReferentialSpecification.not(),
      // Slot VI: geminated Ca
      CG.asGroup()
    ),
    // Prevent combination referentials from matching
    combinationReferentialSpecification.not(),
    // Slot VI: ungeminated Ca
    CNG.asGroup()
  ),
  // Slot VII: (VxCs...)
  seq(V, RNG).zeroOrMore().asGroup(),
  // Slot VIII: (VnCn)
  seq(V.asGroup(), H.asGroup()).optional(),
  // Slot IX: (Vc/Vf/Vk)
  V.asGroup().optional()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/referential/referent-list.js
var ALL_REFERENTS_REVERSED = /* @__PURE__ */ ALL_REFERENTS.slice().reverse();
var PERSPECTIVES = [
  ["\u013C", "G"],
  ["t\u013C", "G"],
  ["\xE7", "N"],
  ["x", "N"],
  ["w", "A"],
  ["y", "A"]
];
function parseReferentList(list) {
  const output = [];
  outer: while (list.length) {
    for (const referent of ALL_REFERENTS_REVERSED) {
      const value = REFERENT_TO_ITHKUIL_MAP.false[referent];
      if (list.startsWith(value)) {
        output.push(referent);
        list = list.slice(value.length);
        continue outer;
      }
    }
    throw new Error("Invalid referent: " + list + ".");
  }
  if (output.length == 0) {
    throw new Error("Invalid referent: " + list + ".");
  }
  return output;
}
function parseReferentListAndPerspective(list, isReferentialAffix) {
  let perspective;
  for (const [value, persp] of PERSPECTIVES) {
    if (isReferentialAffix && persp == "A") {
      continue;
    }
    if (list.startsWith(value)) {
      list = list.slice(value.length);
      perspective = persp;
      break;
    }
    if (list.endsWith(value)) {
      list = list.slice(0, -value.length);
      perspective = persp;
      break;
    }
  }
  const output = [];
  outer: while (list.length) {
    for (const referent of ALL_REFERENTS_REVERSED) {
      const value = REFERENT_TO_ITHKUIL_MAP[`${isReferentialAffix}`][referent];
      if (list.startsWith(value)) {
        output.push(referent);
        list = list.slice(value.length);
        continue outer;
      }
    }
    throw new Error("Invalid referent: " + list + ".");
  }
  if (output.length == 0) {
    throw new Error("Invalid referent: " + list + ".");
  }
  return [output, perspective];
}

// node_modules/@zsnout/ithkuil/parse/formative/case-scope.js
var CN_TO_CASE_SCOPE = /* @__PURE__ */ deepFreezeAndNullPrototype({
  h: "CCN",
  hl: "CCA",
  hr: "CCS",
  hm: "CCQ",
  hn: "CCP",
  h\u0148: "CCV"
});
var CN_TO_ASPECTUAL_CASE_SCOPE = /* @__PURE__ */ deepFreezeAndNullPrototype({
  w: "CCN",
  y: "CCN",
  hw: "CCA",
  hrw: "CCS",
  hmw: "CCQ",
  hnw: "CCP",
  h\u0148w: "CCV"
});
function parseCaseScope(cn) {
  if (cn in CN_TO_CASE_SCOPE) {
    return [CN_TO_CASE_SCOPE[cn], false];
  }
  if (cn in CN_TO_ASPECTUAL_CASE_SCOPE) {
    return [
      CN_TO_ASPECTUAL_CASE_SCOPE[cn],
      true
    ];
  }
  throw new Error("Invalid Cn: '" + cn + "'.");
}

// node_modules/@zsnout/ithkuil/parse/formative/illocution-validation.js
var ILLOCUTIONS = [
  ,
  "DIR",
  "DEC",
  "IRG",
  "VRF",
  ,
  "ADM",
  "POT",
  "HOR",
  "CNJ"
];
function parseIllocutionValidation(vk) {
  if (vk.sequence == 1) {
    const validation = ALL_VALIDATIONS[vk.degree - 1];
    if (validation != null) {
      return validation;
    }
  }
  if (vk.sequence == 2) {
    const illocution = ILLOCUTIONS[vk.degree];
    if (illocution != null) {
      return illocution;
    }
  }
  throw new Error("Invalid Vk slot: " + vk + ".");
}

// node_modules/@zsnout/ithkuil/parse/formative/mood.js
var CN_TO_MOOD = /* @__PURE__ */ deepFreezeAndNullPrototype({
  h: "FAC",
  hl: "SUB",
  hr: "ASM",
  hm: "SPC",
  hn: "COU",
  h\u0148: "HYP"
});
var CN_TO_ASPECTUAL_MOOD = /* @__PURE__ */ deepFreezeAndNullPrototype({
  w: "FAC",
  y: "FAC",
  hw: "SUB",
  hrw: "ASM",
  hmw: "SPC",
  hnw: "COU",
  h\u0148w: "HYP"
});
function parseMood(cn) {
  if (cn in CN_TO_MOOD) {
    return [CN_TO_MOOD[cn], false];
  }
  if (cn in CN_TO_ASPECTUAL_MOOD) {
    return [CN_TO_ASPECTUAL_MOOD[cn], true];
  }
  throw new Error("Invalid Cn: '" + cn + "'.");
}

// node_modules/@zsnout/ithkuil/parse/formative/formative.js
var VV_TO_STEM = [void 0, 1, 1, 2, 2, void 0, 0, 0, 3, 3];
var VV_TO_VERSION = [
  void 0,
  "PRC",
  "CPT",
  "PRC",
  "CPT",
  void 0,
  "CPT",
  "PRC",
  "CPT",
  "PRC"
];
var VV_TO_CA_SHORTCUT = {
  w: [
    void 0,
    {},
    { perspective: "G" },
    { perspective: "N" },
    { perspective: "G", essence: "RPV" }
  ],
  y: [
    void 0,
    { extension: "PRX" },
    { essence: "RPV" },
    { perspective: "A" },
    { extension: "PRX", essence: "RPV" }
  ]
};
var VV_TO_VII_SHORTCUT = [
  void 0,
  void 0,
  { cs: "r", type: 1, degree: 4 },
  { cs: "t", type: 1, degree: 4 },
  { cs: "t", type: 1, degree: 5 }
];
var VR_SEQUENCE_TO_CONTEXT = [void 0, "EXS", "FNC", "RPS", "AMG"];
var VR_TO_SPECIFICATION = [
  void 0,
  "BSC",
  "CTE",
  "CSV",
  "OBJ",
  void 0,
  "OBJ",
  "CSV",
  "CTE",
  "BSC"
];
var AFFIX_REGEX2 = /([aeiouäëöü']+)([^aeiouäëöü']+)/g;
function parseAffixes2(text2) {
  if (text2 == "") {
    return [];
  }
  const output = [];
  let match;
  while (match = AFFIX_REGEX2.exec(text2)) {
    output.push(parseAffix(VowelForm.parseOrThrow(match[1]), match[2], output.length == 0 && AFFIX_REGEX2.lastIndex == text2.length));
  }
  return output;
}
var REVERSED_AFFIX_REGEX = /([^aeiouäëöü']+)([aeiouäëöü']+)/g;
function parseReversedAffixes(text2) {
  if (text2 == "") {
    return [];
  }
  const output = [];
  let match;
  while (match = REVERSED_AFFIX_REGEX.exec(text2)) {
    output.push(parseAffix(VowelForm.parseOrThrow(match[2]), match[1], output.length == 0 && AFFIX_REGEX2.lastIndex == text2.length));
  }
  return output;
}
function buildNonShortcutFormative(word, stress) {
  const match = nonShortcutFormative.exec(word);
  if (!match) {
    return;
  }
  const concatenationType = match[1] == "h" ? 1 : match[1] == "hw" ? 2 : void 0;
  const type = concatenationType ? "UNF/C" : stress == "ultimate" || stress == "monosyllabic" ? "UNF/K" : stress == "antepenultimate" ? "FRM" : "UNF/C";
  const vv = match[2] ? VowelForm.of(match[2]) : void 0;
  if (match[2] && vv == null) {
    throw new Error("Invalid Vv slot: " + match[2] + ".");
  }
  let root;
  let affixShortcut;
  const vr = VowelForm.of(match[4]);
  if (vr == null) {
    throw new Error("Invalid Vr slot: " + match[4] + ".");
  }
  if (vv?.degree == 5) {
    root = {
      cs: n.test(match[3]) ? BigInt(match[3].replace(/_/g, "")) : match[3],
      degree: vr.degree
    };
  } else if (vv?.degree == 0 && (vv.sequence == 1 || vv.sequence == 2)) {
    root = parseReferentList(match[3]);
  } else if (vv?.degree == 0) {
    throw new Error("Invalid Vv slot: " + vv + ".");
  } else if (n.test(match[3])) {
    root = BigInt(match[3].replace(/_/g, ""));
  } else {
    root = match[3];
    if (vv) {
      affixShortcut = VV_TO_VII_SHORTCUT[vv.sequence];
    }
  }
  const vn_ = match[9];
  const cn = match[10];
  let mood, caseScope, vn;
  if (cn && vn_) {
    let isAspectual = false;
    if (type == "UNF/K") {
      ;
      [mood, isAspectual] = parseMood(cn);
    } else {
      ;
      [caseScope, isAspectual] = parseCaseScope(cn);
    }
    const form = VowelForm.of(vn_);
    if (form == null) {
      throw new Error("Invalid Vn form: " + form + ".");
    }
    if (isAspectual) {
      vn = parseAspect(form);
    } else {
      vn = parseNonAspectualVn(form);
    }
  }
  let slotVIIAffixes = match[8] ? parseAffixes2(match[8]) : void 0;
  if (affixShortcut) {
    if (slotVIIAffixes) {
      slotVIIAffixes.push(affixShortcut);
    } else {
      slotVIIAffixes = [affixShortcut];
    }
  }
  return {
    type,
    concatenationType,
    shortcut: affixShortcut ? "VII" : false,
    stem: typeof root == "object" ? void 0 : vv ? VV_TO_STEM[vv.degree] : 1,
    version: vv ? Array.isArray(root) ? vv.sequence == 1 ? "PRC" : "CPT" : typeof root == "object" ? vv.sequence == 1 || vv.sequence == 3 ? "PRC" : "CPT" : VV_TO_VERSION[vv.degree] : void 0,
    root,
    context: VR_SEQUENCE_TO_CONTEXT[vr.sequence],
    specification: root.cs ? void 0 : VR_TO_SPECIFICATION[vr.degree],
    function: root.cs ? vv ? vv.sequence <= 2 ? "STA" : "DYN" : void 0 : vr.degree < 5 ? "STA" : "DYN",
    slotVAffixes: match[5] ? parseReversedAffixes(match[5]) : [],
    ca: match[6] ? parseGeminatedCa(match[6]) : parseCa(match[7]),
    slotVIIAffixes,
    mood,
    caseScope,
    vn,
    case: type == "UNF/K" ? void 0 : parseCase(match[11] ? VowelForm.parseOrThrow(match[11]) : VOWEL_FORM_TO_OBJECT_MAP.a, concatenationType ? stress == "ultimate" : match[11]?.includes("'") || match[5]?.includes("'") || match[8]?.includes("'") || vn_?.includes("'") || vr.hasGlottalStop),
    illocutionValidation: type != "UNF/K" ? void 0 : match[11] ? parseIllocutionValidation(VowelForm.parseOrThrow(match[11])) : void 0
  };
}
function buildCnShortcutFormative(word, stress) {
  const match = cnShortcutFormative.exec(word);
  if (!match) {
    return;
  }
  const concatenationType = match[1] == "h" ? 1 : match[1] == "hw" ? 2 : void 0;
  const type = concatenationType ? "UNF/C" : stress == "ultimate" || stress == "monosyllabic" ? "UNF/K" : stress == "antepenultimate" ? "FRM" : "UNF/C";
  const vv = match[2] ? VowelForm.of(match[2]) : void 0;
  if (match[2] && vv == null) {
    throw new Error("Invalid Vv slot: " + match[2] + ".");
  }
  let root;
  let affixShortcut;
  const vr = VowelForm.of(match[4]);
  if (vr == null) {
    throw new Error("Invalid Vr slot: " + match[4] + ".");
  }
  if (vv?.degree == 5) {
    root = {
      cs: match[3],
      degree: vr.degree
    };
  } else if (vv?.degree == 0 && (vv.sequence == 1 || vv.sequence == 2)) {
    root = parseReferentList(match[3]);
  } else if (vv?.degree == 0) {
    throw new Error("Invalid Vv slot: " + vv + ".");
  } else if (n.test(match[3])) {
    root = BigInt(match[3].replace(/_/g, ""));
  } else {
    root = match[3];
    if (vv) {
      affixShortcut = VV_TO_VII_SHORTCUT[vv.sequence];
    }
  }
  const cn = match[5];
  const mood = type == "UNF/K" ? parseMood(cn)[0] : void 0;
  const caseScope = type != "UNF/K" ? parseCaseScope(cn)[0] : void 0;
  let slotVIIAffixes = match[6] ? parseAffixes2(match[6]) : void 0;
  if (affixShortcut) {
    if (slotVIIAffixes) {
      slotVIIAffixes.push(affixShortcut);
    } else {
      slotVIIAffixes = [affixShortcut];
    }
  }
  return {
    type,
    concatenationType,
    shortcut: affixShortcut ? "VII+VIII" : "VIII",
    stem: typeof root == "object" ? void 0 : vv ? VV_TO_STEM[vv.degree] : void 0,
    version: vv ? Array.isArray(root) ? vv.sequence == 1 ? "PRC" : "CPT" : typeof root == "object" ? vv.sequence == 1 || vv.sequence == 3 ? "PRC" : "CPT" : VV_TO_VERSION[vv.degree] : void 0,
    root,
    context: VR_SEQUENCE_TO_CONTEXT[vr.sequence],
    specification: root.cs ? void 0 : VR_TO_SPECIFICATION[vr.degree],
    function: root.cs ? vv.sequence <= 2 ? "STA" : "DYN" : vr.degree < 5 ? "STA" : "DYN",
    slotVIIAffixes,
    mood,
    caseScope,
    case: type == "UNF/K" ? void 0 : parseCase(match[7] ? VowelForm.parseOrThrow(match[7]) : VOWEL_FORM_TO_OBJECT_MAP.a, concatenationType ? stress == "ultimate" : match[7]?.includes("'") || match[6]?.includes("'") || vr.hasGlottalStop),
    illocutionValidation: type != "UNF/K" ? void 0 : match[7] ? parseIllocutionValidation(VowelForm.parseOrThrow(match[7])) : void 0
  };
}
function buildShortcutFormative(word, stress) {
  const match = shortcutFormative.exec(word);
  if (!match) {
    return;
  }
  const concatenationType = match[1] == "hl" || match[1] == "hm" ? 1 : match[1] == "hr" || match[1] == "hn" ? 2 : void 0;
  const shortcutType = match[1] == "w" || match[1] == "hl" || match[1] == "hr" ? "w" : "y";
  const type = concatenationType ? "UNF/C" : stress == "ultimate" || stress == "monosyllabic" ? "UNF/K" : stress == "antepenultimate" ? "FRM" : "UNF/C";
  const vv = VowelForm.of(match[2]);
  if (vv == null || vv.degree == 5 || vv.degree == 0 && (vv.sequence == 3 || vv.sequence == 4)) {
    throw new Error("Invalid Vv slot: " + match[2] + ".");
  }
  let root;
  if (vv.degree == 0) {
    root = parseReferentList(match[3]);
  } else if (n.test(match[3])) {
    root = BigInt(match[3]);
  } else {
    root = match[3];
  }
  const vn_ = match[6];
  const cn = match[7];
  let mood, caseScope, vn;
  if (cn && vn_) {
    let isAspectual = false;
    if (type == "UNF/K") {
      ;
      [mood, isAspectual] = parseMood(cn);
    } else {
      ;
      [caseScope, isAspectual] = parseCaseScope(cn);
    }
    const form = VowelForm.of(vn_);
    if (form == null) {
      throw new Error("Invalid Vn form: " + form + ".");
    }
    if (isAspectual) {
      vn = parseAspect(form);
    } else {
      vn = parseNonAspectualVn(form);
    }
  }
  const slotVIIAffixes = match[5] ? parseAffixes2(match[5]) : void 0;
  return {
    type,
    concatenationType,
    shortcut: "IV/VI",
    stem: Array.isArray(root) ? void 0 : VV_TO_STEM[vv.degree],
    version: Array.isArray(root) ? vv.sequence == 1 ? "PRC" : "CPT" : VV_TO_VERSION[vv.degree],
    root,
    slotVAffixes: match[4] ? parseAffixes2(match[4]) : [],
    ca: {
      ...VV_TO_CA_SHORTCUT[shortcutType][Array.isArray(root) ? 1 : vv.sequence]
    },
    slotVIIAffixes,
    mood,
    caseScope,
    vn,
    case: type == "UNF/K" ? void 0 : parseCase(match[8] ? VowelForm.parseOrThrow(match[8]) : VOWEL_FORM_TO_OBJECT_MAP.a, concatenationType ? stress == "ultimate" : match[8]?.includes("'")),
    illocutionValidation: type != "UNF/K" ? void 0 : match[8] ? parseIllocutionValidation(VowelForm.parseOrThrow(match[8])) : void 0
  };
}

// node_modules/@zsnout/ithkuil/parse/formative/index.js
var SHORTCUT_REGEX = /^(?:w|y|hl|hr|hm|hn)/;
function parseFormative(text2) {
  const { word, stress } = transformWord(text2);
  return SHORTCUT_REGEX.test(word) ? buildShortcutFormative(word, stress) : buildCnShortcutFormative(word, stress) || buildNonShortcutFormative(word, stress);
}

// node_modules/@zsnout/ithkuil/parse/lex/referential/combination.js
var combinationReferential = /* @__PURE__ */ seq(
  any(seq(text("a"), anyText("hl", "hm", "hn", "h\u0148").asGroup()), seq(
    text("\xEB").optional(),
    // Slot I: C1
    C.asGroup()
  )),
  // Slot II: Vc
  V.asGroup(),
  // Slot III: x/xt/xp/xx
  anyText("xx", "xp", "xt", "x").asGroup(),
  // Slot IV: VxCs...
  seq(V, RNG).zeroOrMore().asGroup(),
  // Slot V: Vc2
  V.optional().asGroup()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/referential/combination.js
var AFFIX_REGEX3 = /([aeiouäëöü']+)([^aeiouäëöü']+)/g;
function parseAffixes3(text2) {
  if (text2 == "") {
    return [];
  }
  const output = [];
  let match;
  while (match = AFFIX_REGEX3.exec(text2)) {
    output.push(parseAffix(VowelForm.parseOrThrow(match[1]), match[2], output.length == 0 && AFFIX_REGEX3.lastIndex == text2.length));
  }
  return output;
}
function buildCombinationReferential(word, stress) {
  const match = combinationReferential.exec(word);
  if (match == null) {
    return;
  }
  const case1 = parseCase(VowelForm.parseOrThrow(match[3]));
  const specification = match[4] == "xx" ? "OBJ" : match[4] == "xt" ? "CTE" : match[4] == "xp" ? "CSV" : "BSC";
  const affixes2 = match[5] ? parseAffixes3(match[5]) : void 0;
  const case2 = !match[6] || match[6] == "a" ? void 0 : match[6] == "\xFCa" ? "THM" : parseCase(VowelForm.parseOrThrow(match[6]));
  if (match[1]) {
    return {
      type: match[1] == "hm" ? "QUO" : match[1] == "hn" ? "NAM" : match[1] == "h\u0148" ? "PHR" : "CAR",
      case: case1,
      case2,
      specification,
      affixes: affixes2,
      essence: stress == "ultimate" ? "RPV" : void 0
    };
  } else {
    const [referents, perspective] = parseReferentListAndPerspective(match[2], false);
    return {
      referents,
      perspective,
      case: case1,
      case2,
      specification,
      affixes: affixes2,
      essence: stress == "ultimate" ? "RPV" : void 0
    };
  }
}

// node_modules/@zsnout/ithkuil/parse/lex/referential/single-or-dual.js
var singleOrDualReferential = /* @__PURE__ */ seq(
  any(
    seq(text("\xFCo"), anyText("hl", "hm", "hn", "h\u0148").asGroup()),
    // Slot I: C1
    seq(text("\xEB").optional(), C, seq(text("\xEB"), C).zeroOrMore()).asGroup()
  ),
  // Slot II: Vc1
  V.asGroup(),
  seq(
    anyText("w", "y"),
    // Slot III: Vc2
    V.asGroup(),
    seq(
      // Slot IV: C2
      C.asGroup(),
      text("\xEB").optional()
    ).optional()
  ).optional()
).matchEntireText().compile();

// node_modules/@zsnout/ithkuil/parse/referential/single-or-dual.js
function buildSingleOrDualReferential(word, stress) {
  const match = singleOrDualReferential.exec(word);
  if (match == null) {
    return;
  }
  const case1 = parseCase(VowelForm.parseOrThrow(match[3]));
  const case2 = match[4] ? parseCase(VowelForm.parseOrThrow(match[4])) : void 0;
  const [referents2, perspective2] = match[5] ? parseReferentListAndPerspective(match[5], false) : [void 0, void 0];
  const essence = stress == "ultimate" ? "RPV" : void 0;
  if (match[1]) {
    return {
      type: match[1] == "hm" ? "QUO" : match[1] == "hn" ? "NAM" : match[1] == "h\u0148" ? "PHR" : "CAR",
      case: case1,
      case2,
      ...referents2 && { referents2, perspective2 },
      essence
    };
  } else {
    const [referents, perspective] = parseReferentListAndPerspective(match[2].replace(/ë/g, ""), false);
    return {
      referents,
      perspective,
      case: case1,
      case2,
      ...referents2 && { referents2, perspective2 },
      essence
    };
  }
}

// node_modules/@zsnout/ithkuil/parse/referential/index.js
function parseReferential(text2) {
  const { word, stress } = transformWord(text2);
  return buildSingleOrDualReferential(word, stress) || buildCombinationReferential(word, stress);
}

// node_modules/@zsnout/ithkuil/parse/index.js
function parseWord(word) {
  return parseReferential(word) ?? parseAdjunct(word) ?? parseFormative(word);
}
export {
  parseWord,
  wordToIthkuil
};
