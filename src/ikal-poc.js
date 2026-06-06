import { createPocAnimation } from "./engines/poc-animation.js";
import { createPocImage } from "./engines/poc-image.js";
import { createPocMusic } from "./engines/poc-music.js";
import { parseProgramme } from "./parser/poc-parser.js";

export function createIkalPocApp({
  cmd,
  readout,
  runButton,
  screen,
  stillButton,
  parse = parseProgramme,
  createMusic = createPocMusic,
  createAnimation = createPocAnimation,
  createImage = createPocImage,
}) {
  const music = createMusic();
  const animation = createAnimation({
    screen,
    getProgram: music.getVisualProgram,
    getPrograms: music.getVisualPrograms,
  });
  const image = createImage({ screen });

  function statsForLayers(layers) {
    return {
      layerCount: layers.length,
      wordCount: layers.reduce((sum, layer) => sum + layer.sequence.length, 0),
    };
  }

  function firstProgramsForLayers(layers) {
    return layers
      .map((layer) => layer.sequence[0])
      .filter(Boolean);
  }

  function silence() {
    music.clearSequence();
    animation.resume();
    readout.textContent = "— silence —";
    readout.className = "";
  }

  function lance(str) {
    const result = parse(str);

    if (result.error) {
      readout.textContent = "✗ " + result.error;
      readout.className = "err";
      return;
    }

    if (result.stop) {
      silence();
      return;
    }

    const layers = result.layers || [{ sequence: result.sequence, text: result.text }];
    animation.resume();
    Promise.resolve(music.start()).catch((error) => {
      readout.textContent = "✗ audio : " + error.message;
      readout.className = "err";
    });
    music.setLayers(layers);

    if (layers.length === 1 && result.sequence.length === 1) {
      const p = result.sequence[0];
      const sfx = p.suffixes.length
        ? "   [" + p.suffixes.map((suffix) => "-" + suffix).join(" ") + "]"
        : "";
      readout.textContent = "▶ " + p.text + "   →   " + p.gloss + sfx;
    } else if (layers.length === 1) {
      readout.textContent = "▶ " + result.text + "   ·   boucle de " + result.sequence.length + " pas";
    } else {
      const stats = statsForLayers(layers);
      readout.textContent = "▶ " + stats.layerCount + " couches   ·   " + stats.wordCount + " mots superposés";
    }

    readout.className = "ok";
  }

  function imageFixe(str) {
    const result = parse(str);

    if (result.error) {
      readout.textContent = "✗ " + result.error;
      readout.className = "err";
      return;
    }

    if (result.stop) {
      silence();
      return;
    }

    music.clearSequence();
    animation.pause();

    const { cols, rows } = animation.getSize();
    const layers = result.layers || [{ sequence: result.sequence, text: result.text }];
    const programs = firstProgramsForLayers(layers);

    image.draw({
      cols,
      rows,
      programs,
    });

    if (programs.length === 1) {
      readout.textContent = "▣ image fixe : " + programs[0].text + "   →   " + programs[0].gloss;
    } else {
      readout.textContent = "▣ image fixe : " + programs.length + " couches superposées";
    }

    readout.className = "ok";
  }

  function start() {
    cmd.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        lance(cmd.value);
      } else if (event.key === "Escape") {
        silence();
      }
    });

    runButton?.addEventListener("click", () => {
      lance(cmd.value);
      cmd.focus();
    });

    stillButton?.addEventListener("click", () => {
      imageFixe(cmd.value);
      cmd.focus();
    });

    cmd.focus();
    animation.start();
  }

  return {
    imageFixe,
    lance,
    silence,
    start,
  };
}

export function startIkalPocApp(doc = document) {
  const app = createIkalPocApp({
    cmd: doc.getElementById("cmd"),
    readout: doc.getElementById("readout"),
    runButton: doc.getElementById("run"),
    screen: doc.getElementById("screen"),
    stillButton: doc.getElementById("still"),
  });

  app.start();
  return app;
}
