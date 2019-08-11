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

import { init, resetClock, getClock, calculatePixels } from './lib/rvl-node-animations.js';

const NUM_LEDS = 32;
const NUM_WAVES = 4;

const leds = [];

export async function initLED() {
  await init(NUM_WAVES, NUM_LEDS);
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
    const displayLED = createDiv('display-led');
    leds.push(displayLED);
    displayLEDOverlay.appendChild(displayLED);
  }
  displayLEDContainer.appendChild(displayLEDOverlay);
  parentElement.appendChild(displayLEDContainer);
};

export function getTime() {
  return getClock() % 25500;
}

let updateInterval;
export function setLEDParameters(waveParameters) {
  clearInterval(updateInterval);
  resetClock();
  updateInterval = setInterval(() => {
    const colors = calculatePixels(waveParameters);
    for (let led = 0; led < NUM_LEDS; led++) {
      const ledElement = leds[led];
      const color = colors[led];
      ledElement.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
  }, 33);
};
