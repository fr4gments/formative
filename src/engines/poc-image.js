import { applyVisualStyle, renderAsciiFrame, renderColorAsciiFrame } from "./poc-animation.js";

const DEFAULT_STILL_FRAME = 0;

export function renderAsciiImage({
  cols,
  rows,
  program,
  programs,
  frame = DEFAULT_STILL_FRAME,
}) {
  return renderAsciiFrame({
    cols,
    rows,
    frame,
    program,
    programs,
  });
}

export function renderColorAsciiImage({
  cols,
  rows,
  program,
  programs,
  frame = DEFAULT_STILL_FRAME,
}) {
  return renderColorAsciiFrame({
    cols,
    rows,
    frame,
    program,
    programs,
  });
}

export function createPocImage({ screen }) {
  function draw({ cols, rows, program, programs, frame = DEFAULT_STILL_FRAME }) {
    const image = renderColorAsciiImage({
      cols,
      rows,
      frame,
      program,
      programs,
    });

    applyVisualStyle(screen, programs || program, frame);
    screen.textContent = image;
    return image;
  }

  function clear() {
    screen.textContent = "";
  }

  return {
    clear,
    draw,
  };
}
