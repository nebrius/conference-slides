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

const X_AXIS_ORIGIN_OFFSET = 20;
const FONT_SIZE = 24;

const PADDING_LEFT = FONT_SIZE + 10;
const PADDING_TOP = FONT_SIZE + 10;

export function graph({ a, omega, phi, b, marker = 0, variableName, canvas }) {
  const ctx = canvas.getContext('2d');
  const pi = Math.PI;

  const graphParameters = {
    x: {
      min: PADDING_LEFT,
      max: canvas.width,
      zero: PADDING_LEFT + X_AXIS_ORIGIN_OFFSET,
      ratio: 0,
      offset: 0
    },
    y: {
      min: PADDING_TOP,
      max: canvas.height,
      zero: PADDING_TOP + (canvas.height - PADDING_TOP) / 2,
      ratio: 0,
      offset: 0
    }
  }
  graphParameters.x.ratio = (graphParameters.x.max - graphParameters.x.zero) / 2 / pi * 0.9;
  graphParameters.x.offset = PADDING_LEFT + X_AXIS_ORIGIN_OFFSET;
  graphParameters.y.ratio = (graphParameters.y.max - graphParameters.y.zero) * 0.9;
  graphParameters.y.offset = PADDING_TOP + graphParameters.y.ratio * 1.1;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.font = `${FONT_SIZE}px Georgia, serif`;

  function convertCoordinate(x, y) {
    y = -y;
    return [
      x * graphParameters.x.ratio + graphParameters.x.offset,
      y * graphParameters.y.ratio + graphParameters.y.offset
    ]
  }

  function reverseConvertCoordinate(x, y) {
    y = -y;
    return [
      (x - graphParameters.x.offset) / graphParameters.x.ratio,
      (y - graphParameters.y.offset) / graphParameters.y.ratio
    ]
  }

  // Draw the x axis
  function drawXTick(x, label) {
    const [ canvasX, canvasY ] = convertCoordinate(x, 0);
    ctx.beginPath();
    ctx.moveTo(canvasX, canvasY - 5);
    ctx.lineTo(canvasX, canvasY + 5);
    ctx.stroke();
    const textWidth = ctx.measureText(label).width;
    ctx.fillText(label, canvasX - textWidth / 2, canvasY + 5 + FONT_SIZE);
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(graphParameters.x.min, graphParameters.y.zero);
  ctx.lineTo(graphParameters.x.max, graphParameters.y.zero);
  ctx.stroke();
  drawXTick(pi / 2, 'π/2');
  drawXTick(pi, 'π');
  drawXTick(3 * pi / 2, '3π/2');
  drawXTick(2 * pi, '2π');
  ctx.fillText(variableName, 0, graphParameters.y.zero + FONT_SIZE / 2);

  // Draw the y axis
  function drawYTick(y, label) {
    const [ canvasX, canvasY ] = convertCoordinate(0, y);
    ctx.beginPath();
    ctx.moveTo(canvasX - 5, canvasY);
    ctx.lineTo(canvasX + 5, canvasY);
    ctx.stroke();
    const textWidth = ctx.measureText(label).width;
    ctx.fillText(label, canvasX - textWidth - 10, canvasY + FONT_SIZE / 2);
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(graphParameters.x.zero, graphParameters.y.min);
  ctx.lineTo(graphParameters.x.zero, graphParameters.y.max);
  ctx.stroke();
  drawYTick(1, '1');
  drawYTick(-1, '-1');
  ctx.fillText(`f(${variableName})`, graphParameters.x.zero - FONT_SIZE / 2, FONT_SIZE);

  // Draw the origin
  ctx.fillText('0', graphParameters.x.min, graphParameters.y.zero + FONT_SIZE);

  // Draw the marker
  ctx.beginPath();
  ctx.moveTo(...convertCoordinate(marker, -1));
  ctx.lineTo(...convertCoordinate(marker, 1));
  ctx.stroke();

  // Draw the sin wave
  ctx.beginPath();
  for (let canvasX = graphParameters.x.min; canvasX < graphParameters.x.max; canvasX++) {
    const [ x ] = reverseConvertCoordinate(canvasX, 0);
    const y = a * Math.sin(omega * x + phi) + b;
    const [ , canvasY ] = convertCoordinate(x, y);
    if (canvasX === graphParameters.x.min) {
      ctx.moveTo(canvasX, canvasY);
    }
    ctx.lineTo(canvasX, canvasY);
  }
  ctx.stroke();
}
