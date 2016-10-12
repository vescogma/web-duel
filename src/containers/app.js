import React from 'react';
import { Link } from 'react-router'

const App = ({ children }) => {
  return (
    <div>
      <div>
        { children }
      </div>
      <Link to="/game">
        GO TO GAME
      </Link>
    </div>
  );
};

export default App;