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
    this.shots = [];
    setInterval(this.simulation, 1000 / 60);
  }

  onsend() {
    const data = {
      player: {
        position: {
          x: this.player.position.x,
          y: this.player.position.y,
        },
        shots: this.shots,
      },
      enemy: {
        position: {
          x: this.enemy.position.x,
          y: this.enemy.position.y,
        }
      },
    };
    postMessage(data);
  }

  simulation() {
    worker[worker.playerState]();
    worker.manageShots();
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

  shoot(mouse, speed) {
    const initial = { x: this.player.position.x, y: this.player.position.y };
    const shot = new Shot(mouse, speed, initial);
    this.shots.push(shot);
  }

  manageShots() {
    if (this.shots.length > 0) {
      this.shots.map((shot, index) => {
        this.moveShot(shot, index);
      });
    }
  }

  moveShot(shot, index) {
    const x = shot.current.x + (shot.diff.x * shot.ratio);
    const y = shot.current.y + (shot.diff.y * shot.ratio);
    if (!checkBoundaries(x, y, this.width, this.height)) {
      shot.current = { x: x, y: y };
    } else {
      this.shots.splice(index, 1);
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
