import {
  SET_GAME_STATE,
  SET_CANVAS_SIZE,
} from 'modules/game/actionTypes';

export function setGameState(gameState) {
  return {
    type: SET_GAME_STATE,
    payload: gameState,
  };
}

export function setCanvasSize(canvasSize) {
  return {
    type: SET_CANVAS_SIZE,
    payload: canvasSize,
  };
}