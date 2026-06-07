# Notes techniques du langage

Cette page conserve les notes techniques issues de l'implementation. La reference lisible du langage est repartie dans :

- [Syntaxe](syntaxe.md)
- [Vocabulaire](mots.md)
- [Migration POC](migration-poc.md)
- [Parametres artistiques](params.md)

## Etape 2 - vraies formes Ithkuil

IKAL s'appuie sur `@zsnout/ithkuil` dans l'outillage Node pour verifier et generer les formes romanisees New Ithkuil retenues. Le runtime navigateur ne charge pas directement cette librairie : il execute un vocabulaire IKAL controle, deja valide par les tests de conformite.

Le code IKAL ne reinvente pas la morphologie Ithkuil. Il limite volontairement la surface acceptee par l'application et ajoute une couche artistique au-dessus des formes retenues.

Le parser POC reste disponible en parallele comme filet de securite. Le parser applicatif essaie d'abord le vocabulaire POC ; si celui-ci ne correspond pas, il passe au parser Ithkuil et n'accepte que les formes qui produisent des `params` exploitables.

## Racines initiales

| Forme | Racine | Domaine IKAL | Famille | Sens retenu |
| --- | --- | --- | --- | --- |
| `alkala` | `lk` | musique | music | music/play music/compose music |
| `lyala` | `ly` | image | visual-design | visual design/artistic representation |
| `lyula` | `ly` | animation | visual-design | visual design/artistic representation, Function DYN |
| `allwala` | `llw` | visuel | light | light/illumination/brightness |
| `spala` / `špala` | `šp` | visuel | color | color |
| `trala` | `tr` | animation | linear-motion | linear motion |
| `glala` | `gl` | animation | random-motion | horizontal-planar range of motion |
| `acxwala` / `ačxwala` | `čxw` | musique | noise | raucous sound/noise |
| `ačxwuža` | `čxw` | musique | noise-cloud | raucous sound/noise, Function DYN, Ca MFC |
| `abjala` | `bj` | musique | impact-sound | bang/boom/explosive sound |
| `ltala` / `ļtala` | `ļt` | musique | click-sound | ticking/clicking/tapping sound |
| `ļtutļa` | `ļt` | musique | ghost-click-sound | ticking/clicking/tapping sound, Function DYN, essence RPV |
| `alxrala` | `lxr` | musique / animation | roll | roll/wheeling/winding |
| `alxrasa` | `lxr` | musique / animation | duplex-roll | roll/wheeling/winding, Ca DPX |
| `alxružla` | `lxr` | musique / animation | ghost-roll-cloud | roll/wheeling/winding, Function DYN, Ca MFC, essence RPV |
| `pswala` | `psw` | musique | breath | respiration/breathing/panting/gasping |
| `pswatļa` | `psw` | musique | ghost-breath | respiration/breathing, essence RPV |
| `frala` / `fřala` | `fř` | image | shape | shape/form/figure |
| `ftala` | `ft` | image | texture | touch/feel/texture |
| `affrala` | `ffr` | glitch | distortion | bending/distortion/twisting/warping |
| `scala` / `sčala` | `sč` | glitch | break-apart | break apart/break into pieces/crumble |

Les variantes ASCII ci-dessus ne sont pas des formes IKAL valides et ne sont pas implementees comme aliases du parser. Elles servent uniquement d'indices de completion : l'editeur peut les reconnaitre pendant la saisie, puis inserer la forme canonique avec diacritiques.

## Migration POC initiale

La premiere table de migration est maintenant codee dans `src/parser/poc-to-ikal-migration.js`. Elle couvre `kal`, `ras`, `suš` / `sus`, `kul`, `sal`, `ruř` / `rur`, `-tx` et `-šk` / `-sk`.

Cette table est maintenant branchee dans l'application pour les formes candidates couvertes par `params`. Les mots POC restent acceptes temporairement.

## Params artistiques

La premiere couche `sens Ithkuil -> params artistiques` est codee dans `src/parser/ithkuil-to-params.js`. Elle calcule les valeurs par defaut, c'est-a-dire le futur `baseParams`.

Elle traduit :

- racine vers famille IKAL (`ļt` -> `click`, `lxr` -> `roll`, `čxw` -> `noise`, etc.) ;
- `Function` vers mouvement (`STA` statique, `DYN` dynamique) ;
- `Ca.configuration` vers multiplicite / densite ;
- `Ca.essence` vers representation normale ou representative/fantome ;
- familles de rupture ou distorsion vers effets (`tear`, `bitcrush`, `drive`, `distortion`).

Voir [Parametres artistiques](params.md) pour le contrat detaille.

Les parametres finaux de l'app devront ensuite etre resolus comme :

```text
baseParams + userParams -> params
```

`userParams` designera les valeurs ecrites par l'utilisateur dans l'editeur. Le resolver interne existe deja avec `userParams` vide ; la syntaxe editeur n'est pas encore implemente.

## Pont temporaire vers les moteurs

Les moteurs audio / image / animation actuels savent lire les programmes IKAL avec `params`, mais ils passent encore par une vue de compatibilite dans `src/engines/program-view.js`.

Cette vue traduit temporairement :

- `family: "click"` vers l'ancien comportement de clic ;
- `family: "roll"` vers l'ancien comportement de roulement ;
- `family: "noise"` / `breath` vers l'ancien comportement de bruit ;
- `effects.tear` / `bitcrush` vers l'ancien effet `-tx` ;
- `effects.distortion` / `drive` vers l'ancien effet `-šk`.

Ce pont permet de tester les vrais mots Ithkuil dans l'interface sans re-ecrire immediatement les moteurs. Il est temporaire : les moteurs devront ensuite consommer les `params` directement.

## Diagnostics

Une forme peut etre linguistiquement valide en Ithkuil mais pas encore exploitable par IKAL. Dans ce cas, l'analyse ne dit pas que le mot est faux : elle conserve l'objet `ithkuil` complet et ajoute un diagnostic.

Diagnostics actuels :

| Code | Signification |
| --- | --- |
| `unmapped-root` | La forme est un formative Ithkuil valide, mais sa racine n'est pas encore dans la liste initiale IKAL. |
| `unsupported-word-type` | La forme est Ithkuil valide, mais IKAL ne mappe pas encore ce type de mot. Pour l'instant, seuls les formatives sont candidats au mapping artistique. |
| `unmapped-params-root` | La racine est connue linguistiquement, mais aucune regle artistique `sens -> params` n'existe encore. |
| `unsupported-affixes` | Des affixes sont presents et conserves dans `ithkuil`, mais leur effet artistique n'est pas encore defini. |
