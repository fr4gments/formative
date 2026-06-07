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

## Saisie et completion

Les formes IKAL restent ecrites sous leur romanisation canonique New Ithkuil, avec diacritiques. Les caracteres comme `č`, `ž`, `ļ`, `ř` ou `š` ne sont pas des decorations : ils peuvent changer la racine ou les categories morphologiques du mot.

L'editeur propose donc une completion clavier. On peut taper une approximation ASCII comme `acxwu`, `alxruz`, `ltu`, `scala` ou un ancien indice POC comme `sus` / `sk`; l'interface propose alors la forme canonique correspondante et insere uniquement cette forme, par exemple `ačxwuža`, `alxružla`, `ļtutļa`, `sčala` ou `affrala`.

Ces approximations ne sont pas des alias du langage. Si elles sont lancees telles quelles sans completion, elles restent analysees comme des formes differentes ou non reconnues.

Pour les effets audio affixes, l'editeur propose aussi des formes generees depuis le nom d'affixe, l'effet ou le degre : `ity`, `opf`, `dts`, `dts9`, `degr`, `reverb`, etc. L'inspecteur affiche alors les affixes et degres, par exemple `ITY/7 intensity = 0.7`.

## Modes prevus

Les modes doivent etre declares par des mots IKAL visibles :

| Mot | Mode | Sens retenu |
| --- | --- | --- |
| `alkala:` | musique | music playing |
| `lyala:` | image fixe | creating a visual design manually |
| `lyula:` | animation | visual design with Function DYN |

La ponctuation `:` marque une declaration de couche. Elle n'est pas encore branchee dans le parser applicatif.

## Effets audio gradues

La direction validee pour l'etape 4 n'est pas une syntaxe finale `mot(...)`, ni un chainage `mot.effet(...)`.

Pour les effets audio, la syntaxe cible est morphologique :

```text
forme sonore + affixes audio gradues = un seul evenement sonore modifie
```

Concretement :

- le mot de base porte la source sonore et ses proprietes structurelles ;
- un affixe audio porte une intention sonore, par exemple intensite, modulation aleatoire, force, degradation, instabilite ou reverb ;
- le degre de l'affixe donne une valeur a une decimale : absence = `0.0`, degre 1 = `0.1`, ..., degre 9 = `0.9` ;
- plusieurs affixes audio sur le meme mot se cumulent sur le meme evenement ;
- un espace lance toujours l'evenement suivant.

La premiere passe concerne uniquement le son. Les effets image / animation auront leurs propres mots et affixes plus tard.

Le cadrage est documente dans [Effets audio](effets-audio.md).

## Prototype de parametres

Le prototype positionnel suivant est actuellement branche pour tester les valeurs continues et l'inspecteur :

```ikal
alxružla(0.8, 0.95, 0.4)
affrala(0.85)
sčala(0.12, 0.34)
```

Ce prototype est transitoire. Il reste utile pour verifier le moteur, mais il ne doit pas devenir la surface canonique du langage.

## Etat de transition

Pendant la migration, le vocabulaire POC (`kal`, `ras`, `sus`, etc.) peut rester disponible pour tester l'experience de l'etape 1. Il ne fait pas partie du langage IKAL final.
