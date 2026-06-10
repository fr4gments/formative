import { sampleFloatLayers } from "./poc-float-audio.js";

export { sampleBytebeat } from "./poc-bytebeat.js";
export { sampleFloatAudio, sampleFloatLayers } from "./poc-float-audio.js";

const DEFAULT_PROCESSOR_URL = "./src/engines/poc-music-processor.js";

function normalizeLayer(layer) {
  const sequence = Array.isArray(layer) ? layer : layer.sequence || [];

  return {
    sequence,
    text: Array.isArray(layer) ? sequence.map((program) => program.text).filter(Boolean).join(" ") : layer.text || "",
  };
}

function normalizeLayers(nextLayers) {
  return nextLayers
    .map(normalizeLayer)
    .filter((layer) => layer.sequence.length > 0);
}

export function createPocMusic({
  win = window,
  processorUrl = DEFAULT_PROCESSOR_URL,
} = {}) {
  let layers = [];
  let layerSteps = [];
  let actx = null;
  let node = null;
  let startPromise = null;
  let fallbackIndex = 0;
  let usingFallback = false;

  function resetClock() {
    layerSteps = layers.map(() => 0);
    fallbackIndex = 0;
  }

  function sendToProcessor(message) {
    node?.port?.postMessage(message);
  }

  function setLayers(nextLayers) {
    layers = normalizeLayers(nextLayers);
    resetClock();
    sendToProcessor({ type: "setLayers", layers });
  }

  function setSequence(nextSequence) {
    setLayers([{ sequence: nextSequence }]);
  }

  function clearSequence() {
    layers = [];
    resetClock();
    sendToProcessor({ type: "clearSequence" });
  }

  function getVisualPrograms() {
    return layers
      .map((layer, index) => {
        const sequence = layer.sequence;

        if (sequence.length === 0) {
          return null;
        }

        const step = layerSteps[index] || 0;
        return sequence[step % sequence.length];
      })
      .filter(Boolean);
  }

  function getVisualProgram() {
    return getVisualPrograms()[0] || null;
  }

  async function start() {
    const AudioContextImpl = win.AudioContext || win.webkitAudioContext;

    if (!AudioContextImpl) {
      throw new Error("Web Audio API indisponible dans ce navigateur");
    }

    if (!actx) {
      actx = new AudioContextImpl();
    }

    if (!startPromise) {
      // AudioWorklet n'existe qu'en contexte sécurisé : https, http://localhost
      // ou http://127.0.0.1 — pas file://, pas 0.0.0.0, pas une IP locale.
      // Hors contexte sécurisé : mode secours ScriptProcessorNode, même
      // synthèse calculée dans le thread principal.
      if (!actx.audioWorklet) {
        if (typeof actx.createScriptProcessor !== "function") {
          throw new Error(
            "AudioWorklet et ScriptProcessor indisponibles — ouvre l'app via http://localhost:8000",
          );
        }

        win.console?.warn?.(
          "IKAL audio : AudioWorklet indisponible (contexte non sécurisé), " +
          "mode secours ScriptProcessor actif. Pour la voie normale : http://localhost:8000",
        );
        usingFallback = true;
        fallbackIndex = 0;
        node = actx.createScriptProcessor(2048, 0, 1);
        node.onaudioprocess = (event) => {
          const channel = event.outputBuffer.getChannelData(0);

          for (let i = 0; i < channel.length; i++) {
            const sample = sampleFloatLayers(fallbackIndex / actx.sampleRate, layers, actx.sampleRate);
            channel[i] = sample.value;
            layerSteps = sample.steps;
            fallbackIndex++;
          }
        };
        node.connect(actx.destination);
        startPromise = Promise.resolve();
        await startPromise;

        if (actx.state === "suspended") {
          await actx.resume();
        }

        return;
      }

      startPromise = actx.audioWorklet.addModule(processorUrl).then(() => {
        node = new win.AudioWorkletNode(actx, "ikal-poc-music");
        node.port.onmessage = (event) => {
          if (event.data.type === "step") {
            layerSteps[0] = event.data.step;
          } else if (event.data.type === "layersStep") {
            layerSteps = event.data.steps;
          }
        };
        node.connect(actx.destination);
        sendToProcessor({ type: "setLayers", layers });
      }).catch((error) => {
        // Ne pas mettre l'échec en cache : un prochain « lancer » doit réessayer.
        startPromise = null;
        throw error;
      });
    }

    await startPromise;

    if (actx.state === "suspended") {
      await actx.resume();
    }
  }

  return {
    clearSequence,
    getCurrentStep: () => layerSteps[0] || 0,
    getLayers: () => layers,
    getSequence: () => layers[0]?.sequence || [],
    getVisualProgram,
    getVisualPrograms,
    isFallback: () => usingFallback,
    setLayers,
    setSequence,
    start,
  };
}
