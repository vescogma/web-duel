import React from 'react';
import { Link } from 'react-router'

const App = ({ children }) => {
  return (
    <div>
      <span>
        Hello this is the main page yey. A navbar or something would go here...
      </span>
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