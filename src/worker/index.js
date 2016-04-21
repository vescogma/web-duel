importScripts(
  './socket.io.js',
  './objects.js',
  './utils.js',
  './sockets.js'
);

class Worker {
  onstart(width, height) {
    this.moveKeys = {   
      KeyD: { status: false, sign: 1 },
      KeyA: { status: false, sign: -1 },
      KeyW: { status: false, sign: -1 },
      KeyS: { status: false, sign: 1 },
      ArrowRight: { status: false, sign: 1 },
      ArrowLeft: { status: false, sign: -1 },
      ArrowUp: { status: false, sign: -1 },
      ArrowDown: { status: false, sign: 1 },   
    };
    this.width = width;
    this.height = height;
    this.playerState = 'main';
    this.player = new Player(width / 4, height / 2);
    this.enemy = new Enemy(width * 3 / 4, height / 2);
    setInterval(this.simulation, 1000 / 60);
  }

  onsend() {
    const data = {
      player: {
        position: {
          x: this.player.position.x,
          y: this.player.position.y,
        },
      },
      enemy: {
        position: {
          x: this.enemy.position.x,
          y: this.enemy.position.y,
        }
      }
    };
    postMessage(data);
  }

  simulation() {
    worker[worker.playerState]();
    sendSocketData();
  }

  main() {
    if (checkAnyKeyPressed(this.moveKeys)) {
      this.playerState = 'move';
    }
  }

  move() {
    const speed = 4;
    let offsetX = findMovementOffsetX(speed, this.moveKeys, 'lastX');
    let offsetY = findMovementOffsetY(speed, this.moveKeys, 'lastY');
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
    if (key === 'KeyD'
      || key === 'KeyA'
      || key === 'ArrowRight'
      || key === 'ArrowLeft') {
      this.moveKeys.lastX = key;
    } else if (key === 'KeyW'
      || key === 'KeyS'
      || key === 'ArrowUp'
      || key === 'ArrowDown') {
      this.moveKeys.lastY = key;
    }
  }

  onKeyUp(key) {
    this.moveKeys[key].status = false;
  }
}

const worker = new Worker();
const socket = io.connect('http://localhost:3000', {
  'sync disconnect on unload': true
});
onmessage = (event) => {
  worker[event.data.action].apply(worker, event.data.args ? event.data.args : null);
}
setupSocket();
