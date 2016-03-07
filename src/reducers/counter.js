import { INCREMENT, DECREMENT } from '../constants';

const INITIAL_STATE = {
  count: 0,
};

function counterReducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case INCREMENT:
      return {
        count: state.count + 1,
      };
    case DECREMENT:
      return {
        count: state.count - 1,
      };
    default:
      return state;
  }
}

export default counterReducer;