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

  function resetClock() {
    layerSteps = layers.map(() => 0);
  }

  function sendToProcessor(message) {
    if (node) {
      node.port.postMessage(message);
    }
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
    if (!actx) {
      actx = new (win.AudioContext || win.webkitAudioContext)();
    }

    if (!startPromise) {
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
    setLayers,
    setSequence,
    start,
  };
}
