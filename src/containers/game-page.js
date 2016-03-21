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
        main: this.main,
        move: this.move,
      }
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    // window.addEventListener('mousemove', this.handleMouseMove);
    // window.addEventListener('mousedown', this.handleMouseDown);
    // window.addEventListener('mouseup', this.handleMouseUp);
    this.loadResources();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    // window.removeEventListener('mousemove', this.handleMouseMove);
    // window.removeEventListener('mousedown', this.handleMouseDown);
    // window.removeEventListener('mouseup', this.handleMouseUp);
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
        </div>
      </div>
    );
  }

  /** GAME LOADER/RESOURCES **/

  loadResources = () => {
    PIXI.loader
      .add([
        { key: 'player64', url: '../assets/images/robomage64.png' },
        { key: 'player128', url: '../assets/images/robomage128.png' },
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
    this.scale = 1;
    this.interaction = this.renderer.plugins.interaction;
    this.stage.interactive = true;
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
    this.setMain();
    this.animate();
  };

  /** GAME LOOP **/

  animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    this.state.stateList[this.props.gameState]();
    this.renderer.render(this.stage);
  };

  /** GAME STATES **/

  setMain = () => {
    this.stage.mousedown = () => {
      this.setMove();
    }
    this.stage.mouseup = () => {
      this.setMain();
    }
    this.props.setGameState('main');
  };

  main = () => {
    const mouse = this.interaction.eventData.data.getLocalPosition(this.stage);
    const diff = {
      x: mouse.x - this.playerSprite.position.x,
      y: mouse.y - this.playerSprite.position.y,
    }
    this.lookAround(diff);
  };

  setMove = () => {
    this.props.setGameState('move');
  };

  move = () => {
    const mouse = this.interaction.eventData.data.getLocalPosition(this.stage);
    const diff = {
      x: mouse.x - this.playerSprite.position.x,
      y: mouse.y - this.playerSprite.position.y,
    }
    this.lookAround(diff);
    if (Math.abs(diff.x) > 50 || Math.abs(diff.y) > 50) {
      const speed = 5;
      const ratio = Math.sqrt(speed * speed / (diff.x * diff.x + diff.y * diff.y));
      this.playerSprite.position.set(
        this.playerSprite.position.x + (diff.x * ratio),
        this.playerSprite.position.y + (diff.y * ratio),
      );
    }
  };

  /** GAME UTILS **/

  lookAround = (diff) => {
    let finalAngle = 0;
    if (diff.x === 0) {
      finalAngle = diff.y < 0 ? 0 : Math.PI / 2;
    } else {
      const angle = Math.atan(Math.abs(diff.y / diff.x));
      if ((diff.x > 0 && diff.y <= 0) || (diff.x < 0 && diff.y <= 0)) {
        finalAngle = (Math.PI / 2 - angle) * diff.x / Math.abs(diff.x);
      } else {
        finalAngle = (Math.PI / 2 + angle) * diff.x / Math.abs(diff.x);
      }
    }
    this.playerSprite.rotation = finalAngle;
  };

  handleResize = () => {
    this.scale = Math.min(
      window.innerWidth / gameConstants.GAME_WIDTH,
      (window.innerHeight) / gameConstants.GAME_HEIGHT,
    );
    this.stage.hitArea = new PIXI.Rectangle(0, 0,
      gameConstants.GAME_WIDTH,
      gameConstants.GAME_HEIGHT,
    );
    this.stage.scale.set(this.scale);
    this.renderer.resize(
      Math.ceil(gameConstants.GAME_WIDTH * this.scale),
      Math.ceil(gameConstants.GAME_HEIGHT * this.scale),
    );
    console.log('resized, new scaling: ', this.scale);
  };

  getLocalMouse = (mouseGlobal) => {
    return {
      x: Math.floor(mouseGlobal.x / this.scale),
      y: Math.floor(mouseGlobal.y / this.scale),
    };
  }
}

export default GamePage;