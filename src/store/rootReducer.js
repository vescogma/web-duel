import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import game from 'modules/game/reducer';

export default combineReducers({
  routing: routerReducer,
  game,
});
