/*
Copyright (C) Bryan Hughes <bryan@nebri.us>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const NUM_WAVES = 4;

const leds = [];

let calculatePixelValue;

export async function initLED() {
  const response = await fetch('../calculatePixelValue.wasm');
  const buffer = await response.arrayBuffer();
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
  const env = {
    abortStackOverflow: (err) => { throw new Error(`overflow: ${err}`); },
    table: new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
    __table_base: 0,
    memory,
    __memory_base: 1024,
    STACKTOP: 0,
    STACK_MAX: memory.buffer.byteLength,
  };
  const mod = await WebAssembly.instantiate(buffer, { env });
  calculatePixelValue = mod.instance.exports._calculatePixelValue;
};

export function createLEDStrip(parentElement, numLeds) {
  function createDiv(className) {
    const div = document.createElement('div');
    div.setAttribute('class', className);
    return div;
  }

  leds.splice(0, leds.length);
  const displayLEDContainer = createDiv('display-led-container');
  const displayLEDOverlay = createDiv("display-led-overlay");
  for (let i = 0; i < numLeds; i++) {
    const displayLEDStack = createDiv('display-led-stack');
    const ledGroup = [];
    leds.push(ledGroup);
    for (let i = 0; i < NUM_WAVES; i++) {
      const displayLED = createDiv('display-led');
      ledGroup.unshift(displayLED);
      displayLEDStack.appendChild(displayLED);
    }
    displayLEDOverlay.appendChild(displayLEDStack);
  }
  displayLEDContainer.appendChild(displayLEDOverlay);
  parentElement.appendChild(displayLEDContainer);
};

let t;
export function getTime() {
  return t;
}

let updateInterval;
export function setLEDParameters(waveParameters) {
  function setLEDStripColors(colors) {
    for (let layer = 0; layer < leds.length; layer++) {
      for (let led = 0; led < NUM_WAVES; led++) {
        const ledElement = leds[layer][led];
        const color = colors[layer][led];
        ledElement.style = `background-color: rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
      }
    }
  }

  // Modified from https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
  function hsvToRgb(color){
    const [ h, s, v] = color;
    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch(i % 6){
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

  const startTime = Date.now();
  clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    const animationClock = Date.now() - startTime;
    if (!waveParameters.timePeriod) {
      waveParameters.timePeriod = 255;
    }
    if (!waveParameters.distancePeriod) {
      waveParameters.distancePeriod = 32;
    }
    const colors = [];
    t = animationClock % 25500;
    for (let i = 0; i < leds.length; i++) {
      const pixelColorLayers = [];

      for (let j = 0; j < NUM_WAVES; j++) {
        const x = Math.floor(255 * (i % waveParameters.distancePeriod) / waveParameters.distancePeriod);
        const wave = waveParameters.waves[j];
        const pixelColor = hsvToRgb([
          calculatePixelValue(
            wave.h.a,
            wave.h.w_t,
            wave.h.w_x,
            wave.h.phi,
            wave.h.b,
            t,
            x) / 255,
          calculatePixelValue(
            wave.s.a,
            wave.s.w_t,
            wave.s.w_x,
            wave.s.phi,
            wave.s.b,
            t,
            x) / 255,
          calculatePixelValue(
            wave.v.a,
            wave.v.w_t,
            wave.v.w_x,
            wave.v.phi,
            wave.v.b,
            t,
            x) / 255
        ]);
        pixelColorLayers[j] = {
          r: pixelColor[0],
          g: pixelColor[1],
          b: pixelColor[2],
          a: calculatePixelValue(
            wave.a.a,
            wave.a.w_t,
            wave.a.w_x,
            wave.a.phi,
            wave.a.b,
            t,
            x)
        };
      }
      colors[i] = pixelColorLayers;
    }
    setLEDStripColors(colors);
  }, 33);
};
