# Parametres artistiques

Les `params` sont l'interface stable entre la verite linguistique Ithkuil, les effets declares dans le programme IKAL, et les moteurs IKAL. Ils ne remplacent pas l'objet `ithkuil` : ils en sont une traduction artistique normalisee.

Cette couche est implementee dans `src/parser/ithkuil-to-params.js` et reste limitee au vocabulaire IKAL controle. Elle calcule les valeurs par defaut depuis le sens Ithkuil, lit les affixes audio et visuels gradues quand ils sont presents, puis produit les `params` envoyes aux moteurs. Elle est branchee dans l'application via un pont temporaire vers les moteurs POC.

`audioEffects` est la surface canonique pour les effets audio affixes. `visualAffixes` conserve les degres des affixes visuels reconnus, puis `visualEffects` expose les valeurs moteur derivees.

## Intention

La finalite n'est pas d'avoir des parametres caches et figes dans le moteur. Chaque mot IKAL doit produire une base semantique. Les modulations exposees a l'utilisateur doivent rester motivees par la forme IKAL : affixes audio pour le son, puis mots ou affixes dedies pour le visuel quand ils seront definis.

Modele vise :

```text
forme Ithkuil
  -> ithkuil
  -> baseParams        // valeurs derivees du sens du mot
  + audioEffects       // effets audio derives des affixes gradues
  + visualAffixes      // degres des affixes visuels reconnus
  + visualEffects      // effets visuels derives des mots image / affixes image / glitch
  -> params            // valeurs finales envoyees aux moteurs
```

## Couches de parametres

IKAL distinguera trois niveaux :

| Niveau | Source | Role |
| --- | --- | --- |
| `baseParams` | sens Ithkuil parse : racine, Function, Ca, etc. | donne les valeurs par defaut motivees linguistiquement |
| `audioEffects` | affixes audio gradues sur le formative sonore | module les effets audio du meme evenement |
| `visualAffixes` | affixes visuels gradues sur le formative image | conserve les degres `SIZ`, `CLD`, `COL`, `DCP`, `DSG`, `VTS` retenus |
| `visualEffects` | mots image fixe / glitch et affixes image mappes depuis leur sens | module lumiere, couleur, forme, texture, filaments, diffusion, traces et deformation visuelle |
| `params` | resolution finale | objet envoye aux moteurs image / animation / musique |

Regle de conception : un effet IKAL ne doit pas transformer un mot en autre chose. Il peut intensifier, attenuer ou preciser les effets derives du mot, mais la famille semantique reste portee par la forme Ithkuil.

## Structure

Le modele de parametres distingue :

- `baseParams` : valeurs derivees du sens Ithkuil ;
- `audioEffects` : effets audio declares par affixes ;
- `visualAffixes` : degres des affixes visuels reconnus ;
- `visualEffects` : effets visuels declares par les mots image fixe et glitch ;
- `params` : valeurs finales resolues.

`params` garde la structure suivante :

```js
{
  version: 1,
  audioEffects: {
    degradation: 0,
    force: 0,
    instability: 0,
    intensity: 0,
    randomModulation: 0,
    reverb: 0
  },
  visualAffixes: {
    colorAttribute: 0,
    colorDimension: 0,
    concentration: 0,
    organization: 0,
    transition: 0,
    scale: 0
  },
  role: "mode" | "voice" | "modifier" | "primitive",
  domain: "music" | "image" | "animation" | "visual" | "glitch",
  family: "music" | "visual-design" | "click" | "roll" | "noise" | "breath" | "light" | "color" | "shape" | "texture" | "filament" | "cloud" | "trace" | "spark-scatter" | "break-apart" | "distortion",
  mode: "music" | "image" | "animation" | null,
  motion: {
    function: "STA" | "DYN",
    kind: "static" | "dynamic",
    amount: 0
  },
  multiplicity: {
    configuration: "UPX" | "DPX" | "MFC",
    count: 1,
    density: 0.2,
    texture: "single"
  },
  representation: {
    essence: "NRM" | "RPV",
    ghost: 0,
    kind: "normal"
  },
  effects: {
    bitcrush: 0,
    distortion: 0,
    drive: 0,
    reverb: 0,
    roughness: 0,
    saturation: 0,
    tear: 0
  },
  visualEffects: {
    brightness: 0,
    chroma: 0,
    contrast: 0,
    colorShift: 0,
    darkness: 0,
    density: 0,
    diffusion: 0,
    deformation: 0,
    fracture: 0,
    glow: 0,
    order: 0,
    scale: 0,
    smoothness: 0,
    spread: 0,
    strands: 0,
    structure: 0,
    texture: 0,
    transitionGlitch: 0,
    trails: 0,
    turbulence: 0
  }
}
```

## Affixes audio : audio seulement

Les effets audio gradues sont lus depuis les affixes du mot sonore. Les images fixes et animations ne recuperent pas automatiquement ces effets : elles auront leur propre vocabulaire et leurs propres effets.

Dans cette premiere passe, on distingue :

| Type | Exemple | Role |
| --- | --- | --- |
| Source sonore | racine `ļt`, `lxr`, `čxw`, `psw`, etc. | choisit le type de son |
| Propriete de source | Function, Ca.configuration, Ca.essence | mouvement, densite, multiplicite, representation fantome |
| Effet audio | affixe gradue comme `ITY`, `MDL`, `FRC`, `OPF`, `FLS`, `DTS` | modifie le son produit par la source |

