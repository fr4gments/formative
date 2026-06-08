# Migration POC

Les mots POC ne sont pas des mots IKAL finaux. Ils ont servi a valider les moteurs audio, image, animation et la composition multi-lignes.

Cette table sert a remplacer progressivement les anciennes etiquettes par des mots IKAL reels.

## Table de migration

| Mot POC | Fonction POC | Remplacement IKAL candidat | Justification |
| --- | --- | --- | --- |
| `kal` | clic statique, net, unitaire | `ļtala` | racine `ļt` : ticking/clicking/tapping sound |
| `ras` | roulement statique / duo | `alxrasa` | racine `lxr` : roll/wheeling/winding, avec Ca `DPX` pour le duo |
| `suš` / `sus` | bruit dynamique dense | `ačxwuža` | racine `čxw` : raucous sound/noise, avec Function `DYN` et Ca `MFC` pour une masse dynamique |
| `kul` | clic dynamique fantome | `ļtutļa` | racine `ļt`, avec Function `DYN` et Ca essence `RPV` |
| `sal` | souffle statique fantome | `pswatļa` | racine `psw` : respiration/breathing, avec Ca essence `RPV` |
| `ruř` / `rur` | roulement dynamique dense / fantome | `alxružla` | racine `lxr`, avec Function `DYN`, Ca `MFC` et essence `RPV` |
| `-tx` | dechirement / bitcrush / glitch | `sčala` | racine `sč` : break apart/break into pieces/crumble |
| `-šk` / `-sk` | saturation / repli / distorsion | `affrala` | racine `ffr` : bending/distortion/twisting/warping |

Les deux anciens suffixes POC sont listes avec un tiret parce qu'ils viennent de l'ancien parseur. Leur remplacement IKAL n'est plus un suffixe : `sčala` et `affrala` sont des mots IKAL de glitch compatibles avec les premiers modes. Pour les effets audio gradues, la syntaxe canonique passe maintenant par les affixes documentes dans [Effets audio](effets-audio.md).

## Regle de migration

Un remplacement n'est accepte que si :

1. la forme est valide New Ithkuil ;
2. son sens lexical est documente dans [Vocabulaire](mots.md) ;
3. le comportement IKAL produit reste testable dans l'experience de l'etape 1 ;
4. le mot POC correspondant peut etre conserve temporairement comme alias de transition, mais pas comme mot final.
