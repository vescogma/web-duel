import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from 'containers/app';
import Game from 'modules/game/components/Game';

export default (
  <Route path="/" component={ App }>
    <IndexRoute component={ Game } />
    <Route path="game" component={ Game } />
  </Route>
);