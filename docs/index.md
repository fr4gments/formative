# IKAL

IKAL est un langage de programmation artistique base sur New Ithkuil.

Le langage ne cherche pas a accepter tout Ithkuil. Il definit un vocabulaire IKAL controle : chaque mot retenu doit etre une vraie forme Ithkuil, avoir un sens lexical clair, et produire un effet artistique motive par ce sens.

## Etat actuel

Les fondations des etapes 2 a 4 sont en place : vraies formes IKAL controlees, sequence par espaces, couches par lignes, effets audio par affixes gradues, et rendu audio / image / animation branche sur le modele `params`.

La version en cours ouvre l'etape 5 :

- `@zsnout/ithkuil` verifie les formes Ithkuil dans l'outillage Node et les tests de conformite ;
- le runtime navigateur accepte seulement le vocabulaire IKAL controle deja valide ;
- le vocabulaire IKAL initial est branche dans l'application via `params` ;
- les moteurs actuels utilisent encore un pont temporaire `params -> rendu POC` ;
- le prototype `mot(...)` existe pour tester l'inspecteur et les valeurs continues, mais il n'est pas la syntaxe finale ;
- les effets audio sont definis comme des affixes Ithkuil gradues sur les formes sonores reconnues ;
- les declarations `alkala:`, `lyala:`, `lyula:` commencent a isoler les couches musique / image fixe / animation ;
- les effets visuels seront traites ensuite avec leurs propres mots et effets.

## Lire ensuite

- [Syntaxe](syntaxe.md) : comment IKAL est structure.
- [Vocabulaire](mots.md) : mots actuellement retenus ou candidats.
- [Migration POC](migration-poc.md) : remplacement de `kal`, `ras`, `sus`, etc.
- [Parametres artistiques](params.md) : contrat `ithkuil` vers `params`, avec l'etat transitoire actuel.
- [Effets audio](effets-audio.md) : affixes proposes pour la premiere passe audio.
