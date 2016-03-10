import React, { Component } from 'react';
import { connect } from 'react-redux';
import Game from '../components/game';

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class GamePage extends Component {
  constructor(props) {
    super(props);
    const ratio = 2 / 3;
    const gameHeight = window.innerHeight - 200;
    const gameWidth = Math.floor(gameHeight * ratio);
    this.state = {
      height: gameHeight,
      width: gameWidth,
      ratio: ratio,
      zoomLevel: 1,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.zoomLevel !== this.props.zoomLevel;
  }

  render() {
    return (
      <div>
        <button onClick={ this.onZoomIn }>ZOOM +</button>
        <button onClick={ this.onZoomOut }>ZOOM -</button>
        <Game
          height={ this.state.height }
          width={ this.state.width }
          zoomLevel={ this.state.zoomLevel }
        />
      </div>
    );
  }

  onZoomIn = () => {
    // this.state.zoomLevel += 0.1;
    const zoomLevel =  Math.floor((this.state.zoomLevel + 0.1) * 100) / 100;
    this.setState({ zoomLevel: zoomLevel });
  };

  onZoomOut = () => {
    // this.state.zoomLevel -= 0.1;
    const zoomLevel = Math.floor((this.state.zoomLevel - 0.1) * 100) / 100;
    if (zoomLevel >= 0) {
      this.setState({ zoomLevel: zoomLevel });
    }
  };
}

export default GamePage;