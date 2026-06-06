import { sampleFloatAudio } from "./poc-float-audio.js";

class IkalPocMusicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.sequence = [];
    this.stepCourant = 0;
    this.sampleIndex = 0;

    this.port.onmessage = (event) => {
      const message = event.data;

      if (message.type === "setSequence") {
        this.sequence = message.sequence;
        this.resetClock();
      } else if (message.type === "clearSequence") {
        this.sequence = [];
        this.resetClock();
      }
    };
  }

  resetClock() {
    this.sampleIndex = 0;
    this.setStep(0);
  }

  setStep(step) {
    if (step !== this.stepCourant) {
      this.stepCourant = step;
      this.port.postMessage({ type: "step", step });
    }
  }

  voixSon(time) {
    const sample = sampleFloatAudio(time, this.sequence, sampleRate);
    this.setStep(sample.step);
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
