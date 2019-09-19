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

let connection;

export function sendPresentationMessage(data) {
  connection.send(JSON.stringify({
    type: 'ClientMessage',
    page: window.location.href,
    data
  }));
}

const presentationMessageListeners = [];
export function addPresentationMessageListener(listener) {
  presentationMessageListeners.push(listener);
}

export async function init() {
  return new Promise((resolve, reject) => {
    function setSize() {
      const container = document.querySelector('.rprez');
      container.style.zoom = window.innerWidth / 1925;
    }
    window.onresize = setSize;
    setSize();

    connection = new WebSocket(`ws://localhost:3087/ws`);
    connection.addEventListener('open', () => {
      console.log('Connected to bridging server');

      document.onkeyup = (e) => {
        switch (e.key) {
          case 'Escape': {
            const message = {
              type: 'RequestExistShow'
            };
            connection.send(JSON.stringify(message));
            break;
          }
          case 'ArrowRight':
          case ' ':
          case 'd':
          case 'PageUp': {
            const message = {
              type: 'RequestNextSlide'
            };
            connection.send(JSON.stringify(message));
            break;
          }
          case 'ArrowLeft':
          case 'a':
          case 'PageDown': {
            const message = {
              type: 'RequestPreviousSlide'
            };
            connection.send(JSON.stringify(message));
            break;
          }
        }
      };

      connection.send(JSON.stringify({ type: 'ClientWindowReady' }));
      resolve();
    });

    connection.addEventListener('error', (err) => {
      console.error(`Could not connect to bridging server: ${err}`);
      reject();
    });

    connection.addEventListener('message', (msg) => {
      console.log(`Received message: ${msg.data}`);
      const parsedMessage = JSON.parse(msg.data);
      if (parsedMessage.type === 'ClientMessage' && parsedMessage.page === window.location.href) {
        for (const listener of presentationMessageListeners) {
          listener(parsedMessage.data);
        }
      }
    });
  });
}
