# Syntaxe

Cette page decrit la syntaxe IKAL telle qu'elle est visee. Les mots de mode definitifs ne sont pas encore branches dans l'interface ; ils sont listes ici parce qu'ils sont deja valides morphologiquement.

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

## Modes prevus

Les modes doivent etre declares par des mots IKAL visibles :

| Mot | Mode | Sens retenu |
| --- | --- | --- |
| `alkala:` | musique | music playing |
| `lyala:` | image fixe | creating a visual design manually |
| `lyula:` | animation | visual design with Function DYN |

La ponctuation `:` marque une declaration de couche. Elle n'est pas encore branchee dans le parser applicatif.

## Etat de transition

Pendant la migration, le vocabulaire POC (`kal`, `ras`, `sus`, etc.) peut rester disponible pour tester l'experience de l'etape 1. Il ne fait pas partie du langage IKAL final.
