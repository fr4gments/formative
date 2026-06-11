# Effets audio par affixes

Cette page cadre l'etape 4 pour le son uniquement.

Les effets visuels, les images fixes et les animations ne doivent pas heriter automatiquement de tous les effets audio. Pour le visuel, IKAL ajoutera plus tard des mots, familles et effets dedies. Ici, on se concentre sur :

```text
un mot sonore + affixes audio gradues = un seul evenement sonore modifie
```

## Regles de langage

- Un mot sonore reste la source : `ačxwuža`, `ļtala`, `alxružla`, etc.
- Un espace lance l'evenement suivant dans la sequence.
- Une ligne est une couche superposee.
- Les affixes audio sur le meme formative modifient le meme evenement sonore.
- La premiere passe IKAL lit les affixes audio en Slot VII. Un affixe audio reconnu en Slot V produit un diagnostic.
- Les proprietes de source restent portees par le mot de base : densite, mouvement, multiplicite, essence representative, etc.
- Les effets audio sont limites a environ 3 affixes actifs par evenement au debut.
- Les effets incompatibles avec une famille sonore doivent produire un diagnostic lisible.

## Verification morphologique

La grammaire New Ithkuil permet d'empiler plusieurs affixes `VXCS` en Slot V ou Slot VII d'un formative. `@zsnout/ithkuil` represente un affixe simple sous la forme :

```js
{
  cs: "ţm",
  type: 1,
  degree: 7
}
```

Pour IKAL, on part sur une regle simple :

| Element | Decision IKAL initiale |
| --- | --- |
| Slot | Slot VII par defaut, car l'affixe doit porter sur la source + ses proprietes `Ca` |
| Type | Type 1 par defaut |
| Degre | 1 a 9 |
| Intensite moteur | absence = `0.0`, degre 1 = `0.1`, ..., degre 9 = `0.9` |
| Affixe inverse | absence = `0.0`, degre 1 = `0.9`, ..., degre 9 = `0.1` |
| Type 3 | non supporte au debut, car il modifie un affixe adjacent et complique l'inspecteur |

Attention : en Ithkuil, les degres ne sont pas toujours une simple montee d'intensite. Certains affixes sont inverses ou en grille 3x3. IKAL accepte les affixes inverses si leur sens est bon, mais la conversion doit etre explicite dans la doc et dans le code.

## Premiere proposition

La premiere passe ne doit pas chercher a remplacer chaque effet DSP par un mot. Elle doit choisir quelques intentions sonores assez generales.

| Effet IKAL | Affixe New Ithkuil | Sens officiel utile | Mapping moteur initial | Compatibilite initiale | Statut |
| --- | --- | --- | --- | --- | --- |
| `intensity` | `ITY`, `cs: ţm` | mild -> intense -> overly intense | `drive`, saturation douce, gain compresse | toutes les voix | a retenir |
| `random-modulation` | `MDL`, `cs: jm` | modulation aleatoire faible -> excessive | jitter temporel, modulation de hauteur, instabilite de grain | `noise`, `roll`, `breath`; prudent sur `click` | a retenir |
| `force` | `FRC`, `cs: sm` | soft/delicat -> violent/rough | attaque plus dure, rugosite, accent transient | `click`, `impact`, `noise`; prudent sur `breath` | a retenir |
| `degradation` | `OPF`, `cs: řč` | brise / endommage -> excellent etat | bitcrush, signal casse, dropout, tear | toutes les voix, mais limite a un seul degradeur | retenu, inverse |
| `instability` | `FLS`, `cs: mh` | instable/random -> stable | instabilite globale, wobble, gate aleatoire | `noise`, `roll`; prudent ailleurs | retenu, inverse |
| `reverb` | `DTS`, `cs: mp` | rupture nette -> transition tres graduelle | reverb wet, decay, queue diffuse | toutes les voix, prudent avec `degradation` forte | retenu |

Decision : la premiere passe audio retient `ITY`, `MDL`, `FRC`, `OPF`, `FLS` et `DTS`.

### Pourquoi ces noms ne sont pas `distortion`, `bitcrush`, etc.

IKAL ne doit pas devenir une liste de noms de plugins audio en Ithkuil. Les affixes de langage decrivent plutot une intention :

- `intensity` peut produire du drive, de la saturation et une compression douce ;
- `force` peut produire une attaque plus agressive et de la rugosite ;
- `degradation` peut produire du bitcrush ou de la casse numerique ;
- `random-modulation` peut produire du jitter ou une modulation instable.
- `reverb` peut produire une traine de reverberation, un signal plus humide et une queue diffuse.

Le moteur garde le droit de traduire une intention en plusieurs traitements DSP, tant que la documentation reste claire.

## Decisions de mapping

### Degres inverses

`OPF` et `FLS` sont retenus, meme si leurs degres ne montent pas dans le sens "plus d'effet".

Exemple pour `OPF` :

```text
degre 1 = tres casse / disintegre
degre 9 = excellent etat
```

Pour IKAL :

```text
degradation = (10 - degree) / 10
instability = (10 - degree) / 10
```

Donc `OPF/1` produit une degradation forte, `OPF/9` presque aucune degradation. L'absence d'affixe reste `0.0`.

### Reverb

Il existe une racine Ithkuil reelle `dvw` pour `echo/reverberation`. Cette racine sera utile plus tard pour un mot IKAL dedie a l'echo ou a la reverberation.

