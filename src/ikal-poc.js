import { createPocAnimation } from "./engines/poc-animation.js";
import { createPocImage } from "./engines/poc-image.js";
import { createPocMusic } from "./engines/poc-music.js";
import { parseProgramme } from "./parser/poc-parser.js";

export function createIkalPocApp({
  cmd,
  readout,
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
  });
  const image = createImage({ screen });

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

    animation.resume();
    Promise.resolve(music.start()).catch((error) => {
      readout.textContent = "✗ audio : " + error.message;
      readout.className = "err";
    });
    music.setSequence(result.sequence);

    if (result.sequence.length === 1) {
      const p = result.sequence[0];
      const sfx = p.suffixes.length
        ? "   [" + p.suffixes.map((suffix) => "-" + suffix).join(" ") + "]"
        : "";
      readout.textContent = "▶ " + p.text + "   →   " + p.gloss + sfx;
    } else {
      readout.textContent = "▶ " + result.text + "   ·   boucle de " + result.sequence.length + " pas";
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
    const program = result.sequence[0];

    image.draw({
      cols,
      rows,
      program,
    });

    readout.textContent = "▣ image fixe : " + program.text + "   →   " + program.gloss;
    readout.className = "ok";
  }

  function start() {
    cmd.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        lance(cmd.value);
      } else if (event.key === "Escape") {
        silence();
      }
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
    screen: doc.getElementById("screen"),
    stillButton: doc.getElementById("still"),
  });

  app.start();
  return app;
}
