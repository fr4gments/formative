# IKAL - reference de langage

Document de travail. Cette reference suit l'implementation et reste volontairement courte tant que le langage n'est pas stabilise.

## Etape 2 - vraies formes Ithkuil

IKAL s'appuie sur `@zsnout/ithkuil` pour parser et generer les formes romanisees New Ithkuil. Le code IKAL ne reinvente pas la morphologie : il ajoute une couche artistique au-dessus de l'objet linguistique parse.

Pour l'instant, le parser POC reste disponible en parallele. Les vraies formes Ithkuil sont introduites par petites tranches testees.

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
| `abjala` | `bj` | musique | impact-sound | bang/boom/explosive sound |
| `ltala` / `ļtala` | `ļt` | musique | click-sound | ticking/clicking/tapping sound |
| `frala` / `fřala` | `fř` | image | shape | shape/form/figure |
| `ftala` | `ft` | image | texture | touch/feel/texture |
| `scala` / `sčala` | `sč` | glitch | break-apart | break apart/break into pieces/crumble |

Les variantes ASCII ci-dessus ne sont pas encore implementees comme aliases. Elles sont notees pour l'ergonomie clavier.

## Diagnostics

Une forme peut etre linguistiquement valide en Ithkuil mais pas encore exploitable par IKAL. Dans ce cas, l'analyse ne dit pas que le mot est faux : elle conserve l'objet `ithkuil` complet et ajoute un diagnostic.

Diagnostics actuels :

| Code | Signification |
| --- | --- |
| `unmapped-root` | La forme est un formative Ithkuil valide, mais sa racine n'est pas encore dans la liste initiale IKAL. |
| `unsupported-word-type` | La forme est Ithkuil valide, mais IKAL ne mappe pas encore ce type de mot. Pour l'instant, seuls les formatives sont candidats au mapping artistique. |
