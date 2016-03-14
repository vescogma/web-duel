import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../containers/app';
import GamePage from '../containers/game-page';

export default (
  <Route path="/" component={ App }>
    <IndexRoute component={ GamePage } />
    <Route path="game" component={ GamePage } />
  </Route>
);