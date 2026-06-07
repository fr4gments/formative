# IKAL

IKAL est un langage de programmation artistique base sur New Ithkuil.

Le langage ne cherche pas a accepter tout Ithkuil. Il definit un vocabulaire IKAL controle : chaque mot retenu doit etre une vraie forme Ithkuil, avoir un sens lexical clair, et produire un effet artistique motive par ce sens.

## Etat actuel

La version en cours correspond a l'etape 2 de la feuille de route :

- `@zsnout/ithkuil` verifie les formes Ithkuil dans l'outillage Node et les tests de conformite ;
- le runtime navigateur accepte seulement le vocabulaire IKAL controle deja valide ;
- le vocabulaire IKAL initial est branche dans l'application via `params` ;
- le parser POC reste disponible comme filet de securite pendant la migration ;
- les moteurs actuels utilisent encore un pont temporaire `params -> rendu POC` ;
- chaque mot IKAL retenu doit etre documente ici avant d'etre considere stable.

## Lire ensuite

- [Syntaxe](syntaxe.md) : comment IKAL est structure.
- [Vocabulaire](mots.md) : mots actuellement retenus ou candidats.
- [Migration POC](migration-poc.md) : remplacement de `kal`, `ras`, `sus`, etc.
- [Parametres artistiques](params.md) : contrat `ithkuil` vers `params`.
