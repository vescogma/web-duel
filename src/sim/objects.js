class Player {
  constructor(width, height) {
    this.position = { x: width, y: height };
  }
  position() {
    return this.position;
  }
}

class Enemy {
  constructor(width, height) {
    this.position = { x: width, y: height };
  }
  position() {
    return this.position;
  }
}

class Shot {
  constructor(width, height) {
    this.position = { x: width, y: height };
  }
  position() {
    return this.position;
  }
}

function checkMaxMovement(position, offset, max) {
  if (position + offset < 0) {
    return 0; 
  }
  if (position + offset > max) {
    return max;
  }
  return position + offset;
}

function checkAnyKeyPressed(moveKeys) {
  return Object.keys(moveKeys).reduce((prev, next) => {
    return prev || moveKeys[next];
  }, 0);
};