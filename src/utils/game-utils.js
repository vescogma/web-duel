import gameConstants from '../constants/game';

export function roundTo(a, b) {
  const decimals = Math.pow(10, b);
  return Math.round(a * decimals) / decimals;
}

export function modulus(a, b) {
  return  ((a % b) + b) % b;
}

export function checkAnyKeyPressed(moveKeys) {
  return Object.keys(moveKeys).reduce((prev, next) => {
    return prev || moveKeys[next];
  }, 0);
};

export function checkMaxMovement(position, offset, max) {
  if (position + offset < 0) {
    return 0; 
  }
  if (position + offset > max) {
    return max;
  }
  return position + offset;
}

export function checkBoundaries(newPosition) {
  if (newPosition.x < 0
    || newPosition.y < 0
    || newPosition.x > gameConstants.GAME_WIDTH
    || newPosition.y > gameConstants.GAME_HEIGHT
  ) {
    return true;
  }
  return false;
}

export function getShotsToRemove(playerData, workerData) {
  const shotsToRemove = [];
  playerData.map((shot, index) => {
    const workerIndex = workerData.findIndex(workerShot => {
      return workerShot.timestamp === shot.timestamp;
    });
    if (workerIndex !== -1) {
      shot.current = workerData[workerIndex].current;
      shot.sprite.position.set(shot.current.x, shot.current.y);
    } else {
      shotsToRemove.push(index);
    }
    return shot;
  });
  return shotsToRemove;
}

export function getShotsToAdd(playerData, workerData) {
  return workerData.filter(shot => {
    const clientIndex = playerData.findIndex(clientShot => {
      return clientShot.timestamp === shot.timestamp;
    });
    return clientIndex === -1;
  });
}

export function lookAround(diff) {
  let finalAngle = 0;
  if (diff.x === 0) {
    finalAngle = diff.y < 0 ? 0 : Math.PI / 2;
  } else {
    const angle = Math.atan(Math.abs(diff.y / diff.x));
    if ((diff.x > 0 && diff.y <= 0) || (diff.x < 0 && diff.y <= 0)) {
      finalAngle = (Math.PI / 2 - angle) * diff.x / Math.abs(diff.x);
    } else {
      finalAngle = (Math.PI / 2 + angle) * diff.x / Math.abs(diff.x);
    }
  }
  return finalAngle;
}