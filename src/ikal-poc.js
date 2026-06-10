import { createIkalAutocomplete } from "./editor/ikal-autocomplete.js";
import { createFieldVisual } from "./engines/field-visual.js";
import { createPocAnimation } from "./engines/poc-animation.js";
import { createPocMusic } from "./engines/poc-music.js";
import { parseIkalProgram } from "./parser/ikal-parser.js";

export function createIkalPocApp({
  autocompletePanel,
  cmd,
  readout,
  runButton,
  screen,
  stillButton,
  parse = parseIkalProgram,
  createMusic = createPocMusic,
  createAnimation = createPocAnimation,
  createVisual = createFieldVisual,
  createAutocomplete = createIkalAutocomplete,
}) {
  const music = createMusic();
  let activeAnimationLayers = [];
  // Animation POC : conservée pour le vocabulaire POC historique et l'écran
  // de repos. Les couches IKAL visuelles passent par le moteur en champs.
  const animation = createAnimation({
    screen,
    getProgram: (frame = 0) => animationProgramsForLayers(activeAnimationLayers, frame)[0] || null,
    getPrograms: (frame = 0) => animationProgramsForLayers(activeAnimationLayers, frame),
  });
  const visual = createVisual({ screen });
  const autocomplete = createAutocomplete({
    panel: autocompletePanel,
    textarea: cmd,
  });

  function statsForLayers(layers) {
    return {
      layerCount: layers.length,
      wordCount: layers.reduce((sum, layer) => sum + layer.sequence.length, 0),
    };
  }

  function formatCount(count, singular, plural) {
    return String(count) + " " + (count === 1 ? singular : plural);
  }

  function formatModeStats(label, layers) {
    const stats = statsForLayers(layers);
    return label + " " +
      formatCount(stats.layerCount, "couche", "couches") + " / " +
      formatCount(stats.wordCount, "mot", "mots");
  }

  function readoutForRoutedLayers(routedLayers, visualMode) {
    return "▶ " + [
      formatModeStats("musique", routedLayers.musicLayers),
      formatModeStats("image", routedLayers.imageLayers),
      formatModeStats("animation", routedLayers.animationLayers),
      "visuel " + (visualMode || "aucun"),
    ].join("   ·   ");
  }

  function allProgramsForLayers(layers) {
    return layers
      .flatMap((layer) => layer.sequence)
      .filter(Boolean);
  }

  function animationProgramsForLayers(layers, frame = 0) {
    const step = Math.floor(frame / 24);

    return layers
      .map((layer) => {
        const sequence = layer.sequence || [];

        if (sequence.length === 0) {
          return null;
        }

        return sequence[step % sequence.length];
      })
      .filter(Boolean);
  }

  function lastVisualMode(layers) {
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i].mode === "image" || layers[i].mode === "animation") {
        return layers[i].mode;
      }
    }

    return null;
  }

  function layersForResult(result) {
    const layers = result.layers || [{ sequence: result.sequence || [], text: result.text || "" }];
    const hasTypedLayers = Array.isArray(result.musicLayers) ||
      Array.isArray(result.imageLayers) ||
      Array.isArray(result.animationLayers);

    if (!hasTypedLayers) {
      return {
        allLayers: layers,
        animationLayers: layers,
        imageLayers: layers,
        legacyVisual: true,
        musicLayers: layers,
      };
    }

    return {
      allLayers: layers,
      animationLayers: result.animationLayers || [],
      imageLayers: result.imageLayers || [],
      legacyVisual: result.sourceSyntax === "poc",
      musicLayers: result.musicLayers || [],
    };
  }

  function renderLaunchVisual(routedLayers) {
    const visualMode = lastVisualMode(routedLayers.allLayers);

    if (visualMode === "image") {
      activeAnimationLayers = [];
      animation.pause();
      const { cols, rows } = animation.getSize();
      visual.drawStill({
        cols,
        layers: routedLayers.imageLayers,
        rows,
      });
      return "image";
    }

    if (visualMode === "animation" && !routedLayers.legacyVisual) {
      activeAnimationLayers = [];
      animation.pause();
      const { cols, rows } = animation.getSize();
      visual.animate({
        cols,
        layers: routedLayers.animationLayers,
        rows,
      });
      return "animation";
    }

    activeAnimationLayers = visualMode === "animation" || routedLayers.legacyVisual
      ? routedLayers.animationLayers
      : [];
    visual.clear();
    animation.resume();
    animation.dessine?.();
    return visualMode || (activeAnimationLayers.length ? "animation" : null);
  }

  function silence() {
    activeAnimationLayers = [];
    music.clearSequence();
    visual.clear();
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

    const routedLayers = layersForResult(result);
    const layers = routedLayers.allLayers;
    const visualMode = renderLaunchVisual(routedLayers);
    Promise.resolve(music.start()).catch((error) => {
      readout.textContent = "✗ audio : " + error.message;
      readout.className = "err";
    });
    music.setLayers(routedLayers.musicLayers);

    if (layers.some((layer) => layer.implicitMode === false)) {
      readout.textContent = readoutForRoutedLayers(routedLayers, visualMode);
    } else if (layers.length === 1 && result.sequence.length === 1) {
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
    activeAnimationLayers = [];
    animation.pause();

    const { cols, rows } = animation.getSize();
    const routedLayers = layersForResult(result);
    const programs = allProgramsForLayers(routedLayers.imageLayers);

    visual.drawStill({
      cols,
      layers: routedLayers.imageLayers,
      rows,
    });

    if (programs.length === 1) {
      readout.textContent = "▣ image fixe : " + programs[0].text + "   →   " + programs[0].gloss;
    } else if (programs.length === 0) {
      readout.textContent = "▣ image fixe : aucune couche lyala:";
    } else {
      readout.textContent = "▣ image fixe : " +
        formatCount(routedLayers.imageLayers.length, "couche", "couches") +
        " / " +
        formatCount(programs.length, "mot", "mots");
    }

    readout.className = "ok";
  }

  function start() {
    cmd.addEventListener("keydown", (event) => {
      if (autocomplete.handleKeyDown(event)) {
        return;
      }

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
    autocomplete,
    imageFixe,
    lance,
    silence,
    start,
  };
}

export function startIkalPocApp(doc = document) {
  const app = createIkalPocApp({
    autocompletePanel: doc.getElementById("suggestions"),
    cmd: doc.getElementById("cmd"),
    readout: doc.getElementById("readout"),
    runButton: doc.getElementById("run"),
    screen: doc.getElementById("screen"),
    stillButton: doc.getElementById("still"),
  });

  app.start();
  return app;
}
