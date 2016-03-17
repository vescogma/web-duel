import React, { Component } from 'react';
import { connect } from 'react-redux';
import gameActions from '../actions/game';
import gameConstants from '../constants/game';
import PIXI from 'pixi.js';
import { roundTo, modulus } from '../utils/game-utils';

function mapStateToProps(state) {
  return {
    gameState: state.game.gameState,
  };
}

function mapDispatchToProps(dispatch) {
  return {
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
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.loadResources();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    return (
      <div>
        <div className="gameHolder">
          <div id="gameCanvas" ref="gameCanvas" />
        </div>
        <div className="absolute bottom-0">
          <button onClick={ () => this.setPlay() }>
            STRAIGHT
          </button>
          <button onClick={ () => this.setRotate() }>
            ROTATE
          </button>
          <button onClick={ () => this.setWobble() }>
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
      ])
      .on("progress", this.loadProgress)
      .load(this.setupScene);
  };

  loadProgress = (loader, resource) => {
    console.log("loading: " + resource.name);
    console.log("progress: " + loader.progress + "%");
  };

  setupScene = (loader, resources) => {
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
    this.playerSprite.anchor.set(0.5, 0.5);
    this.playerSprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH / 2),
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.playerSprite);
    this.setPlay();
    this.animate();
  };

  onDown = () => {
    this.playerSprite.scale.x += 0.3;
    this.playerSprite.scale.y += 0.3;
  }

  /** GAME LOOP **/

  animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    this.state.stateList[this.props.gameState]();
    this.renderer.render(this.stage);
  };

  /** GAME STATES **/

  setPlay = () => {
    this.props.setGameState('play');
  };

  play = () => {
    const x = this.playerSprite.position.x;
    this.playerSprite.position.x = (x >= gameConstants.GAME_WIDTH) ? 0 : x + 1;
  };

  setRotate() {
    this.props.setGameState('rotate');
  };

  rotate = () => {
    const rads = this.playerSprite.rotation + (Math.PI / 60);
    this.playerSprite.rotation = modulus(rads, (Math.PI * 2));
  };

  setWobble() {
    this.rads = Math.PI / 60
    this.offsetY = this.playerSprite.position.y;
    this.props.setGameState('wobble');
  };

  wobble = () => {
    this.rads += Math.PI / 60;
    const amplitude = Math.floor(gameConstants.GAME_HEIGHT / 6);
    this.playerSprite.y = -1 * amplitude * Math.sin(this.rads) + this.offsetY;
  };

  /** INTERACTION **/

  handleMouseMove = (event) => {
    const mouseGlobal = this.renderer.plugins.interaction.mouse.global;
    const mouse = {
      x: Math.floor(mouseGlobal.x / this.scale),
      y: Math.floor(mouseGlobal.y / this.scale),
    }
    const player = this.playerSprite.position;
    const x = mouse.x - player.x;
    const y = -1 * (mouse.y - player.y);
    let finalAngle = 0;
    if (x === 0) {
      finalAngle = y >= 0 ? 0 : Math.PI / 2;
    } else {
      const angle = Math.atan(Math.abs(y / x));
      if ((x > 0 && y >= 0) || (x < 0 && y > 0)) {
        finalAngle = (Math.PI / 2 - angle) * x / Math.abs(x);
      } else {
        finalAngle = (Math.PI / 2 + angle) * x / Math.abs(x);
      }
    }
    this.playerSprite.rotation = finalAngle;
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