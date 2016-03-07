import React from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from '../actions/counter';
import Counter from '../components/counter';

function mapStateToProps(state) {
  return {
    counter: state.counter.count,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    increaseCounter: () => dispatch(increment()),
    decreaseCounter: () => dispatch(decrement()),
  };
}

const App = ({ counter, increaseCounter, decreaseCounter }) => {
  return (
    <div>
      <div>Counter</div>
      <Counter
        counter={ counter }
        increment={ increaseCounter }
        decrement={ decreaseCounter } />
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);