importScripts('./sim/objects.js');
importScripts('./assets/scripts/socket.io.js');

class Worker {
  onstart(width, height) {
    this.moveKeys = {
      KeyD: { status: false, sign: 1 },
      KeyA: { status: false, sign: -1 },
      KeyW: { status: false, sign: -1 },
      KeyS: { status: false, sign: 1 },
    };
    this.width = width;
    this.height = height;
    this.playerState = 'main';
    this.player = new Player(width / 4, height / 2);
    this.enemy = new Enemy(width * 3 / 4, height / 2);
    this.throttle = 2;
    this.counter = 0;
    setInterval(this.simulation, 1000 / 120);
  }

  onsend() {
    const data = {
      player: {
        position: {
          x: this.player.position.x,
          y: this.player.position.y,
        },
      },
    };
    postMessage(data);
  }

  simulation() {
    worker[worker.playerState]();
    if (this.counter % this.throttle === 0) {
      sendSocketData();
      this.counter = 0;
    }
    this.counter++;
  }

  main() {
    if (checkAnyKeyPressed(this.moveKeys)) {
      this.playerState = 'move';
    }
  }

  move() {
    const speed = 2;
    let offsetX = findMovementOffset(speed, this.moveKeys, 'KeyD', 'KeyA', 'lastX');
    let offsetY = findMovementOffset(speed, this.moveKeys, 'KeyW', 'KeyS', 'lastY');
    if (offsetX || offsetY) {
      this.player.position.x = checkMaxMovement(this.player.position.x, offsetX, this.width);
      this.player.position.y = checkMaxMovement(this.player.position.y, offsetY, this.height);
    }
    if (!checkAnyKeyPressed(this.moveKeys)) {
      this.playerState = 'main';
    }
  }

  onKeyDown(key) {
    this.moveKeys[key].status = true;
    if (key === 'KeyD' || key === 'KeyA') {
      this.moveKeys.lastX = key;
    } else if (key === 'KeyW' || key === 'KeyS') {
      this.moveKeys.lastY = key;
    }
  }

  onKeyUp(key) {
    this.moveKeys[key].status = false;
  }
}

const worker = new Worker();
const socket = io.connect('http://localhost:3000');
onmessage = (event) => {
  worker[event.data.action].apply(worker, event.data.args ? event.data.args : null);
}
setupSocket();

function setupSocket() {
  socket.on('message', data => {
    console.log(data.message);
  });
  socket.on('player', data => {
    console.log('client ' + data.client + ' ' + data.status);
    console.log('total clients: ' + data.count);
  });
  socket.on('room', data => {
    console.log('player ' + data.player + ' ' + data.action);
    console.log('players in room: ' + data.count);
  });
}

function sendSocketData() {
  const data = {
    player: {
      position: {
        x: this.player.position.x,
        y: this.player.position.y,
      },
    },
  };
  socket.emit('data', data);
}