import {
  SET_GAME_STATE,
  SET_CANVAS_SIZE,
} from '../constants';

function setGameState(gameState) {
  return {
    type: SET_GAME_STATE,
    payload: gameState,
  };
}

function setCanvasSize(canvasSize) {
  return {
    type: SET_CANVAS_SIZE,
    payload: canvasSize,
  };
}

const gameActions = {
  setGameState,
  setCanvasSize,
};

export default gameActions;