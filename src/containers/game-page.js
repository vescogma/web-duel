import React, { Component } from 'react';
import { connect } from 'react-redux';
import PIXI from 'pixi.js';

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
  state = {
    maxX: 800,
    maxY: 800,
  };

  componentDidMount(){
    const maxX = this.state.maxX;
    const maxY = this.state.maxY;
    const stage = new PIXI.Container();
    const renderer = ( PIXI.WebGLRenderer(maxX, maxY) );
    this.refs.gameWrap.appendChild(renderer.view);
  }

  render() {
    return (
      <div ref="gameWrap">
      </div>
    );
  }
}

export default GamePage;