Voir [Effets audio](effets-audio.md) pour la liste retenue dans la premiere passe.

## Affixes visuels : image fixe seulement

Les effets visuels gradues sont lus depuis les affixes du mot image. Ils ne sont pas proposes dans `alkala:` et ne s'appliquent pas aux sources sonores.

Dans cette premiere passe, on distingue :

| Type | Exemple | Role |
| --- | --- | --- |
| Primitive image | `avtala`, `ufthala`, `amzmala`, `etçvala` | choisit la forme visuelle |
| Propriete de source | famille lexicale, Function, Ca si utile plus tard | donne la base semantique |
| Effet visuel | affixe gradue comme `SIZ`, `CLD`, `COL`, `DCP`, `DSG`, `VTS` | module la meme primitive sans creer un nouveau mot |

Voir [Effets visuels](effets-visuels.md) pour la premiere liste retenue.

## Regles actuelles

Ces regles calculent les valeurs par defaut de `baseParams`. Les effets audio canoniques sont ensuite ajoutes depuis les affixes documentes dans [Effets audio](effets-audio.md). Les champs structurants comme `family`, `role`, `root` ou `mode` restent determines par le mot Ithkuil.

### Racine vers famille

| Racine | Famille IKAL | Role |
| --- | --- | --- |
| `lk` | `music` | mode |
| `ly` | `visual-design` | mode |
| `ļt` | `click` | voice |
| `lxr` | `roll` | voice |
| `čxw` | `noise` | voice |
| `psw` | `breath` | voice |
| `bj` | `impact` | voice |
| `sč` | `break-apart` | modifier |
| `ffr` | `distortion` | modifier |
| `šp` | `color` | modifier |
| `llw` | `light` | modifier |
| `fř` | `shape` | modifier |
| `ft` | `texture` | modifier |
| `vt` | `filament` | primitive |
| `fth` | `cloud` | primitive |
| `mzm` | `trace` | primitive |
| `tçv` | `spark-scatter` | primitive |
| `tr` | `linear-motion` | modifier |
| `gl` | `random-motion` | modifier |

### Function vers mouvement

| Function | `params.motion` |
| --- | --- |
| `STA` | `kind: "static"`, `amount: 0` |
| `DYN` | `kind: "dynamic"`, `amount: 1` |

### Ca vers multiplicite et representation

| Ca | Effet `params` |
| --- | --- |
| configuration absente / `UPX` | `count: 1`, `texture: "single"` |
| `DPX` | `count: 2`, `texture: "duplex"` |
| `MFC` | `count: 3`, `texture: "multiplex-fuzzy-connected"` |
| essence absente / `NRM` | `ghost: 0`, `kind: "normal"` |
| essence `RPV` | `ghost: 0.6`, `kind: "representative"` |

### Famille vers effets

| Famille | Effets principaux |
| --- | --- |
| `click` | rugosite faible |
| `roll` | rugosite faible, continuite |
| `noise` | rugosite forte |
| `breath` | rugosite douce |
| `break-apart` | `tear`, `bitcrush`, rugosite forte |
| `distortion` | `distortion`, `drive`, `saturation` |
| `color` | `saturation` |
| `texture` | rugosite visuelle |

### Famille vers effets visuels

| Famille | Effets visuels principaux |
| --- | --- |
| `light` | luminosite, glow, contraste clair |
| `color` | chroma / intensite chromatique |
| `shape` | structure, contour, organisation de forme |
| `texture` | grain visuel, rugosite de surface |
| `filament` | lignes organiques, fibres, structure filamenteuse |
| `cloud` | diffusion, masse brumeuse, glow doux |
| `trace` | trainees, marques residuelles |
| `spark-scatter` | eclats lumineux, dispersion, fracture fine |
| `distortion` | deformation visuelle, chroma secondaire |
| `break-apart` | fracture visuelle, texture de rupture |

## Diagnostics

Si une forme est valide en Ithkuil mais ne peut pas encore produire de `params`, IKAL conserve l'objet `ithkuil` et ajoute un diagnostic.

| Code | Signification |
| --- | --- |
| `unmapped-root` | Racine valide mais absente du vocabulaire IKAL initial. |
| `unsupported-word-type` | Forme valide, mais pas un formative exploitable par IKAL pour l'instant. |
| `unmapped-params-root` | Racine connue linguistiquement mais sans regle `sens -> params`. |
| `unsupported-affixes` | Des affixes sont parses, mais leur effet artistique n'est pas encore defini. |
| `unsupported-audio-affix-slot` | Affixe audio reconnu, mais place dans un slot que la premiere passe IKAL ne mappe pas. |
| `unsupported-visual-affix-slot` | Affixe visuel reconnu, mais place dans un slot que la premiere passe IKAL ne mappe pas. |
| `too-many-audio-effects` | Trop d'affixes audio actifs sur le meme evenement. |
| `too-many-visual-effects` | Trop d'affixes visuels actifs sur le meme evenement. |
| `incompatible-audio-effect` | Effet audio non compatible avec la famille sonore. |
| `incompatible-visual-effect` | Effet visuel non compatible avec la famille du mot. |
| `incompatible-layer-mode` | Mot place dans un bloc de mode incompatible, par exemple source sonore dans `lyala:`. |
