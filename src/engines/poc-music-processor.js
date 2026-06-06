import { sampleFloatLayers } from "./poc-float-audio.js";

function normalizeLayer(layer) {
  const sequence = Array.isArray(layer) ? layer : layer.sequence || [];

  return {
    sequence,
    text: Array.isArray(layer) ? "" : layer.text || "",
  };
}

class IkalPocMusicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.layers = [];
    this.layerSteps = [];
    this.sampleIndex = 0;

    this.port.onmessage = (event) => {
      const message = event.data;

      if (message.type === "setSequence") {
        this.layers = [normalizeLayer(message.sequence)];
        this.resetClock();
      } else if (message.type === "setLayers") {
        this.layers = message.layers.map(normalizeLayer);
        this.resetClock();
      } else if (message.type === "clearSequence") {
        this.layers = [];
        this.resetClock();
      }
    };
  }

  resetClock() {
    this.sampleIndex = 0;
    this.setLayerSteps(this.layers.map(() => 0));
  }

  setLayerSteps(steps) {
    const changed = steps.length !== this.layerSteps.length ||
      steps.some((step, index) => step !== this.layerSteps[index]);

    if (changed) {
      this.layerSteps = steps;
      this.port.postMessage({
        type: "layersStep",
        step: steps[0] || 0,
        steps,
      });
    }
  }

  voixSon(time) {
    const sample = sampleFloatLayers(time, this.layers, sampleRate);
    this.setLayerSteps(sample.steps);
    return sample.value;
  }

  process(_inputs, outputs) {
    const output = outputs[0];
    const channel = output[0];

    for (let i = 0; i < channel.length; i++) {
      channel[i] = this.voixSon(this.sampleIndex / sampleRate);
      this.sampleIndex++;
    }

    return true;
  }
}

registerProcessor("ikal-poc-music", IkalPocMusicProcessor);
