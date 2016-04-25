class Player {
  constructor(x, y) {
    this.position = { x: x, y: y };
    this.shots = [];
  }
}

class Enemy {
  constructor(x, y) {
    this.position = { x: x, y: y };
    this.shots = [];
  }
}

class Shot {
  constructor(mouse, speed, initial) {
    const diff = { x: mouse.x - initial.x, y: mouse.y - initial.y };
    const ratio = Math.sqrt(speed * speed / ((diff.x * diff.x) + (diff.y * diff.y)));
    this.mouse = mouse;
    this.speed = speed;
    this.diff = diff;
    this.initial = initial;
    this.position = initial;
    this.ratio = ratio;
    this.timestamp = performance.now();
  };
}
