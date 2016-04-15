import React, { Component } from 'react';
import { connect } from 'react-redux';
import gameActions from '../actions/game';
import gameConstants from '../constants/game';
import io from 'socket.io-client';
import PIXI from 'pixi.js';
import {
  roundTo,
  modulus,
  checkAnyKeyPressed,
  checkMaxMovement,
  checkBoundaries,
} from '../utils/game-utils';

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
      scale: 1,
      moveKeys: {
        ArrowRight: false,
        ArrowLeft: false,
        ArrowUp: false,
        ArrowDown: false,
      },
      playerState: 'main',
      playerStateList: {
        main: this.main,
        move: this.move,
      },
      shots: [],
      stateList: {
        main: this.main,
        move: this.move,
      }
    };
  }

  componentWillMount() {
    // something ?
  }

  componentDidMount() {
    const socketOptions = {
      'sync disconnect on unload': true
    };
    this.socket = io.connect('http://localhost:3000', socketOptions);
    this.setupSocketEvents();
    this.setupListenerEvents();
    this.loadResources();
  }

  componentWillUnmount() {
    this.removeListenerEvents();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    // console.log('will receive props');
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

  /** CLIENT EVENTS **/

  setupListenerEvents = () => {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  };

  removeListenerEvents = () => {
    window.removeEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  };

  setupSocketEvents = () => {
    this.socket.on('player', data => {
      console.log('client ' + data.client + ' ' + data.status);
      console.log('total clients: ' + data.count);
    });
    this.socket.on('room', data => {
      console.log('player ' + data.player + ' ' + data.action);
      console.log('players in room: ' + data.count);
    });
  };

  sendSocketData = () => {
    const shots = this.state.shots.map(function (shot) {
      return {
        mouse: shot.mouse,
        position: shot.position,
        initial: shot.initial,
        diff: shot.diff,
        current: shot.current,
        ratio: shot.ratio,
        speed: shot.speed,
      };
    });
    const position = { x: this.playerSprite.position.x, y: this.playerSprite.position.y };
    const data = {
      position: position,
      shots: shots,
    }
    this.socket.emit('data', data);
  };

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
    this.interaction = this.renderer.plugins.interaction;
    this.setupGame();
    this.setupPlayer();
    this.gameLoop();
  };

  setupGame = () => {
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.handleResize();
    this.refs.gameCanvas.appendChild(this.renderer.view);
    this.stage.mouseup = () => {
      this.shoot();
    };
  };

  setupPlayer = () => {
    const playerTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
    this.playerSprite = new PIXI.Sprite(playerTexture);
    this.playerSprite.anchor.set(0.5, 0.5);
    this.playerSprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH / 4),
      Math.floor(gameConstants.GAME_HEIGHT / 4),
    );
    this.stage.addChild(this.playerSprite);

    this.enemySprite = new PIXI.Sprite(playerTexture);
    this.enemySprite.anchor.set(0.5, 0.5);
    this.enemySprite.scale.set(-1, 1);
    this.enemySprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH * 3 / 4),
      Math.floor(gameConstants.GAME_HEIGHT * 3 / 4),
    );
    this.stage.addChild(this.enemySprite);
  }

  /** GAME LOOP **/

  gameLoop = () => {
    requestAnimationFrame(this.gameLoop);
    this.managePlayers();
    this.manageShots();
    this.sendSocketData();
    this.renderer.render(this.stage);
  };

  /** PLAYER STATES/ACTIONS **/

  managePlayers = () => {
    this.state.playerStateList[this.state.playerState]();
  };

  main = () => {
    if (checkAnyKeyPressed(this.state.moveKeys)) {
      this.state.playerState = 'move';
    }
  };

  move = () => {
    const speed = 5;
    let offsetX = 0;
    let offsetY = 0;
    if (this.state.moveKeys.ArrowRight || this.state.moveKeys.ArrowLeft) {
      offsetX = this.state.moveKeys.ArrowRight ? speed : -speed;
    }
    if (this.state.moveKeys.ArrowUp || this.state.moveKeys.ArrowDown) {
      offsetY = this.state.moveKeys.ArrowUp ? -speed : speed;
    }
    if (offsetX || offsetY) {
      this.playerSprite.position.set(
        checkMaxMovement(this.playerSprite.position.x, offsetX, 'x'),
        checkMaxMovement(this.playerSprite.position.y, offsetY, 'y'),
      );
    }
    if (!checkAnyKeyPressed(this.state.moveKeys)) {
      this.state.playerState = 'main';
    }
  };

  shoot = () => {
    const mouseEvent = this.interaction.eventData.data.getLocalPosition(this.stage);
    const mouse = { x: mouseEvent.x, y: mouseEvent.y };
    const initial = { x: this.playerSprite.position.x, y: this.playerSprite.position.y };
    const diff = { x: mouse.x - initial.x, y: mouse.y - initial.y };
    const speed = 50;
    const ratio = Math.sqrt(speed * speed / ((diff.x * diff.x) + (diff.y * diff.y)));
    this.setupShot(mouse, initial, diff, speed, ratio);
  };

  setupShot = (mouse, initial, diff, speed, ratio) => {
    const shotTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
    this.state.shots.push({
      sprite: new PIXI.Sprite(shotTexture),
      mouse: mouse,
      initial: initial,
      diff: diff,
      current: initial,
      speed: speed,
      ratio: ratio,
    });
    const shot = this.state.shots[this.state.shots.length - 1];
    shot.sprite.anchor.set(0.5, 0.5);
    shot.sprite.position.set(this.playerSprite.position.x, this.playerSprite.position.y);
    this.stage.addChild(shot.sprite);
  };

  /** SHOTS STATES **/

  manageShots = () => {
    if (this.state.shots.length >= 1) {
      this.state.shots.map((shot, index) => {
        this.moveShot(shot, index);
      });
    }
  };

  moveShot = (shot, index) => {
    const x = shot.sprite.position.x + (shot.diff.x * shot.ratio);
    const y = shot.sprite.position.y + (shot.diff.y * shot.ratio);
    if (!checkBoundaries({ x: x, y: y })) {
      shot.sprite.position.set(x, y);
      shot.current = { x: x, y: y };
    } else {
      this.stage.removeChild(shot.sprite);
      this.state.shots.splice(index, 1);
    }
  };

  /** GAME HANDLERS **/

  handleKeyDown = (e) => {
    if (gameConstants.MOVE_KEYS[e.keyCode]) {
      event.preventDefault();
      this.state.moveKeys[e.code] = true;
    }
  };

  handleKeyUp = (e) => {
    if (gameConstants.MOVE_KEYS[e.keyCode]) {
      event.preventDefault();
      this.state.moveKeys[e.code] = false;
    }
  };

  handleWorkerMessage = (e) => {
    console.log(e);
  };

  handleResize = () => {
    if (this.stage === undefined) {
      debugger;
    }
    const scale = Math.min(
      window.innerWidth / gameConstants.GAME_WIDTH,
      (window.innerHeight) / gameConstants.GAME_HEIGHT,
    );
    this.stage.hitArea = new PIXI.Rectangle(0, 0,
      gameConstants.GAME_WIDTH,
      gameConstants.GAME_HEIGHT,
    );
    this.stage.scale.set(scale);
    this.renderer.resize(
      Math.ceil(gameConstants.GAME_WIDTH * scale),
      Math.ceil(gameConstants.GAME_HEIGHT * scale),
    );
    this.setState({ scale: scale });
  };
}

export default GamePage;