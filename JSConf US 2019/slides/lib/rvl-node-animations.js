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

// Note: this is a one-off build of https://github.com/nebrius/rvl-node-animations.

const EMPTY_CHANNEL = { a: 0, w_t: 0, w_x: 0, phi: 0, b: 0 };
let nWaves = 0;
let nPixels = 0;
let calculatePixelValue = null;
let startTime = 0;
export async function init(numWaves, numPixels) {
    nWaves = numWaves;
    nPixels = numPixels;
    startTime = Date.now();
    const response = await fetch('../lib/calculatePixelValue.wasm');
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
}

export function resetClock() {
    startTime = 0;
}

export function getClock() {
    return startTime;
}

// Modified from https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function hsvToRgb(color) {
    const [h, s, v] = color;
    let r = 0;
    let g = 0;
    let b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }
    return [r * 255, g * 255, b * 255];
}
export function calculatePixels(waveParameters) {
    if (!calculatePixelValue) {
        throw new Error('calculatePixels called before init');
    }
    const animationClock = Date.now() - startTime;
    if (!waveParameters.timePeriod) {
        waveParameters.timePeriod = 255;
    }
    if (!waveParameters.distancePeriod) {
        waveParameters.distancePeriod = 32;
    }
    const colors = [];
    const t = animationClock % 25500;
    for (let i = 0; i < nPixels; i++) {
        const pixelColorLayers = [];
        for (let j = 0; j < nWaves; j++) {
            const x = Math.floor(255 * (i % waveParameters.distancePeriod) / waveParameters.distancePeriod);
            const wave = waveParameters.waves[j];
            const pixelColor = hsvToRgb([
                calculatePixelValue(wave.h.a, wave.h.w_t, wave.h.w_x, wave.h.phi, wave.h.b, t, x) / 255,
                calculatePixelValue(wave.s.a, wave.s.w_t, wave.s.w_x, wave.s.phi, wave.s.b, t, x) / 255,
                calculatePixelValue(wave.v.a, wave.v.w_t, wave.v.w_x, wave.v.phi, wave.v.b, t, x) / 255
            ]);
            pixelColorLayers[j] = {
                r: pixelColor[0],
                g: pixelColor[1],
                b: pixelColor[2],
                a: calculatePixelValue(wave.a.a, wave.a.w_t, wave.a.w_x, wave.a.phi, wave.a.b, t, x)
            };
        }
        colors[i] = pixelColorLayers;
    }
    return colors.map((layer) => {
        const pixel = {
            r: layer[nWaves - 1].r,
            g: layer[nWaves - 1].g,
            b: layer[nWaves - 1].b
        };
        function blend(bottom, top, alpha) {
            alpha = alpha / 255;
            bottom = bottom / 255;
            top = alpha * top / 255;
            return Math.round(255 * (top + bottom * (1 - alpha)));
        }
        for (let i = nWaves - 2; i >= 0; i--) {
            pixel.r = blend(pixel.r, layer[i].r, layer[i].a);
            pixel.g = blend(pixel.g, layer[i].g, layer[i].a);
            pixel.b = blend(pixel.b, layer[i].b, layer[i].a);
        }
        return pixel;
    });
}
export function createEmptyWave() {
    return {
        h: { ...EMPTY_CHANNEL },
        s: { ...EMPTY_CHANNEL },
        v: { ...EMPTY_CHANNEL },
        a: { ...EMPTY_CHANNEL }
    };
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
//# sourceMappingURL=index.js.map