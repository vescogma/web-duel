import gameConstants from '../constants/game';

export function getShotsToRemove(playerData, workerData) {
  const shotsToRemove = [];
  playerData.map((shot, index) => {
    const workerIndex = workerData.findIndex(workerShot => {
      return workerShot.timestamp === shot.timestamp;
    });
    if (workerIndex !== -1) {
      shot.position = workerData[workerIndex].position;
      shot.sprite.position.set(shot.position.x, shot.position.y);
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
