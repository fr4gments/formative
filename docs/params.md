# Parametres artistiques

Les `params` sont l'interface stable entre la verite linguistique Ithkuil, les effets declares dans le programme IKAL, et les moteurs IKAL. Ils ne remplacent pas l'objet `ithkuil` : ils en sont une traduction artistique normalisee, ensuite modulable par le programme IKAL.

Cette couche est implementee dans `src/parser/ithkuil-to-params.js` et reste limitee au vocabulaire IKAL controle. Elle calcule les valeurs par defaut depuis le sens Ithkuil, lit les affixes audio gradues quand ils sont presents, puis passe par un resolver `baseParams + userParams -> params`. Elle est branchee dans l'application via un pont temporaire vers les moteurs POC.

`audioEffects` est maintenant la surface canonique pour les effets audio affixes. `userParams` et la syntaxe `mot(...)` restent un prototype transitoire pour tester certaines valeurs continues et l'inspecteur.

## Intention

La finalite n'est pas d'avoir des parametres caches et figes dans le moteur. Chaque mot IKAL doit produire une base semantique, puis l'utilisateur doit pouvoir la moduler depuis l'editeur.

Modele vise :

```text
forme Ithkuil
  -> ithkuil
  -> baseParams        // valeurs derivees du sens du mot
  + audioEffects       // effets audio derives des affixes gradues
  -> params            // valeurs finales envoyees aux moteurs
```

Etat transitoire encore branche :

```ikal
alxružla(0.8, 0.95, 0.4)
```

Ici, `alxružla` fournit le sens de base : roulement dynamique, multiplex, representatif. Les parametres positionnels ne changent pas ce sens ; ils modulent les champs documentes par la signature du mot. Ce comportement sert de prototype, pas de syntaxe finale.

## Couches de parametres

IKAL distinguera trois niveaux :

| Niveau | Source | Role |
| --- | --- | --- |
| `baseParams` | sens Ithkuil parse : racine, Function, Ca, etc. | donne les valeurs par defaut motivees linguistiquement |
| `audioEffects` | affixes audio gradues sur le formative sonore | module les effets audio du meme evenement |
| `userParams` | arguments positionnels ecrits dans l'editeur IKAL | prototype transitoire, a remplacer progressivement |
| `params` | resolution finale | objet envoye aux moteurs image / animation / musique |

Regle de conception : un effet IKAL ne doit pas transformer un mot en autre chose. Il peut intensifier, attenuer ou preciser les effets derives du mot, mais la famille semantique reste portee par la forme Ithkuil.

## Structure

Le modele de parametres distingue :

- `baseParams` : valeurs derivees du sens Ithkuil ;
- `audioEffects` : effets audio declares par affixes ;
- `userParams` : valeurs demandees par l'utilisateur dans le prototype `mot(...)` ;
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
  role: "mode" | "voice" | "modifier",
  domain: "music" | "image" | "animation" | "visual" | "glitch",
  family: "music" | "visual-design" | "click" | "roll" | "noise" | "breath" | "break-apart" | "distortion",
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

## Regles actuelles

Ces regles calculent les valeurs par defaut de `baseParams`.

## Prototype positionnel actuel

Les parametres s'ecrivent directement apres le mot :

```ikal
affrala(0.85)
sčala(0.12, 0.34)
alxružla(0.8, 0.95, 0.4)
```

Regles de validation :

- arguments positionnels uniquement ;
- valeurs entre `0` et `1` inclus ;
- maximum deux chiffres apres le point decimal ;
- `0`, `1`, `0.7`, `0.85`, `1.0` et `1.00` sont valides ;
- `0.777`, `1.2`, `-0.1`, `.5` et les arguments vides sont invalides.

L'ordre des arguments depend de la signature du mot. L'editeur affiche les slots sous la forme `float (effet)` pour eviter la confusion :

```text
affrala      0.9 (distortion), 0.75 (drive), 0.35 (saturation)
sčala        0.9 (tear), 0.55 (bitcrush), 0.7 (roughness)
alxružla     1 (motion), 0.88 (density), 0.6 (ghost)
```

L'inspecteur reste visible pendant la saisie de `mot(...)`, jusqu'au mot suivant ou a une fermeture explicite. Les valeurs positionnelles sont transmises telles quelles aux champs `params` normalises ; le pont temporaire vers les moteurs POC les expose ensuite comme controles continus.

Cette syntaxe est utile pour tester rapidement le moteur et l'ergonomie de l'inspecteur. Les effets audio canoniques passent maintenant par les affixes ; le prototype positionnel ne doit pas devenir la surface centrale du langage.

Champs modifiables par le prototype positionnel actuel :

| Groupe | Champs |
| --- | --- |
| `effects` | `bitcrush`, `distortion`, `drive`, `roughness`, `saturation`, `tear` |
| `motion` | `amount` |
| `multiplicity` | `density` |
| `representation` | `ghost` |

Les valeurs utilisateur sont bornees entre `0` et `1`. Les champs structurants comme `family`, `role`, `root` ou `mode` ne sont pas surchargeables : ils restent determines par le mot Ithkuil.

Ces champs ne definissent pas la liste d'affixes audio. Ils decrivent seulement ce que le prototype `mot(...)` sait moduler aujourd'hui.

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

## Diagnostics

Si une forme est valide en Ithkuil mais ne peut pas encore produire de `params`, IKAL conserve l'objet `ithkuil` et ajoute un diagnostic.

| Code | Signification |
| --- | --- |
| `unmapped-root` | Racine valide mais absente du vocabulaire IKAL initial. |
| `unsupported-word-type` | Forme valide, mais pas un formative exploitable par IKAL pour l'instant. |
| `unmapped-params-root` | Racine connue linguistiquement mais sans regle `sens -> params`. |
| `unsupported-affixes` | Des affixes sont parses, mais leur effet artistique n'est pas encore defini. |
| `unsupported-audio-affix-slot` | Affixe audio reconnu, mais place dans un slot que la premiere passe IKAL ne mappe pas. |
| `unsupported-user-param` | Parametre utilisateur ignore parce que ce champ ne fait pas partie des overrides autorises. |
| `invalid-user-param` | Parametre utilisateur ignore parce que sa valeur n'est pas numerique. |
| `too-many-audio-effects` | Trop d'affixes audio actifs sur le meme evenement. |
| `incompatible-audio-effect` | Effet audio non compatible avec la famille sonore. |
| `incompatible-layer-mode` | Mot place dans un bloc de mode incompatible, par exemple source sonore dans `lyala:`. |
