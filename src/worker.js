importScripts('./sim/objects.js');

class Worker {
  onstart(width, height) {
    this.moveKeys = {
      ArrowRight: false,
      ArrowLeft: false,
      ArrowUp: false,
      ArrowDown: false,
    };
    this.width = width;
    this.height = height;
    this.playerState = 'main';
    this.player = new Player(width / 4, height / 2);
    this.enemy = new Enemy(width * 3 / 4, height / 2);
    this.setup();
  }

  sendWorkerData() {
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
    worker.sendWorkerData();
  }

  setup() {
    setInterval(this.simulation, 1000 / 120);
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
    if (this.moveKeys.ArrowRight || this.moveKeys.ArrowLeft) {
      offsetX = this.moveKeys.ArrowRight ? speed : -speed;
    }
    if (this.moveKeys.ArrowUp || this.moveKeys.ArrowDown) {
      offsetY = this.moveKeys.ArrowUp ? -speed : speed;
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
    this.moveKeys[key] = true;
  }

  onKeyUp(key) {
    this.moveKeys[key] = false;
  }

}

const worker = new Worker();

onmessage = (event) => {
  var data = JSON.parse(event.data);
  worker[data.action].apply(worker, data.args);
}