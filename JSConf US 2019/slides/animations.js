/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of Raver Lights Node Animations.

Raver Lights Node Animations is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Raver Lights Node Animations is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Raver Lights Node Animations.  If not, see <http://www.gnu.org/licenses/>.
*/

const EMPTY_WAVE_CHANNEL = { a: 0, w_t: 0, w_x: 0, phi: 0, b: 0 };

export function createEmptyWave() {
  return {
    h: { ...EMPTY_WAVE_CHANNEL },
    s: { ...EMPTY_WAVE_CHANNEL },
    v: { ...EMPTY_WAVE_CHANNEL },
    a: { ...EMPTY_WAVE_CHANNEL }
  }
}

export function createWaveParameters(wave1, wave2, wave3, wave4) {
  return {
    waves: [
      wave1 || createEmptyWave(),
      wave2 || createEmptyWave(),
      wave3 || createEmptyWave(),
      wave4 || createEmptyWave()
    ]
  };
}

function validateNum(num, min, max, name) {
  if (typeof num !== 'number' || num < min || num > max) {
    throw new Error(`Invalid ${name} ${num}. ` +
      `${name[0].toUpperCase() + name.substring(1)} must be a number between ${min} and ${max}`);
  }
}

export function createSolidColorWave(h, s, a) {
  validateNum(h, 0, 255, 'hue');
  validateNum(s, 0, 255, 'saturation');
  validateNum(a, 0, 255, 'alpha');
  const wave = createEmptyWave();
  wave.h.b = Math.round(h);
  wave.s.b = Math.round(s);
  wave.v.b = 255;
  wave.a.b = Math.round(a);
  return wave;
}

export function createColorCycleWave(rate, a) {
  validateNum(rate, 1, 32, 'rate');
  validateNum(a, 0, 255, 'alpha');
  const wave = createEmptyWave();
  wave.h.a = 255;
  wave.h.w_t = Math.round(rate);
  wave.h.w_x = 0;
  wave.s.b = 255;
  wave.v.b = 255;
  wave.a.b = Math.round(a);
  return wave;
}

export function createMovingWave(h, s, rate, spacing) {
  validateNum(rate, 0, 32, 'rate');
  validateNum(spacing, 1, 16, 'spacing');
  validateNum(h, 0, 255, 'hue');
  validateNum(s, 0, 255, 'saturation');
  const wave = createEmptyWave();
  wave.h.b = Math.round(h);
  wave.s.b = Math.round(s);
  wave.v.b = 255;
  wave.a.a = 255;
  wave.a.w_t = Math.round(rate);
  wave.a.w_x = Math.round(spacing);
  return wave;
}

export function createPulsingWave(h, s, rate) {
  validateNum(rate, 1, 32, 'rate');
  validateNum(h, 0, 255, 'hue');
  validateNum(s, 0, 255, 'saturation');
  const wave = createEmptyWave();
  wave.h.b = Math.round(h);
  wave.s.b = Math.round(s);
  wave.v.b = 255;
  wave.a.w_t = Math.round(rate);
  wave.a.a = 255;
  return wave;
}

export function createRainbowWave(a, rate) {
  validateNum(rate, 1, 32, 'rate');
  validateNum(a, 0, 255, 'alpha');
  const wave = createEmptyWave();

  wave.h.a = 255;
  wave.h.w_t = Math.round(rate);
  wave.h.w_x = 2;
  wave.s.b = 255;
  wave.v.b = 255;
  wave.a.b = Math.round(a);
  return wave;
}
