import gameConstants from '../constants/game';

export function getShotsToRemove(playerShots, table) {
  const shotsToRemove = [];
  playerShots.map((shot, index) => {
    if (table[shot.timestamp] === undefined) {
      shotsToRemove.push(index);
    }
    return shot;
  });
  return shotsToRemove;
}

export function getShotsToAdd(workerShots, table) {
  return workerShots.filter(shot => {
    return table[shot.timestamp] === undefined;
  });
}

export function updateShots(clientShots, workerShots, table) {
  return clientShots.map(shot => {
    const index = table[shot.timestamp];
    shot.position = workerShots[index].position;
    shot.sprite.position.set(shot.position.x, shot.position.y);
    return shot;
  });
}