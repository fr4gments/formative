# Effets visuels par affixes

Cette page cadre la premiere passe des effets visuels pour `lyala:`.

Le principe suit la meme logique que le son :

```text
primitive image + affixes visuels gradues = une meme forme visuelle modulee
```

Un espace reste une nouvelle instruction de sequence. Les affixes visuels modifient le mot sur lequel ils sont attaches ; ils ne creent pas un nouveau mot-dessin.

## Regles initiales

- Un mot image reste la source : `avtala`, `ufthala`, `amzmala`, `etçvala`, etc.
- Les affixes visuels sont lus en Slot VII.
- Les affixes visuels reconnus en Slot V produisent un diagnostic.
- Les effets incompatibles avec une famille non visuelle produisent un diagnostic.
- La premiere limite est de 3 affixes visuels actifs sur un meme mot.
- Le rendu visuel est un moteur en champs deterministe, rendu en ASCII couleur : meme code, meme image.

## Affixes retenus

| Effet IKAL | Affixe New Ithkuil | Sens officiel utile | Mapping initial |
| --- | --- | --- | --- |
| `scale` | `SIZ`, `cs: x` | degre de taille | taille / epaisseur / amplitude de la primitive |
| `color-dimension` | `CLD`, `cs: lb` | dimension de couleur : pale, vivid, deep, etc. | chroma, luminosite, contraste, obscurite |
| `color-attribute` | `COL`, `cs: ňv` | glossy, glowing, fluorescent, iridescent, matte, etc. | glow, surface, chroma, iridescence, matiere |
| `concentration` | `DCP`, `cs: xv` | concentration / dispersion | densite de matiere, dispersion spatiale |
| `organization` | `DSG`, `cs: vh` | chaotic / random / organized / structured | turbulence, ordre, regularite |
| `transition` | `VTS`, `cs: ňf` | transition variable / disjointe / graduelle | fracture, glitch de transition, lissage |

Decision : cette premiere passe ne retient pas encore tous les effets possibles. Elle teste le modele compact :

```text
source visuelle + 0..N affixes visuels gradues
```

## Degres

`SIZ` est traite comme un axe graduel simple :

```text
degre 1 = tres petit / fin
degre 9 = tres grand / ample
```

`CLD` et `COL` ne sont pas des curseurs lineaires. Le degre choisit une nuance semantique :

| Affixe | Degre exemple | Effet IKAL |
| --- | --- | --- |
| `CLD/6` | vivid | chroma forte |
| `CLD/8` | dark/subdued | image plus sombre et contrastee |
| `COL/2` | luminescent/glowing | glow fort |
| `COL/4` | iridescent | variation chromatique |
| `COL/9` | matte | surface plus mate / texturee |

`DCP`, `DSG` et `VTS` introduisent la deuxieme tranche d'effets lisibles dans le moteur en champs :

| Affixe | Degre exemple | Effet IKAL |
| --- | --- | --- |
| `DCP/3` | concentrated/condensed | matiere plus dense et moins dispersee |
| `DCP/7` | dissipated/scattered | matiere plus etalee |
| `DSG/2` | chaotic/disorganized | turbulence forte |
| `DSG/8` | organized/structured | composition plus reguliere |
| `VTS/2` | disjointed transition | fracture / rupture visuelle |
| `VTS/8` | smooth gradual transition | transition plus lisse |

## Conjugaison : le moteur en champs

Depuis juin 2026, le rendu visuel suit le modele en champs (`src/engines/field-visual.js`) :

- une **primitive** est un champ : une fonction `(x, y, temps) -> intensite` qui dit ou il y a de la matiere ;
- un **affixe visuel** est une **transformation** de ce champ ou de sa couleur, jamais un ajout de matiere : `SIZ` dilate les coordonnees, `DSG` les tord, `VTS` les fracture en bandes, `CLD` et `COL` ne touchent que la traduction couleur ;
- les mots **glitch** (`affrala` distorsion, `sčala` break-apart) ne dessinent rien : ils transforment toute la ligne ;
- l'**image fixe** (`lyala:`) est une frame figee de ce calcul ; l'**animation** (`lyula:`) est le meme calcul avec le temps qui s'ecoule, la sequence d'une ligne avancant d'un mot par pas.

Deux mots d'une meme ligne `lyala:` ne s'additionnent pas : ils se **conjuguent**. L'operateur de conjugaison est porte par l'**Affiliation** Ithkuil du mot (categorie du bloc Ca, verifiee sur la grammaire officielle, chapitre 3) :

| Affiliation | Sens officiel | Operateur IKAL |
| --- | --- | --- |
| `CSL` consolidatif (defaut) | regroupement naturel, fonctions individuelles non pertinentes | territoires independants (maximum des champs) |
| `ASO` associatif | les membres partagent le meme but | renforcement mutuel (fusion ecran, bornee) |
| `COA` coalescent | roles distincts et complementaires | le mot sculpte la matiere accumulee (multiplication) |
| `VAR` variatif | fonctions divergentes, ensemble chaotique | le mot deforme les coordonnees des autres (deplacement) |

Le vocabulaire actuel n'a pas encore de formes canoniques avec `ASO` / `COA` / `VAR` marques : tous les mots seeds sont `CSL` par defaut. La generation de ces formes fait partie de l'elargissement du vocabulaire.

## Exemples

```ikal
lyala:
  avtala          # filaments simples
  avtalöxa       # filaments plus grands / amples : SIZ/6
  ufthalölba     # nuage vivid : CLD/6
  amzmaläňva     # trace lumineuse : COL/2
  avtalexva      # filaments concentres : DCP/3
  avtalävha      # filaments chaotiques : DSG/2
  avtaläňfa      # filaments disjoints / fractures : VTS/2
  etçvalöxäňva   # eclats agrandis + glow : SIZ/6 + COL/2
```

Les formes ci-dessus sont generees par `@zsnout/ithkuil` puis commitees dans `src/parser/generated/ikal-visual-affixed-forms.js`.

Commande de regeneration :

```bash
npm run generate:visual-affixes
```

## Completion

L'editeur peut retrouver ces formes avec des alias de recherche :

| Taper | Exemple insere |
| --- | --- |
| `scale` | `avtalöxa` |
| `vivid` | `avtalölba` |
| `glow` | `avtaläňva` |
| `density` | `avtalexva` |
| `chaos` | `avtalävha` |
| `glitch` | `avtaläňfa` |
| `siz6` | forme avec `SIZ/6` |
| `col2` | forme avec `COL/2` |

Ces alias ne sont pas des mots IKAL. Ils servent uniquement a retrouver la forme canonique.

## Sources

- Grammaire New Ithkuil : https://ithkuil.net
- Document officiel `VXCS Affixes for New Ithkuil`, version 1.1.2 : https://ithkuil.net/affixes_v_1_1.pdf
