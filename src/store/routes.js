import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../components/app';
import Game from '../components/game/game';

export default (
  <Route path="/" component={ App }>
    <IndexRoute component={ Game } />
    <Route path="game" component={ Game } />
  </Route>
);