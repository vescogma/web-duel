import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';
import rootReducer from 'store/rootReducer';

const storageConfig = {
  key: 'my-key',
};
function configureStore (history, initialState = {}) {

  let middleware = compose(
    applyMiddleware(thunk, routerMiddleware(history)),
    persistState('counter', storageConfig),
  )
  if (window && window.devToolsExtension) {
    middleware = compose(middleware, window.devToolsExtension());
  }
  const store = createStore(rootReducer, initialState, middleware);
  if (module.hot) {
    module.hot.accept('store/rootReducer', () => {
      const nextRootReducer = require('store/rootReducer').default
      store.replaceReducer(nextRootReducer)
    })
  }
  return store;
}

export default configureStore;