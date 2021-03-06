function checkMaxMovement(position, offset, max) {
  if (position + offset < 0) {
    return 0; 
  }
  if (position + offset > max) {
    return max;
  }
  return position + offset;
}

function findMovementOffsetX(speed, keys, last) {
  if (keys.KeyD.status || keys.ArrowRight.status ||
    keys.KeyA.status || keys.ArrowLeft.status) {
    if ((keys.KeyD.status || keys.ArrowRight.status) &&
      (keys.KeyA.status || keys.ArrowLeft.status)) {
      return keys[keys[last]].sign * speed;
    }
    return (keys.KeyD.status || keys.ArrowRight.status) ? speed : -speed;
  }
  return 0;
}

function findMovementOffsetY(speed, keys, last) {
  if (keys.KeyW.status || keys.ArrowUp.status ||
    keys.KeyS.status || keys.ArrowDown.status) {
    if ((keys.KeyW.status || keys.ArrowUp.status) &&
      (keys.KeyS.status || keys.ArrowDown.status)) {
      return keys[keys[last]].sign * speed;
    }
    return (keys.KeyS.status || keys.ArrowDown.status) ? speed : -speed;
  }
  return 0;
}

function checkAnyKeyPressed(moveKeys) {
  return Object.keys(moveKeys).reduce((prev, next) => {
    return prev || moveKeys[next].status;
  }, 0);
}

function hit(shot, enemy) {
  if ((shot.x > enemy.x - 50 && shot.x < enemy.x + 50) &&
    (shot.y > enemy.y - 50 && shot.y < enemy.y + 50)) {
    return true;
  }
  return false;
}

function checkBoundaries(x, y, width, height) {
  if (x < 0 || y < 0 || x > width || y > height) {
    return true;
  }
  return false;
}
