import React, { Component } from 'react';
import { connect } from 'react-redux';
import gameActions from '../actions/game';
import gameConstants from '../constants/game';
import PIXI from 'pixi.js';
import { roundTo, modulus } from '../utils/game-utils';

function mapStateToProps(state) {
  return {
    gameState: state.game.gameState,
    ratio: state.game.ratio,
    zoomLevel: state.game.zoomLevel,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCanvasSize: (size) => dispatch(gameActions.setCanvasSize(size)),
    setGameState: (size) => dispatch(gameActions.setGameState(size)),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class GamePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateList: {
        play: this.play,
        rotate: this.rotate,
        wobble: this.wobble,
      }
    };
  }

  componentWillMount() {
    window.addListener
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.loadResources();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    const { props } = this;
    return (
      <div>
        <div className="gameHolder">
          <div id="gameCanvas" ref="gameCanvas" />
        </div>
        <div className="absolute bottom-0">
          <button onClick={ () => props.setGameState('play') }>
            STRAIGHT
          </button>
          <button onClick={ () => props.setGameState('rotate') }>
            ROTATE
          </button>
          <button onClick={ () => props.setGameState('wobble') }>
            WOBBLE
          </button>
        </div>
      </div>
    );
  }

  /** GAME LOADER/RESOURCES **/

  loadResources = () => {
    PIXI.loader
      .add([
        { key: 'player64', url: '../assets/images/player64.png' },
        { key: 'player128', url: '../assets/images/player128.png' },
        { key: 'player256', url: '../assets/images/player256.png' },
      ])
      .on("progress", this.loadProgress)
      .load(this.setupScene);
  };

  loadProgress = (loader, resource) => {
    console.log("loading: " + resource.name);
    console.log("progress: " + loader.progress + "%");
  };

  setupScene = (loader, resources) => {
    const { props } = this;
    this.resources = resources;
    const renderOptions = {
      backgroundColor: 0x222222,
      antialias: false,
      transparent: false,
      resolution: window.devicePixelRatio,
      autoResize: true,
    };
    this.renderer = new PIXI.autoDetectRenderer(
      gameConstants.GAME_WIDTH,
      gameConstants.GAME_HEIGHT,
      renderOptions,
    );
    this.stage = new PIXI.Container();
    this.handleResize();

    this.refs.gameCanvas.appendChild(this.renderer.view);
    const playerTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
    this.playerSprite = new PIXI.Sprite(playerTexture);
    this.playerSprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH / 2),
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.playerSprite);
    this.animate();
  };

  /** GAME LOOP **/

  animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    this.state.stateList[this.props.gameState]();
    this.renderer.render(this.stage);
  };

  /** GAME STATES **/

  play = () => {
    const x = this.playerSprite.position.x;
    this.playerSprite.position.set(
      x >= gameConstants.GAME_WIDTH ? 0 : x + 1,
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
  };

  rotate = () => {
    const rads = this.playerSprite.rotation + (Math.PI / 60);
    this.playerSprite.rotation = modulus(rads, (Math.PI * 2));
  };

  wobble = () => {
    const speed = Math.PI / 60;
    const offset = Math.floor(gameConstants.GAME_HEIGHT / 2)
    this.playerSprite.y = Math.sin(this.playerSprite.y - offset) + offset;
  };

  /** GAME UTILS **/

  handleResize = () => {
    this.scale = Math.min(
      window.innerWidth / gameConstants.GAME_WIDTH,
      (window.innerHeight) / gameConstants.GAME_HEIGHT,
    );
    this.stage.scale.set(this.scale);
    this.renderer.resize(
      Math.ceil(gameConstants.GAME_WIDTH * this.scale),
      Math.ceil(gameConstants.GAME_HEIGHT * this.scale),
    );
    console.log('resized, new scaling: ', this.scale);
  };
}

export default GamePage;