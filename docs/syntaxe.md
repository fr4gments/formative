# Syntaxe

Cette page decrit la syntaxe IKAL telle qu'elle est visee et l'etat actuellement branche dans l'interface.

## Principe

IKAL est un langage ecrit. L'utilisateur ecrit des formes IKAL, pas des boutons ni des curseurs.

Chaque forme IKAL est choisie comme une vraie forme New Ithkuil. Le sens du mot doit motiver son effet artistique.

## Couches

L'editeur multi-lignes suit la regle validee a l'etape 1 :

```ikal
ligne 1 = couche 1
ligne 2 = couche 2
ligne 3 = couche 3
```

Dans une ligne, les mots forment une sequence. Plusieurs lignes sont superposees.

## Mots actuellement executables

L'application accepte maintenant les formes IKAL candidates suivantes, en plus du vocabulaire POC temporaire :

```ikal
ļtala alxrasa ačxwuža
pswatļa alxružla affrala
```

Ces mots appartiennent au vocabulaire IKAL controle. Ils sont verifies par `@zsnout/ithkuil` dans les tests Node, puis reconnus dans le runtime navigateur par l'adaptateur IKAL avant d'etre traduits en `params` et envoyes aux moteurs via un pont temporaire compatible avec les moteurs POC.

## Modes prevus

Les modes doivent etre declares par des mots IKAL visibles :

| Mot | Mode | Sens retenu |
| --- | --- | --- |
| `alkala:` | musique | music playing |
| `lyala:` | image fixe | creating a visual design manually |
| `lyula:` | animation | visual design with Function DYN |

La ponctuation `:` marque une declaration de couche. Elle n'est pas encore branchee dans le parser applicatif.

## Parametres prevus

Les mots IKAL doivent pouvoir recevoir des parametres directement dans l'editeur. Ces parametres modulent les valeurs derivees du sens Ithkuil, sans remplacer ce sens.

Exemple d'intention, syntaxe non definitive :

```ikal
alxružla(ghost: 0.8, density: 0.95)
affrala(drive: 0.4)
```

Le modele vise est documente dans [Parametres artistiques](params.md) :

```text
baseParams + userParams -> params
```

Cette syntaxe n'est pas encore branchee. Elle sera traitee apres le branchement initial des vraies formes Ithkuil dans l'application.

## Etat de transition

Pendant la migration, le vocabulaire POC (`kal`, `ras`, `sus`, etc.) peut rester disponible pour tester l'experience de l'etape 1. Il ne fait pas partie du langage IKAL final.
