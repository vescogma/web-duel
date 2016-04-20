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