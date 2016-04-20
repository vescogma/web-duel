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

function findMovementOffset(speed, keys, key1, key2, last) {
  if (keys[key1].status || keys[key2].status) {
    if (keys[key1].status && keys[key2].status) {
      return keys[keys[last]].sign * speed;
    }
    return (keys[key1].status ? keys[key1].sign : keys[key2].sign) * speed;
  }
  return 0;
}

function checkAnyKeyPressed(moveKeys) {
  return Object.keys(moveKeys).reduce((prev, next) => {
    return prev || moveKeys[next].status;
  }, 0);
}
