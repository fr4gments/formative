# Syntaxe

Cette page decrit la syntaxe IKAL branchee dans l'interface, plus les surfaces encore transitoires.

## Principe

IKAL est un langage ecrit. L'utilisateur ecrit des formes IKAL, pas des boutons ni des curseurs.

Chaque forme IKAL est choisie comme une vraie forme New Ithkuil. Le sens du mot doit motiver son effet artistique.

## Couches

L'editeur multi-lignes suit la regle suivante :

```ikal
ligne 1 = couche 1
ligne 2 = couche 2
ligne 3 = couche 3
```

Dans une ligne, les mots forment une sequence. Plusieurs lignes sous un meme mode sont superposees. Cote musique, cette sequence est deja consommee par le moteur audio. Cote image fixe et animation, la composition intra-ligne est le prochain point a corriger : le rendu visuel utilise encore principalement le premier mot de chaque couche.

## Mots actuellement executables

L'application accepte maintenant un vocabulaire IKAL controle, en plus du vocabulaire POC temporaire. Exemples :

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

Dans un bloc de mode, la completion devient contextuelle :

- sous `alkala:`, elle propose les mots audio et les formes audio affixees ;
- sous `lyala:`, elle propose les mots compatibles avec l'image fixe ;
- sous `lyula:`, elle propose les mots compatibles avec l'animation.

L'inspecteur affiche aussi les modes compatibles du mot. Les mots communs, comme les premiers mots de glitch, ne sont proposes dans plusieurs modes que parce que cette compatibilite est declaree explicitement.

## Modes

Les modes sont declares par des mots IKAL visibles :

| Mot | Mode | Sens retenu |
| --- | --- | --- |
| `alkala:` | musique | music playing |
| `lyala:` | image fixe | creating a visual design manually |
| `lyula:` | animation | visual design with Function DYN |

La ponctuation `:` marque un en-tete de bloc. Il doit etre seul sur sa ligne. Les lignes indentees suivantes appartiennent a ce mode jusqu'au prochain en-tete de mode. Le parser applicatif route ensuite ces lignes par mode :

- les couches `alkala:` alimentent le moteur audio ;
- les couches `lyala:` alimentent le rendu image fixe ;
- les couches `lyula:` alimentent l'animation.

Chaque ligne d'instructions sous un en-tete reste une couche : mots espaces = sequence, lignes multiples sous le meme en-tete = couches superposees dans ce mode.

Une ligne IKAL sans declaration de mode reste temporairement une couche musique implicite, pour garder les exemples existants utilisables pendant la transition. Les instructions d'un bloc explicite doivent etre indentees.

Au lancement, la musique reste toujours separee du visuel : `alkala:` joue en audio. Pour le rendu visuel, le dernier bloc visuel dans l'editeur prend le dessus :

- si le dernier bloc visuel est `lyala:`, l'ecran affiche l'image fixe ;
- si le dernier bloc visuel est `lyula:`, l'ecran affiche l'animation.

Exemple :

```ikal
alkala:
  ļtala ļtalompa
  alxrasa

lyala:
  fřala ftala

lyula:
  trala glala
```

Dans cet exemple, `lyula:` est le dernier bloc visuel : l'animation est donc affichee au lancement. Si `lyala:` etait place apres `lyula:`, l'image fixe prendrait le dessus.

## Effets audio gradues

La syntaxe canonique des effets audio n'est pas `mot(...)`, ni un chainage `mot.effet(...)`.

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

Le prototype positionnel suivant reste branche pour tester les valeurs continues et l'inspecteur :

```ikal
alxružla(0.8, 0.95, 0.4)
affrala(0.85)
sčala(0.12, 0.34)
```

Ce prototype est transitoire. Il reste utile pour verifier le moteur, mais il ne doit pas devenir la surface canonique du langage.

## Etat de transition

Pendant la migration, le vocabulaire POC (`kal`, `ras`, `sus`, etc.) peut rester disponible pour tester l'experience de l'etape 1. Il ne fait pas partie du langage IKAL final.
