# Musique — tons et motifs

> Étape 6 du MVP. Cette page décrit comment on écrit de la musique en IKAL, et
> **pourquoi** chaque trait morphologique d'un mot Ithkuil veut dire ce qu'il
> veut dire (la base sémantique).

## Le principe : un mot = un motif

Comme un mot **visuel** ne décrit pas un pixel mais un **champ entier**, un mot
**musical** ne décrit pas une note mais une **phrase entière** — un *motif*.

```text
un mot Ithkuil enrichi = un motif mélodique complet
2 ou 3 mots = une mélodie
```

On ne pose donc pas chaque note : on **sculpte la forme** de la ligne (départ,
sens, intervalle, nombre de notes). Le prix assumé : pas de contrôle note-à-note
arbitraire — on obtient des lignes régulières (gammes, arpèges, ondulations),
voulues et reproductibles. C'est de l'art génératif, cohérent avec le moteur
visuel.

## La base sémantique

Tout part d'un principe IKAL : **l'effet d'un mot découle de son sens Ithkuil
réel**. En musique, ça se décline ainsi.

### Le timbre vient du SENS de la racine

Chaque timbre est une **vraie racine Ithkuil** dont le sens *est* le caractère
sonore. Pas de réglage abstrait « timbre » : on choisit un mot dont le sens
sonne.

| Timbre | Racine | Sens Ithkuil (lexique officiel) | Forme de base |
| --- | --- | --- | --- |
| résonnant | `mžv` | sonorous/resonant sound | `amžvala` |
| cloche / métal | `žb` | ringing/chiming/clanging | `žbala` |
| drone / grave | `řż` | low hum/whir/rumble | `ařżala` |
| blip / électronique | `žd` | zap/buzz/beep/ping | `ždala` |
| chant / voix | `lly` | sing/song | `allyala` |

La synthèse de chacun découle de ce sens : `žb` (cloche) est faite de **partiels
inharmoniques** (rapports non entiers — la signature acoustique d'un métal) ;
`řż` (drone) est presque une onde pure et sombre ; `mžv` (résonnant) empile des
harmoniques chaudes ; etc.

Le lexique contient d'autres racines « son » : on pourra étendre la palette. Les
racines **bruitées** (`mň` cri, `çţ` souffle, `řļ` grincement…) ne sont pas des
timbres mélodiques — elles iront à la couche texture / rythme.

### La forme du motif vient de la morphologie

C'est là que la densité d'Ithkuil paie : un seul mot encode toute la forme.

| Trait du mot | Dimension musicale | Pourquoi (iconicité) |
| --- | --- | --- |
| **affixe « départ »** (`lc`), degré 1-9 | 1re note dans la gamme | un degré gradué = une marche dans l'échelle |
| **affixe « contour »** (`fb`), degré | sens : montant / ondulant / descendant | « poussée » vers le haut (degré bas) ↔ vers le bas (degré haut) |
| **affixe « intervalle »** (`řks`), degré | par pas ↔ par sauts (arpège) | tassé (petits intervalles) ↔ épars (grands) |
| **Configuration** | nombre de notes du motif | solitude → essaim : 1 note → plusieurs |
| **Function** (STA / DYN) | accord (simultané) ↔ arpège (déployé) | statique ↔ déployé dans le temps |
| **Stem** (1 / 2 / 3) | octave : grave / médium / aigu | registre |
| **Affiliation** | consonance ↔ dissonance | membres alignés (CSL/ASO) ↔ divergents (VAR) |

!!! note "Convention assumée"
    Ithkuil n'a **pas** de gamme musicale intégrée (vérifié dans le lexique).
    Les affixes de forme `départ` / `contour` / `intervalle` sont donc des
    **conventions IKAL** (comme les affixes d'effet `ITY` / `DTS`) : on choisit
    un Cs et le degré règle un paramètre. En revanche le **registre** (Stem), le
    **nombre** (Configuration), l'**accord/arpège** (Function) et la
    **consonance** (Affiliation) reposent sur de vraies catégories Ithkuil.

## La gamme

Au MVP : **pentatonique majeure**, 5 notes — demi-tons `{0, 2, 4, 7, 9}`
(Do Ré Mi Sol La). C'est « difficile de faire faux », idéal pour explorer sans
oreille musicale. Un degré entier quelconque (même négatif) tombe sur une note
pentatonique : l'échelle se prolonge à toutes les octaves.

**Réservé pour plus tard** : les 7 autres demi-tons `{1, 3, 5, 6, 8, 10, 11}`
(Do♯ Ré♯ Fa Fa♯ Sol♯ La♯ Si), qui complètent vers le chromatique (12 notes) et
apportent demi-tons et dissonances.

## Comment on l'écrit

Une couche musique se déclare avec l'en-tête **`alkala:`**, et ses lignes sont
indentées (l'éditeur indente automatiquement après l'en-tête).

Les formes des tons portent des diacritiques (`ž`, `ř`…) **intapables**
directement. Comme partout dans IKAL, on **tape l'approximation ASCII** et
l'éditeur suggère la vraie forme, qu'on insère avec **Tab** ou **Entrée**.

- l'**octave** se lit à la première lettre : `amžvala` (grave) · `emžvala`
  (médium) · `umžvala` (aigu) ;
- tape `emz` → `emžvala`, `emžvuža`… ; `zb` → `žbala` (cloche) ; `arz` →
  `ařżala` (drone) ; `zd` → `ždala` (blip) ; `ally` → `allyala` (chant) ;
- des **alias sémantiques** marchent aussi : `cloche`, `drone`, `chant`… ;
- pour viser une forme précise, tape plus de lettres (sans diacritiques) :
  `emzvuza` → `emžvuža`.

Chaque suggestion affiche la lecture du motif, par exemple :

```text
ton · montant · pas · 3 notes · octave 2 · départ 1
```

et l'inspecteur re-décode n'importe quelle forme à hauteur déjà écrite.

### Exemple

```ikal
alkala:
  emžvuža emžvužëilcüfba emžvuželcëifbořksa
```

Trois mots, trois motifs au timbre résonnant (`mžv`) :

- `emžvuža` — montant, 3 notes : Do Ré Mi
- `emžvužëilcüfba` — départ 5, descendant : La Sol Mi
- `emžvuželcëifbořksa` — départ 3, ondulant, par sauts : Mi La Mi

→ une petite mélodie pentatonique en boucle.

## État (Étape 6, en cours)

- ✅ les 5 timbres, la hauteur (départ), le contour, l'intervalle, le nombre de
  notes (Configuration) et l'octave (Stem) sont jouables ;
- ⏳ accord vs arpège (Function) — pour l'instant tout est déployé en arpège ;
- ⏳ consonance / dissonance (Affiliation) entre couches ;
- ⏳ effets musicaux : enveloppe, filtre, espace (à côté des effets glitch
  existants — voir [Effets audio](effets-audio.md)).
