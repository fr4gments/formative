// Rendu canvas du moteur en champs (validé via prototypes/render-canvas.html).
//
// Mêmes glyphes ASCII que le rendu <pre>, mais DESSINÉS :
// - les glyphes colorés vont dans un canvas hors écran (une passe de texte) ;
// - l'aberration chromatique = deux silhouettes teintées rose / cyan décalées
//   de ±0.7px, composées par-dessus (équivalent de l'ancien text-shadow CSS,
//   mais payé en copies d'image, pas en peinture par glyphe) ;
// - le saturate(1.3) contrast(1.12) de l'ancien CSS est appliqué aux couleurs
//   des runs au moment du dessin : même teinte finale, zéro filtre par frame.
//
// Pourquoi : réécrire le HTML du <pre> à chaque frame recréait des milliers de
// nœuds DOM par seconde (mémoire qui gonfle, pauses GC, interface qui rame).

const FONT_STACK = '"DejaVu Sans Mono", "Menlo", "Consolas", monospace';
const ABERRATION_PINK = "rgba(255,47,179,0.34)";
const ABERRATION_CYAN = "rgba(0,239,255,0.30)";

function quantize(channel) {
  return Math.min(255, Math.round(channel / 24) * 24);
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

// Équivalent couleur du CSS `filter: saturate(1.3) contrast(1.12)`.
function bakeCssFilter(r, g, b) {
  const mean = (r + g + b) / 3;
  const channels = [r, g, b].map((c) => {
    const saturated = mean + (c - mean) * 1.3;
    return clampChannel((saturated - 128) * 1.12 + 128);
  });
  return "rgb(" + channels.join(",") + ")";
}

function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function measureCell(fontSize = 15) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = fontSize + "px " + FONT_STACK;
  return {
    height: fontSize,
    width: ctx.measureText("0").width || fontSize * 0.6,
  };
}

export function createCanvasAsciiRenderer({ canvas, fontSize = 15 }) {
  const ctx = canvas.getContext("2d");
  const textLayer = document.createElement("canvas");
  const textCtx = textLayer.getContext("2d");
  const tintLayer = document.createElement("canvas");
  const tintCtx = tintLayer.getContext("2d");
  const colorCache = new Map();
  const cell = measureCell(fontSize);
  let cols = 0;
  let rows = 0;
  let dpr = 1;

  function styledColor(r, g, b) {
    const key = (r << 16) | (g << 8) | b;
    let styled = colorCache.get(key);

    if (!styled) {
      styled = bakeCssFilter(r, g, b);
      colorCache.set(key, styled);
    }

    return styled;
  }

  function ensureSize(frame) {
    const nextDpr = window.devicePixelRatio || 1;

    if (frame.cols === cols && frame.rows === rows && nextDpr === dpr) {
      return;
    }

    cols = frame.cols;
    rows = frame.rows;
    dpr = nextDpr;

    const width = Math.ceil(cols * cell.width);
    const height = Math.ceil(rows * cell.height);

    for (const layer of [canvas, textLayer]) {
      layer.width = Math.ceil(width * dpr);
      layer.height = Math.ceil(height * dpr);
    }

    // L'aberration est un fantôme flou : demi-résolution, 4× moins de pixels
    // à copier, l'agrandissement au composite adoucit la silhouette.
    tintLayer.width = Math.ceil((width * dpr) / 2);
    tintLayer.height = Math.ceil((height * dpr) / 2);

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function drawGlyphs(frame) {
    textCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    textCtx.clearRect(0, 0, cols * cell.width, rows * cell.height);
    textCtx.font = fontSize + "px " + FONT_STACK;
    textCtx.textBaseline = "top";

    for (let row = 0; row < frame.cells.length; row++) {
      const line = frame.cells[row];
      const y = row * cell.height;
      let runColor = null;
      let runText = "";
      let runStart = 0;

      for (let col = 0; col < line.length; col++) {
        const cellData = line[col];
        const blank = cellData.ch === " ";
        const key = blank
          ? null
          : styledColor(quantize(cellData.color[0]), quantize(cellData.color[1]), quantize(cellData.color[2]));

        if (key !== runColor) {
          if (runText && runColor !== null) {
            textCtx.fillStyle = runColor;
            textCtx.fillText(runText, runStart * cell.width, y);
          }

          runColor = key;
          runText = "";
          runStart = col;
        }

        runText += cellData.ch;
      }

      if (runText && runColor !== null) {
        textCtx.fillStyle = runColor;
        textCtx.fillText(runText, runStart * cell.width, y);
      }
    }
  }

  function tinted(color) {
    tintCtx.setTransform(1, 0, 0, 1, 0, 0);
    tintCtx.globalCompositeOperation = "source-over";
    tintCtx.clearRect(0, 0, tintLayer.width, tintLayer.height);
    tintCtx.drawImage(textLayer, 0, 0, tintLayer.width, tintLayer.height);
    tintCtx.globalCompositeOperation = "source-in";
    tintCtx.fillStyle = color;
    tintCtx.fillRect(0, 0, tintLayer.width, tintLayer.height);
    return tintLayer;
  }

  // Déchirures horizontales optionnelles : des bandes de la passe de texte
  // copiées avec un décalage, stables ~0.4 s comme warpInto côté champs.
  function composeText(t, glitch) {
    const logicalW = cols * cell.width;
    const logicalH = rows * cell.height;

    if (!glitch) {
      ctx.drawImage(textLayer, 0, 0, logicalW, logicalH);
      return;
    }

    const bands = 26;
    const bandH = logicalH / bands;
    const tick = Math.floor(t * 2.4);

    for (let band = 0; band < bands; band++) {
      const roll = hash2(band, tick, 911);
      const dx = roll < 0.22 ? (hash2(band, 1, 912) - 0.5) * 26 : 0;
      const sy = band * bandH;
      ctx.drawImage(
        textLayer,
        0, sy * dpr, textLayer.width, bandH * dpr,
        dx, sy, logicalW, bandH,
      );
    }
  }

  function draw(frame, { t = 0, glitch = false } = {}) {
    ensureSize(frame);
    drawGlyphs(frame);

    const logicalW = cols * cell.width;
    const logicalH = rows * cell.height;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalW, logicalH);

    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(tinted(ABERRATION_PINK), 0.7, 0, logicalW, logicalH);
    ctx.drawImage(tinted(ABERRATION_CYAN), -0.7, 0, logicalW, logicalH);
    ctx.globalCompositeOperation = "source-over";
    composeText(t, glitch);
  }

  function clear() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return {
    cell,
    clear,
    draw,
  };
}
