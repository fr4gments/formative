export { sampleBytebeat } from "./poc-bytebeat.js";
export { sampleFloatAudio } from "./poc-float-audio.js";

const DEFAULT_PROCESSOR_URL = "./src/engines/poc-music-processor.js";

export function createPocMusic({
  win = window,
  processorUrl = DEFAULT_PROCESSOR_URL,
} = {}) {
  let sequence = [];
  let stepCourant = 0;
  let actx = null;
  let node = null;
  let startPromise = null;

  function resetClock() {
    stepCourant = 0;
  }

  function sendToProcessor(message) {
    if (node) {
      node.port.postMessage(message);
    }
  }

  function setSequence(nextSequence) {
    sequence = nextSequence;
    resetClock();
    sendToProcessor({ type: "setSequence", sequence });
  }

  function clearSequence() {
    sequence = [];
    resetClock();
    sendToProcessor({ type: "clearSequence" });
  }

  function getVisualProgram() {
    const n = sequence.length;
    return n === 0 ? null : n === 1 ? sequence[0] : sequence[stepCourant];
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
            stepCourant = event.data.step;
          }
        };
        node.connect(actx.destination);
        sendToProcessor({ type: "setSequence", sequence });
      });
    }

    await startPromise;

    if (actx.state === "suspended") {
      await actx.resume();
    }
  }

  return {
    clearSequence,
    getCurrentStep: () => stepCourant,
    getSequence: () => sequence,
    getVisualProgram,
    setSequence,
    start,
  };
}
