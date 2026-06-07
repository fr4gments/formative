# Migration POC

Les mots POC ne sont pas des mots IKAL finaux. Ils ont servi a valider les moteurs audio, image, animation et la composition multi-lignes.

Cette table sert a remplacer progressivement les anciennes etiquettes par des mots IKAL reels.

## Table de migration

| Mot POC | Fonction POC | Remplacement IKAL candidat | Justification |
| --- | --- | --- | --- |
| `kal` | clic statique, net, unitaire | `ļtala` | racine `ļt` : ticking/clicking/tapping sound |
| `sus` | bruit dynamique dense | `ačxwala` | racine `čxw` : raucous sound/noise |
| `ras` | roulement statique / duo | a choisir | chercher une racine liee au roulement sonore ou au roulement/mouvement |
| `rur` | roulement dynamique dense / fantome | a choisir | meme famille que `ras`, mais avec categories Ithkuil motivant dynamique / multiplicite / representation |
| `kul` | clic dynamique fantome | `ļtala` + categorie a definir | meme racine que clic, mais dynamique / representation doivent venir de la morphologie |
| `sal` | bruit/souffle statique fantome | `ačxwala` ou autre racine souffle | racine bruit probable, mais le caractere souffle/fantome doit etre precise |
| `-tx` | dechirement / bitcrush / glitch | `sčala` ou affixe Ithkuil a choisir | racine `sč` : break apart/break into pieces/crumble |
| `-sk` | saturation / repli | affixe ou mot a choisir | ne doit pas rester un suffixe invente |

## Regle de migration

Un remplacement n'est accepte que si :

1. la forme est valide New Ithkuil ;
2. son sens lexical est documente dans [Vocabulaire](mots.md) ;
3. le comportement IKAL produit reste testable dans l'experience de l'etape 1 ;
4. le mot POC correspondant peut etre conserve temporairement comme alias de transition, mais pas comme mot final.
