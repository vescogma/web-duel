import {
  SET_GAME_STATE,
} from '../constants';

const INITIAL_STATE = {
  gameState: 'play',
};

function gameReducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case SET_GAME_STATE:
      return Object.assign({}, state, {
        gameState: action.payload
      });
    default:
      return state;
  }
}

export default gameReducer;