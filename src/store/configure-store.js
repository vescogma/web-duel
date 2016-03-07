import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

const storageConfig = {
  key: 'my-key',
};
function configureStore (history, initialState = {}) {
  const middleware = compose(
    applyMiddleware(thunk, routerMiddleware(history)),
    persistState('counter', storageConfig),
    typeof window === 'object' && window.devToolsExtension ?
      window.devToolsExtension() : DevTools.instrument()
  )
  const store = createStore(rootReducer, initialState, middleware);
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }
  return store;
}

export default configureStore;