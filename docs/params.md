# Parametres artistiques

Les `params` sont l'interface stable entre la verite linguistique Ithkuil, les parametres ecrits dans l'editeur, et les moteurs IKAL. Ils ne remplacent pas l'objet `ithkuil` : ils en sont une traduction artistique normalisee, ensuite modulable par le programme IKAL.

Pour l'instant, cette couche est implementee dans `src/parser/ithkuil-to-params.js` et reste limitee aux racines initiales IKAL. Elle calcule les valeurs par defaut depuis le sens Ithkuil, puis passe deja par un resolver `baseParams + userParams -> params`. Elle est branchee dans l'application via un pont temporaire vers les moteurs POC ; la syntaxe d'edition des parametres n'est pas encore active.

## Intention

La finalite n'est pas d'avoir des parametres caches et figes dans le moteur. Chaque mot IKAL doit produire une base semantique, puis l'utilisateur doit pouvoir la moduler depuis l'editeur.

Modele vise :

```text
forme Ithkuil
  -> ithkuil
  -> baseParams        // valeurs derivees du sens du mot
  + userParams         // valeurs ecrites dans l'editeur
  -> params            // valeurs finales envoyees aux moteurs
```

Exemple d'intention, syntaxe non definitive :

```ikal
alxružla(ghost: 0.8, density: 0.95, drive: 0.2)
```

Ici, `alxružla` fournit le sens de base : roulement dynamique, multiplex, representatif. Les parametres ecrits dans l'editeur ne changent pas ce sens ; ils modulent l'intensite artistique transmise aux moteurs.

## Couches de parametres

IKAL distinguera trois niveaux :

| Niveau | Source | Role |
| --- | --- | --- |
| `baseParams` | sens Ithkuil parse : racine, Function, Ca, etc. | donne les valeurs par defaut motivees linguistiquement |
| `userParams` | arguments ecrits dans l'editeur IKAL | surcharge ou module explicitement certains champs |
| `params` | resolution finale | objet envoye aux moteurs image / animation / musique |

Regle de conception : `userParams` ne doit pas transformer un mot en autre chose. Il peut intensifier, attenuer ou preciser les effets derives du mot, mais la famille semantique reste portee par la forme Ithkuil.

## Structure

Chaque mot exploitable produit maintenant :

- `baseParams` : valeurs derivees du sens Ithkuil ;
- `userParams` : valeurs demandees par l'utilisateur, vide pour l'instant ;
- `params` : valeurs finales resolues.

`params` garde la structure suivante :

```js
{
  version: 1,
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
    roughness: 0,
    saturation: 0,
    tear: 0
  }
}
```

## Regles actuelles

Ces regles calculent aujourd'hui les valeurs par defaut. Elles correspondent au futur `baseParams`.

## Overrides prepares

La syntaxe editeur n'est pas encore choisie, mais le resolver accepte deja un objet `userParams` interne pour preparer le branchement futur.

Champs modifiables prevus dans la premiere tranche :

| Groupe | Champs |
| --- | --- |
| `effects` | `bitcrush`, `distortion`, `drive`, `roughness`, `saturation`, `tear` |
| `motion` | `amount` |
| `multiplicity` | `density` |
| `representation` | `ghost` |

Les valeurs utilisateur sont bornees entre `0` et `1`. Les champs structurants comme `family`, `role`, `root` ou `mode` ne sont pas surchargeables : ils restent determines par le mot Ithkuil.

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
| `unsupported-user-param` | Parametre utilisateur ignore parce que ce champ ne fait pas partie des overrides autorises. |
| `invalid-user-param` | Parametre utilisateur ignore parce que sa valeur n'est pas numerique. |
