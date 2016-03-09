import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../containers/app';
import CounterPage from '../containers/counter-page';
import GamePage from '../containers/game-page';

export default (
  <Route path="/" component={ App }>
    <IndexRoute component={ CounterPage } />
    <Route path="counter" component={ CounterPage } />
    <Route path="game" component={ GamePage } />
  </Route>
);