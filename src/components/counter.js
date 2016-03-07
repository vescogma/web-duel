import React from 'react';

const styles = {
  button: {
    width: 100,
    height: 30,
    padding: 10,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3
  }
};

const Counter = ({ counter, increment, decrement }) => (
  <div style={{flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <div>{ counter }</div>
    <div onClick={ increment } style={ styles.button }>
      <div>+</div>
    </div>
    <div onClick={ decrement } style={ styles.button }>
      <div>-</div>
    </div>
  </div>
);

export default Counter;