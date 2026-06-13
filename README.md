# Formative / IKAL

> 🇫🇷 **Version française : [LISEZMOI.md](LISEZMOI.md)**

**IKAL** — *Ithkuil Kinetic Art Language* — is an experimental generative-art
language. You **type real [Ithkuil 4](https://ithkuil.net) word-forms**, and each
word's **meaning** drives generative output: still images, animation, and
procedural music, rendered as colored ASCII / text-mode visuals and
high-resolution audio.

> **Status: MVP in progress.**

## The idea

Ithkuil is an extraordinarily dense constructed language: a single morphological
word encodes dozens of semantic dimensions at once — shape, dynamism,
multiplicity, perspective, essence… Those dimensions are orthogonal, discrete,
and composable, which is exactly the structure a generative engine needs.

So in IKAL:

- one word → a bundle of parameters → an image, an animation, or a sound;
- a space → the next event in a sequence;
- a line → a layer; several lines → a composition.

As much as possible, a word's effect comes from its **real Ithkuil meaning**: a
root meaning "water / flow" streams; a root meaning "to break" fragments and
glitches.

## Run it

IKAL is **browser-first**: no build step, nothing to install for the app itself.
Because it uses ES modules and an AudioWorklet, it has to be *served* — opening
the HTML file directly will not work.

```bash
git clone https://github.com/<you>/formative.git
cd formative
npm run serve          # = python -m http.server 8000
```

Then open **http://localhost:8000**.

- Any modern browser works (Chrome, Firefox, Safari…).
- `npm run serve` only needs **Python 3** (its built-in static file server —
  nothing to install).
- Served from `localhost` (or any HTTPS URL), IKAL uses its high-resolution
  AudioWorklet audio path; in an insecure context it falls back automatically to
  an older Web Audio API, with the same synthesis.

### A first program

```
alkala:
  ļtala alxrasa ačxwuža

lyala:
  fřala ftala špala allwala
```

`alkala:` declares a **music** layer, `lyala:` a **still-image** layer, `lyula:`
an **animation** layer. Run it and it plays. The editor offers autocompletion
(type an ASCII approximation like `acxwu` and it inserts `ačxwuža`) and an
inspector that decomposes any word into its morphology.

## How it's built

- **Vanilla JavaScript (ES modules)** — no framework, no bundler at runtime.
- The browser app needs **no `node_modules`**: the Ithkuil morphology it relies
  on is a small, self-contained module extracted into
  `src/parser/generated/ithkuil-runtime.js`.
- **`src/parser/`** — decomposes typed Ithkuil forms into normalized parameters
  (the grammar is fixed; the combinations it accepts are unlimited).
- **`src/engines/`** — one unified field-based visual engine (colored ASCII: a
  still image is a frozen frame, an animation is the same field over time) and a
  Web Audio engine.
- **`src/editor/`** — multi-line editor, autocompletion, inspector.

## Develop

`node_modules` is only needed for tooling — tests and regenerating the embedded
runtime. The app itself never imports it.

```bash
npm install            # esbuild + @zsnout/ithkuil (development only)
npm test               # the full test suite (Node)
```

Regeneration scripts, when the grammar changes:

```bash
npm run generate:ithkuil-runtime    # re-extract the browser morphology runtime
npm run generate:audio-affixes      # regenerate the audio affix test fixtures
npm run generate:visual-affixes
npm run generate:affiliation-forms
```

## Documentation

The language reference lives in `docs/` (MkDocs):

```bash
npm run docs:serve     # local docs (MkDocs dev server)
```

## Credits

- Built on [@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil) (MIT) for real
  Ithkuil v4 morphology.
- Visual aesthetic inspired by
  [Andreas Gysin / ertdfgcvb](https://ertdfgcvb.xyz).
- Ithkuil 4 designed by John Quijada — [ithkuil.net](https://ithkuil.net).

## License

[MIT](LICENSE) © Fr4gments.

This repository also bundles a subset of
[@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil) (MIT) — see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).