Pour l'etape 4, on a besoin d'un effet cumulable sur le meme mot sonore. On retient donc `DTS`, parce que ses degres decrivent la duree / gradualite d'une transition :

```text
degre 1 = rupture nette, pas de traine perceptible
degre 9 = transition tres graduelle, traine longue
```

Mapping IKAL :

```text
reverb = degree / 10
```

Ce n'est pas "la racine reverb transformee en affixe". C'est une decision IKAL : `DTS` controle la traine reverberante du son.

## Grammaire ouverte : decomposition des formes

Depuis l'Etape 7, le runtime navigateur DECOMPOSE toute forme tapee : racine + slots + affixes + degres, via le sous-ensemble morphologique extrait de `@zsnout/ithkuil` (`src/parser/generated/ithkuil-runtime.js`, regenere par `npm run generate:ithkuil-runtime`). Plus aucune liste de formes pre-generees n'est consultee : n'importe quelle source sonore connue x n'importe quels affixes connus x n'importe quels degres est lue par decomposition, y compris une combinaison jamais ecrite auparavant.

La grammaire reste fermee — les mots-cles sont les racines `ļt`, `čxw`, `lxr`, `psw`, `bj`, les affixes `ITY`, `MDL`, `FRC`, `OPF`, `FLS`, `DTS` et les degres 1 a 9 — mais ses combinaisons sont illimitees. Les garde-fous restent des regles du langage : maximum 3 effets audio actifs, compatibilite par famille sonore, diagnostics lisibles meme sur des formes jamais vues.

L'ancien manifest est devenu une fixture de test (`tests/fixtures/ikal-audio-affixed-forms.js`, regeneree par `npm run generate:audio-affixes`) : les tests verifient que chaque forme enumeree se decompose exactement vers la verite enregistree, et que le runtime extrait decompose comme la bibliotheque de reference.

L'editeur propose ces formes via l'autocompletion, et sait composer a la volee une combinaison libre (voir [Syntaxe](syntaxe.md)). L'inspecteur affiche la decomposition affixe/degre/valeur, par exemple `ITY/7 intensity = 0.7`, pour n'importe quelle forme valide.

| Forme | Lecture IKAL |
| --- | --- |
| `ļtaloţma` | clic + `ITY/7` -> `intensity = 0.7` |
| `ļtalumpa` | clic + `DTS/9` -> `reverb = 0.9` |
| `ačxwužumpa` | bruit dynamique + `DTS/9` -> `reverb = 0.9` |
| `ļtalöjma` | clic + `MDL/6` -> `randomModulation = 0.6` |
| `ļtalüsma` | clic + `FRC/8` -> `force = 0.8` |
| `ļtalařča` | clic + `OPF/1` -> `degradation = 0.9` |
| `ļtalämha` | clic + `FLS/2` -> `instability = 0.8` |
| `ļtalompa` | clic + `DTS/7` -> `reverb = 0.7` |
| `ļtaloţmařčompa` | clic + `ITY/7` + `OPF/1` + `DTS/7` |
| `ļtaloţmöjmüsmařča` | quatre affixes audio ; produit le diagnostic `too-many-audio-effects` |
| `ļtaţmolla` | `ITY/7` en Slot V ; produit le diagnostic `unsupported-audio-affix-slot` |

Les requetes ASCII utiles dans l'editeur sont : `ity`, `ity7`, `mdl`, `frc`, `opf`, `fls`, `dts`, `dts9`, `intensity`, `random`, `force`, `degr`, `instability`, `reverb`.

### Effet fantome / espace

L'effet `ghost` actuel vient deja de `Ca.essence = RPV`. Il ressemble plus a une propriete de representation de la source qu'a un effet audio applique apres coup.

Decision : ne pas creer d'affixe `ghost` en etape 4. Garder `RPV` comme source fantomatique. La reverb devient un effet separe via `DTS`.

### Densite, mouvement, rugosite

`density`, `motion` et une partie de `roughness` doivent rester des proprietes de source quand c'est possible :

- `Ca.configuration` -> multiplicite / densite ;
- `Function DYN` -> mouvement ;
- racine / famille sonore -> texture de base.

Les affixes audio ne doivent pas dupliquer ces informations sauf si l'intention sonore est vraiment differente.

## Candidates repoussees

| Affixe | Pourquoi pas maintenant |
| --- | --- |
| `AUR`, `cs: -cj` | parle de "son de X", utile plus tard pour l'imitation/timbre, mais pas un effet simple |
| `CAM`, `cs: ḑç` | contient bass/baritone/treble/loudness/resonance, mais c'est une grille heterogene, plutot instrument/source |
| `OPL`, `cs: dç` | tres interessant pour attaque/duree, mais c'est plutot une enveloppe de source qu'un effet audio |
| `NPE`, `cs: cv` | utile plus tard pour une taille d'espace ou un volume percu, mais trop large pour porter seul la reverb initiale |
| `STR`, `cs: lm` | proche de `intensity`, risque de doublon avec `ITY` dans la premiere passe |

## Sources

- Grammaire New Ithkuil : https://ithkuil.net
- Document officiel `VXCS Affixes for New Ithkuil`, version 1.1.2 : https://ithkuil.net/affixes_v_1_1.pdf
- `@zsnout/ithkuil` 0.1.122 : format local verifie pour generation/parsing d'affixes (`cs`, `type`, `degree`, `slotVAffixes`, `slotVIIAffixes`).
