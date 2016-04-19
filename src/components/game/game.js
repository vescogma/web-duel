import React, { Component } from 'react';
import gameActions from '../../actions/game';
import gameConstants from '../../constants/game';
import io from 'socket.io-client';
import PIXI from 'pixi.js';
import {
  roundTo,
  modulus,
  checkAnyKeyPressed,
  checkMaxMovement,
  checkBoundaries,
} from '../../utils/game-utils';

class Game extends Component {
  constructor(props) {
    super(props);
    this.game = {
      scale: 1,
      moveKeys: gameConstants.MOVE_NAMES,
      playerState: 'main',
      shots: [],
    };
  }

  componentDidMount() {
    const socketOptions = {
      'sync disconnect on unload': true
    };
    this.socket = io.connect('http://localhost:3000', socketOptions);
    this.setupSocketEvents();
    this.setupWorkerEvents();
    this.setupListenerEvents();
    this.loadResources();
  }

  componentWillUnmount() {
    this.removeListenerEvents();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
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
    this.socket.on('message', data => {
      console.log(data.message);
    });
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
    const shots = this.game.shots.map(shot => {
      const shotData = {};
      Object.keys(shot).map(shotKey => {
        if (shotKey !== 'sprite') {
          shotData[shotKey] = shot[shotKey];
        }
        return shotKey;
      })
      return shotData;
    });
    const position = { x: this.playerSprite.position.x, y: this.playerSprite.position.y };
    const data = {
      timestamp: performance.now(),
      position: position,
      shots: shots,
    }
    this.socket.emit('data', data);
  };

  setupWorkerEvents = () => {
    this.worker = new Worker('../worker.js');
    this.worker.onmessage = (event) => {
      var data = JSON.parse(event.data);
      this.handleWorkerPosition(data.player.position);
    };
    this.worker.postMessage(JSON.stringify({
      action: 'onstart',
      args: [
        gameConstants.GAME_WIDTH,
        gameConstants.GAME_HEIGHT,
      ],
    }));
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
    this.setupStage();
    this.setupPlayer();
    this.setupGame();
  };

  setupStage = () => {
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
    // player
    this.playerSprite = new PIXI.Sprite(playerTexture);
    this.playerSprite.anchor.set(0.5, 0.5);
    this.playerSprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH / 4),
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.playerSprite);
    // enemy
    this.enemySprite = new PIXI.Sprite(playerTexture);
    this.enemySprite.anchor.set(0.5, 0.5);
    this.enemySprite.scale.set(-1, 1);
    this.enemySprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH * 3 / 4),
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.enemySprite);
  };

  setupGame = () => {
    this.lastTick = performance.now();
    this.lastRender = this.lastTick;
    this.tickLength = 1000 / 60;
    this.gameLoop(performance.now());
  };

  /** GAME LOOP **/

  gameLoop = (timestamp) => {
    requestAnimationFrame(this.gameLoop);
    const nextTick = this.lastTick + this.tickLength;
    this.frameCatch(nextTick, this.lastTick, this.tickLength, timestamp);
    // this.update();
    this.draw();
    this.lastRender = timestamp;
  };

  frameCatch = (nextTick, timestamp) => {
    let ticks = 0;
    if (timestamp > nextTick) {
      ticks = Math.floor((timestamp - this.lastTick) / this.tickLength);
      console.log(ticks);
    }
    while (ticks >= 0){
      this.lastTick += this.tickLength;
      this.update();
      ticks--;
    }
  };

  draw = () => {
    this.renderer.render(this.stage);
  };

  update = () => {
    this.worker.postMessage(JSON.stringify({ action: 'onsend' }));
    // // this.managePlayers();
    // // this.manageShots();
    // // this.sendSocketData();
    this[this.game.playerState]();
  };

  /** PLAYER STATES/ACTIONS **/

  main = () => {
    if (checkAnyKeyPressed(this.game.moveKeys)) {
      this.game.playerState = 'move';
    }
  };

  move = () => {
    const speed = 4;
    let offsetX = 0;
    let offsetY = 0;
    if (this.game.moveKeys.ArrowRight || this.game.moveKeys.ArrowLeft) {
      offsetX = this.game.moveKeys.ArrowRight ? speed : -speed;
    }
    if (this.game.moveKeys.ArrowUp || this.game.moveKeys.ArrowDown) {
      offsetY = this.game.moveKeys.ArrowUp ? -speed : speed;
    }
    if (offsetX || offsetY) {
      this.playerSprite.position.set(
        checkMaxMovement(this.playerSprite.position.x, offsetX, gameConstants.GAME_WIDTH),
        checkMaxMovement(this.playerSprite.position.y, offsetY, gameConstants.GAME_HEIGHT),
      );
    }
    if (!checkAnyKeyPressed(this.game.moveKeys)) {
      this.game.playerState = 'main';
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
    this.game.shots.push({
      sprite: new PIXI.Sprite(shotTexture),
      mouse: mouse,
      timestamp: performance.now(),
      initial: initial,
      diff: diff,
      current: initial,
      speed: speed,
      ratio: ratio,
    });
    const shot = this.game.shots[this.game.shots.length - 1];
    shot.sprite.anchor.set(0.5, 0.5);
    shot.sprite.position.set(this.playerSprite.position.x, this.playerSprite.position.y);
    this.stage.addChild(shot.sprite);
  };

  /** SHOTS STATES **/

  manageShots = () => {
    if (this.game.shots.length >= 1) {
      this.game.shots.map((shot, index) => {
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
      this.game.shots.splice(index, 1);
    }
  };

  /** GAME HANDLERS **/

  handleWorkerPosition = (playerPosition) => {
    this.playerSprite.position.set(playerPosition.x, playerPosition.y);
  };

  handleKeyDown = (e) => {
    if (gameConstants.MOVE_KEYS[e.keyCode]) {
      event.preventDefault();
      this.game.moveKeys[e.code] = true;
      this.worker.postMessage(JSON.stringify({
        action: 'onKeyDown',
        args: [
          e.code,
        ],
      }));
    }
  };

  handleKeyUp = (e) => {
    if (gameConstants.MOVE_KEYS[e.keyCode]) {
      event.preventDefault();
      this.game.moveKeys[e.code] = false;
      this.worker.postMessage(JSON.stringify({
        action: 'onKeyUp',
        args: [
          e.code,
        ],
      }));
    }
  };

  handleResize = () => {
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

export default Game;