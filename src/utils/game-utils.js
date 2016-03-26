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

export function checkMaxMovement(position, offset, type) {
  const max = type === 'x' ? gameConstants.GAME_WIDTH : gameConstants.GAME_HEIGHT;
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
    || newPosition.x > gameConstants.GAME_HEIGHT
  ) {
    return true;
  }
  return false;
}