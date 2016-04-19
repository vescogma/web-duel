importScripts('./sim/objects.js');

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
    postMessage(JSON.stringify(data));
  }

  simulation() {
    worker[worker.playerState]();
  }

  main() {
    if (checkAnyKeyPressed(this.moveKeys)) {
      this.playerState = 'move';
    }
  }

  move() {
    const speed = 2;
    const position = {};
    let offsetX = 0;
    let offsetY = 0;
    if (this.moveKeys.KeyD.status || this.moveKeys.KeyA.status) {
      if (this.moveKeys.KeyD.status && this.moveKeys.KeyA.status) {
        offsetX = this.moveKeys[this.moveKeys.lastX].sign * speed;
      } else {
        offsetX = this.moveKeys.KeyD.status ? speed : -speed;
      }
    }
    if (this.moveKeys.KeyW.status || this.moveKeys.KeyS.status) {
      if (this.moveKeys.KeyW.status && this.moveKeys.KeyS.status) {
        offsetY = this.moveKeys[this.moveKeys.lastY].sign * speed;
      } else {
        offsetY = this.moveKeys.KeyS.status ? speed : -speed;
      }
    }
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

onmessage = (event) => {
  var data = JSON.parse(event.data);
  worker[data.action].apply(worker, data.args ? data.args : null);
}