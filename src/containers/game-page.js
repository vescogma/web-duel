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
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.loadResources();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    // window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
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
    this.scale = 1;
    this.interaction = this.renderer.plugins.interaction;
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

  setMain = () => {
    this.props.setGameState('main');
  };

  main = () => {
    if (this.mouseDown === true) {
      this.setMove();
    }
    // const x = this.playerSprite.position.x;
    // this.playerSprite.position.x = (x >= gameConstants.GAME_WIDTH) ? 0 : x + 1;
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

  setMove = () => {
    this.props.setGameState('move');
  };

  move = () => {
    if (this.mouseDown) {
      const mouse = this.getLocalMouse(this.interaction.mouse.global);
      const player = this.playerSprite.position;
      const x = mouse.x - player.x;
      const y = mouse.y - player.y;
      if (Math.abs(x) > 50 || Math.abs(y) > 50) {
        const speed = 5;
        const R = Math.sqrt(speed*speed/(x*x + y*y));
        this.playerSprite.position.set(player.x + x*R, player.y + y*R);
      }
    }
    if (this.mouseUp) {
      this.setMain();
    }
  };

  /** INTERACTION **/

  handleMouseMove = (event) => {
    const mouse = this.getLocalMouse(this.interaction.mouse.global);
    const player = this.playerSprite.position;
    const x = mouse.x - player.x;
    const y = player.y - mouse.y;
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

  handleMouseDown = (e) => {
    this.mouseUp = false;
    this.mouseDown = true;
  };

  handleMouseUp = (e) => {
    this.mouseDown = false;
    this.mouseUp = true;
  };

  /** GAME UTILS **/

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