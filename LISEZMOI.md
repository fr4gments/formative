# Formative / IKAL

> 🇬🇧 **English version: [README.md](README.md)**

**▶ Essayer en ligne : [fr4gments.github.io/formative](https://fr4gments.github.io/formative/)** — et la [référence du langage](https://fr4gments.github.io/formative/docs/).

**IKAL** — *Ithkuil Kinetic Art Language* — est un langage expérimental d'art
génératif. On **tape de vraies formes de mots [Ithkuil 4](https://ithkuil.net)**,
et le **sens** de chaque mot pilote une sortie générative : image fixe,
animation, et musique procédurale, rendues en visuels ASCII / mode texte en
couleur et en audio haute résolution.

> **État : MVP en cours.**

## L'idée

L'Ithkuil est une langue construite extraordinairement dense : un seul mot
morphologique encode des dizaines de dimensions de sens à la fois — forme,
dynamisme, multiplicité, perspective, essence… Ces dimensions sont orthogonales,
discrètes et composables : exactement la structure dont un moteur génératif a
besoin.

Donc dans IKAL :

- un mot → un paquet de paramètres → une image, une animation, ou un son ;
- une espace → l'événement suivant dans la séquence ;
- une ligne → une couche ; plusieurs lignes → une composition.

Autant que possible, l'effet d'un mot découle de son **vrai sens Ithkuil** : une
racine « eau / couler » ruisselle ; une racine « briser » fragmente et glitche.

## Lancer

IKAL est **browser-first** (tout tourne dans le navigateur) : aucune étape de
construction, rien à installer pour l'appli elle-même. Comme elle utilise des
modules ES et un AudioWorklet, elle doit être *servie* — ouvrir le fichier HTML
directement ne marchera pas.

```bash
git clone https://github.com/<toi>/formative.git
cd formative
npm run serve          # = python -m http.server 8000
```

Puis ouvrir **http://localhost:8000**.

- N'importe quel navigateur récent convient (Chrome, Firefox, Safari…).
- `npm run serve` a seulement besoin de **Python 3** (son serveur de fichiers
  intégré — rien à installer).
- Servie depuis `localhost` (ou n'importe quelle URL HTTPS), IKAL utilise sa voie
  audio haute résolution (AudioWorklet) ; dans un contexte non sécurisé, elle
  bascule automatiquement sur une API Web Audio plus ancienne, avec la même
  synthèse.

### Un premier programme

```
alkala:
  ļtala alxrasa ačxwuža

lyala:
  fřala ftala špala allwala
```

`alkala:` déclare une couche **musique**, `lyala:` une couche **image fixe**,
`lyula:` une couche **animation**. On lance, et ça joue. L'éditeur propose une
autocomplétion (tape une approximation ASCII comme `acxwu`, il insère `ačxwuža`)
et un inspecteur qui décompose n'importe quel mot en sa morphologie.

## Comment c'est construit

- **JavaScript vanilla (modules ES)** — pas de framework, pas d'outil de build au
  runtime.
- L'appli navigateur n'a besoin d'**aucun `node_modules`** : la morphologie
  Ithkuil sur laquelle elle s'appuie est un petit module autonome extrait dans
  `src/parser/generated/ithkuil-runtime.js`.
- **`src/parser/`** — décompose les formes Ithkuil tapées en paramètres
  normalisés (la grammaire est fixe ; les combinaisons qu'elle accepte sont
  illimitées).
- **`src/engines/`** — un seul moteur visuel en champs (ASCII couleur : l'image
  fixe est une frame figée, l'animation est le même champ au fil du temps) et un
  moteur Web Audio.
- **`src/editor/`** — éditeur multi-lignes, autocomplétion, inspecteur.

## Développer

`node_modules` ne sert qu'à l'outillage — les tests et la régénération du runtime
embarqué. L'appli elle-même ne l'importe jamais.

```bash
npm install            # esbuild + @zsnout/ithkuil (développement uniquement)
npm test               # toute la suite de tests (Node)
```

Scripts de régénération, quand la grammaire change :

```bash
npm run generate:ithkuil-runtime    # ré-extrait le runtime morphologique navigateur
npm run generate:audio-affixes      # régénère les fixtures de test des affixes audio
npm run generate:visual-affixes
npm run generate:affiliation-forms
```

## Documentation

La référence du langage vit dans `docs/` (MkDocs) :

```bash
npm run docs:serve     # doc en local (serveur de dev MkDocs)
```

## Crédits

- Construit sur [@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil) (MIT) pour
  la vraie morphologie Ithkuil v4.
- Esthétique visuelle inspirée d'[Andreas Gysin / ertdfgcvb](https://ertdfgcvb.xyz).
- Ithkuil 4 conçu par John Quijada — [ithkuil.net](https://ithkuil.net).

## Licence

[MIT](LICENSE) © Fr4gments.

Ce dépôt embarque aussi un sous-ensemble de
[@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil) (MIT) — voir
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).