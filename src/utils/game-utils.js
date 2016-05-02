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