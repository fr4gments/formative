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
- l'**image fixe** (`lyala:`) est une frame figee de ce calcul ; l'**animation** (`lyula:`) est le meme calcul avec le temps qui s'ecoule, la sequence d'une ligne avancant d'un mot par pas ;
- les glyphes sont **dessines dans un canvas** (`src/engines/canvas-ascii.js`) : toujours du texte ASCII, mais l'aberration chromatique et les dechirures sont composees au dessin au lieu d'effets CSS par glyphe — reecrire le HTML a chaque frame saturait la memoire et faisait ramer l'interface. Le `<pre>` ne sert plus qu'a l'ecran de repos / POC. Banc de comparaison : `prototypes/render-canvas.html`.

Deux mots d'une meme ligne `lyala:` ne s'additionnent pas : ils se **conjuguent**. L'operateur de conjugaison est porte par l'**Affiliation** Ithkuil du mot (categorie du bloc Ca, verifiee sur la grammaire officielle, chapitre 3) :

| Affiliation | Sens officiel | Operateur IKAL |
| --- | --- | --- |
| `CSL` consolidatif (defaut) | regroupement naturel, fonctions individuelles non pertinentes | territoires independants (maximum des champs) |
| `ASO` associatif | les membres partagent le meme but | renforcement mutuel (fusion ecran, bornee) |
| `COA` coalescent | roles distincts et complementaires | le mot sculpte la matiere accumulee (multiplication) |
| `VAR` variatif | fonctions divergentes, ensemble chaotique | le mot deforme les coordonnees des autres (deplacement) |

## Formes d'Affiliation : la conjugaison ecrivable

Chaque mot de matiere visuelle (primitives d'image et mots de mouvement) existe en quatre formes : la forme de base est `CSL` (defaut), et trois variantes generees marquent l'Affiliation dans le bloc Ca. Quand l'Affiliation est la seule categorie marquee du Ca, la grammaire officielle (section 3.6) lui donne une forme « standalone » :

| Affiliation | Ca standalone | Exemple (`avtala`) | Operateur de conjugaison |
| --- | --- | --- | --- |
| `CSL` consolidatif | `l` | `avtala` | territoires independants |
| `ASO` associatif | `nļ` | `avtanļa` | renforce la ligne |
| `COA` coalescent | `rļ` | `avtarļa` | sculpte la ligne |
| `VAR` variatif | `ň` | `avtaňa` | deforme la ligne |

Les 30 formes generees couvrent les mots de matiere : `allwala`, `špala`, `fřala`, `ftala`, `avtala`, `ufthala`, `amzmala`, `etçvala`, `trala`, `glala`. Les mots glitch (`affrala`, `sčala`) n'ont pas de variantes : ils transforment toute la ligne, l'operateur de conjugaison ne les concerne pas.

Regles de lecture :

- une variante d'Affiliation herite des `params` de son mot de base : meme famille, meme champ, meme matiere (meme graine de bruit) — seule la conjugaison change ;
- seule sur sa ligne, une variante `ASO` / `COA` rend exactement comme son mot de base : l'Affiliation decrit la relation entre les mots d'une ligne, elle n'a rien a dire quand le mot est seul ; une variante `VAR` seule deplace au lieu de dessiner (matiere fantome, plus discrete) ;
- la conjugaison s'exprime dans `lyala:` (tous les mots d'une ligne sont simultanes) ; dans `lyula:`, la sequence avance d'un mot par pas, l'operateur n'y a donc pas encore d'effet visible — les variantes y restent valides.

Exemples :

```ikal
lyala:
  avtala ufthala     # CSL : filaments et nuage, chacun son territoire
  avtala ufthanļa    # ASO : le nuage renforce les filaments (fusion ecran)
  avtala uftharļa    # COA : le nuage sculpte les filaments (multiplication)
  avtala ufthaňa     # VAR : le nuage deforme les filaments (deplacement)
```

Depuis l'Etape 7, ces formes sont decomposees par le runtime navigateur comme n'importe quelle autre : l'Affiliation est lue dans le bloc Ca de la forme tapee, et peut meme se combiner avec des affixes sur le meme mot (ex. `avtarļoxa` = filament + COA + `SIZ/7`, une forme qui n'existe dans aucune liste). La liste generee est devenue une fixture de test :

```bash
npm run generate:affiliation-forms   # regenere tests/fixtures/ikal-affiliation-forms.js
```

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

Depuis l'Etape 7, les formes affixees sont decomposees par le runtime navigateur : tout degre, toute combinaison d'affixes visuels connus est lue directement, sans liste. La liste generee est devenue une fixture de test :

```bash
npm run generate:visual-affixes   # regenere tests/fixtures/ikal-visual-affixed-forms.js
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
| `coa` ou `sculpte` | `avtarļa` |
| `aso` ou `renforce` | `avtanļa` |
| `var` ou `deforme` | `avtaňa` |

Ces alias ne sont pas des mots IKAL. Ils servent uniquement a retrouver la forme canonique.

## Sources

- Grammaire New Ithkuil : https://ithkuil.net
- Document officiel `VXCS Affixes for New Ithkuil`, version 1.1.2 : https://ithkuil.net/affixes_v_1_1.pdf
