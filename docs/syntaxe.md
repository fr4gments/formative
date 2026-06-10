# Syntaxe

Cette page decrit la syntaxe IKAL retenue pour l'interface.

## Principe

IKAL est un langage ecrit. L'utilisateur ecrit des formes IKAL, pas des boutons ni des curseurs.

Chaque forme IKAL est choisie comme une vraie forme New Ithkuil. Le sens du mot doit motiver son effet artistique.

## Forme generale

Un programme IKAL est decoupe en blocs de modes. Un en-tete de mode doit etre seul sur sa ligne, suivi de lignes indentees :

```ikal
alkala:
  ļtala ļtalompa
  alxrasa

lyala:
  fřala ftala špala allwala
  avtalöxa ufthalölba amzmaläňva etçvalöxäňva

lyula:
  trala glala
```

Les trois en-tetes actuellement retenus sont :

| Mot | Mode | Sens retenu |
| --- | --- | --- |
| `alkala:` | musique | music playing |
| `lyala:` | image fixe | creating a visual design manually |
| `lyula:` | animation | visual design with Function DYN |

La ponctuation `:` marque un en-tete de bloc. Il doit etre seul sur sa ligne. Les lignes indentees suivantes appartiennent a ce mode jusqu'au prochain en-tete de mode.

## Couches et sequences

L'editeur multi-lignes suit la regle suivante :

```ikal
une ligne d'instructions = une couche
plusieurs mots sur une ligne = une sequence
plusieurs lignes sous le meme mode = couches superposees dans ce mode
```

Dans une ligne, les mots forment une sequence. Plusieurs lignes sous un meme mode sont superposees. Cote musique, cette sequence est consommee par le moteur audio. Cote image fixe, les mots d'une meme ligne sont combines dans une composition statique. Cote animation, les mots d'une meme ligne forment une sequence temporelle.

## Mots actuellement executables

L'application accepte maintenant un vocabulaire IKAL controle. Exemples :

```ikal
alkala:
  ļtala alxrasa ačxwuža
  pswatļa alxružla

lyala:
  fřala ftala špala allwala
  avtalöxa ufthalölba amzmaläňva etçvalöxäňva
```

Ces mots appartiennent au vocabulaire IKAL controle. Ils sont verifies par `@zsnout/ithkuil` dans les tests Node, puis reconnus dans le runtime navigateur par l'adaptateur IKAL avant d'etre traduits en `params` et envoyes aux moteurs via un pont temporaire compatible avec les moteurs POC.

## Saisie et completion

Les formes IKAL restent ecrites sous leur romanisation canonique New Ithkuil, avec diacritiques. Les caracteres comme `č`, `ž`, `ļ`, `ř` ou `š` ne sont pas des decorations : ils peuvent changer la racine ou les categories morphologiques du mot.

L'editeur propose donc une completion clavier. On peut taper une approximation ASCII comme `acxwu`, `alxruz`, `ltu`, `scala` ou un ancien indice POC comme `sus` / `sk`; l'interface propose alors la forme canonique correspondante et insere uniquement cette forme, par exemple `ačxwuža`, `alxružla`, `ļtutļa`, `sčala` ou `affrala`.

Ces approximations ne sont pas des alias du langage. Si elles sont lancees telles quelles sans completion, elles restent analysees comme des formes differentes ou non reconnues.

Pour les effets audio affixes, l'editeur propose aussi des formes generees depuis le nom d'affixe, l'effet ou le degre : `ity`, `opf`, `dts`, `dts9`, `degr`, `reverb`, etc. L'inspecteur affiche alors les affixes et degres, par exemple `ITY/7 intensity = 0.7`.

Pour les effets visuels affixes dans `lyala:`, l'editeur propose aussi les formes generees depuis `siz`, `scale`, `cld`, `vivid`, `col`, `glow`, `dcp`, `density`, `dsg`, `chaos`, `vts`, `glitch`, etc. L'inspecteur affiche alors les affixes visuels et degres, par exemple `SIZ/6 scale`, `COL/2 luminescent-glowing` ou `DCP/3 concentrated-condensed`.

Dans un bloc de mode, la completion devient contextuelle :

- sous `alkala:`, elle propose les mots audio et les formes audio affixees ;
- sous `lyala:` et `lyula:`, elle propose tout le vocabulaire visuel : le moteur en champs etant unique, une primitive d'image s'anime dans `lyula:` (meme champ, temps qui s'ecoule) et un mot de mouvement se fige dans `lyala:` (le champ a `t = 0`, comme une pose longue).

L'inspecteur affiche aussi les modes compatibles du mot. Seule la musique reste un vocabulaire separe ; les mots de glitch sont declares compatibles avec les trois modes.

## Routage des modes

Le parser applicatif route les lignes par mode :

- les couches `alkala:` alimentent le moteur audio ;
- les couches `lyala:` alimentent le rendu image fixe ;
- les couches `lyula:` alimentent l'animation.

Chaque ligne d'instructions sous un en-tete reste une couche : mots espaces = sequence, lignes multiples sous le meme en-tete = couches superposees dans ce mode. Les instructions d'un bloc explicite doivent etre indentees.

Au lancement, la musique reste toujours separee du visuel : `alkala:` joue en audio. Pour le rendu visuel, le dernier bloc visuel dans l'editeur prend le dessus :

- si le dernier bloc visuel est `lyala:`, l'ecran affiche l'image fixe ;
- si le dernier bloc visuel est `lyula:`, l'ecran affiche l'animation.

Exemple :

```ikal
alkala:
  ļtala ļtalompa
  alxrasa

lyala:
  fřala ftala špala allwala
  avtalöxa ufthalölba amzmaläňva etçvalöxäňva

lyula:
  trala glala
```

Dans cet exemple, `lyula:` est le dernier bloc visuel : l'animation est donc affichee au lancement. Si `lyala:` etait place apres `lyula:`, l'image fixe prendrait le dessus.

## Effets audio gradues

Pour les effets audio, la syntaxe canonique est morphologique :

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

## Effets visuels gradues

Pour les images fixes, la syntaxe canonique suit la meme logique morphologique :

```text
forme image + affixes visuels gradues = une meme primitive visuelle modulee
```

Exemples :

```ikal
lyala:
  avtala          # filaments simples
  avtalöxa       # SIZ/6 : filaments plus amples
  ufthalölba     # CLD/6 : nuage plus vivid
  amzmaläňva     # COL/2 : trace lumineuse / glow
  avtalexva      # DCP/3 : filaments plus concentres / denses
  avtalävha      # DSG/2 : filaments plus turbulents
  avtaläňfa      # VTS/2 : filaments plus fractures / disjoints
  etçvalöxäňva   # SIZ/6 + COL/2 : eclats plus grands et lumineux
```

Le cadrage est documente dans [Effets visuels](effets-visuels.md).

## Etat de transition

Pendant la migration, le vocabulaire POC (`kal`, `ras`, `sus`, etc.) peut rester disponible pour tester l'experience de l'etape 1. Il ne fait pas partie du langage IKAL final et n'est pas la syntaxe a ecrire pour les nouveaux programmes.
