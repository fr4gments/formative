# IKAL

IKAL est un langage de programmation artistique base sur New Ithkuil.

Le langage ne cherche pas a accepter tout Ithkuil. Il definit un vocabulaire IKAL controle : chaque mot retenu doit etre une vraie forme Ithkuil, avoir un sens lexical clair, et produire un effet artistique motive par ce sens.

## Etat actuel

Les fondations des etapes 2 a 4 sont en place : vraies formes IKAL controlees, sequence par espaces, couches par lignes, effets audio par affixes gradues, et rendu audio / image / animation branche sur le modele `params`.

La version en cours travaille l'etape 5 : blocs de modes stricts, routage par mode, autocompletion contextuelle, puis composition visuelle intra-couche.

- `@zsnout/ithkuil` verifie les formes Ithkuil dans l'outillage Node et les tests de conformite ;
- le runtime navigateur accepte seulement le vocabulaire IKAL controle deja valide ;
- le vocabulaire IKAL initial est branche dans l'application via `params` ;
- les moteurs actuels utilisent encore un pont temporaire `params -> rendu POC` ;
- les effets audio sont definis comme des affixes Ithkuil gradues sur les formes sonores reconnues ;
- les declarations `alkala:`, `lyala:`, `lyula:` isolent les couches musique / image fixe / animation ;
- l'interface route l'audio, l'image fixe et l'animation par mode, avec autocompletion filtree selon le bloc courant ;
- prochaine limite a corriger : les moteurs visuels ne consomment pas encore toute la sequence d'une ligne.

## Lire ensuite

- [Syntaxe](syntaxe.md) : comment IKAL est structure.
- [Vocabulaire](mots.md) : mots actuellement retenus ou candidats.
- [Migration POC](migration-poc.md) : remplacement de `kal`, `ras`, `sus`, etc.
- [Parametres artistiques](params.md) : contrat `ithkuil` vers `params`, avec les affixes audio et les limites actuelles.
- [Effets audio](effets-audio.md) : affixes retenus pour la premiere passe audio.
