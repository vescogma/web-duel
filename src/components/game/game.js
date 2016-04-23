import React, { Component } from 'react';
import gameActions from '../../actions/game';
import gameConstants from '../../constants/game';
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

  /** LISTENER EVENTS **/

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

  /** WORKER EVENTS **/

  setupWorkerEvents = () => {
    this.worker = new Worker('../worker/index.js');
    this.worker.onmessage = (event) => {
      this.handleWorker(event.data);
    };
    this.messageWorker('onstart', [
      gameConstants.GAME_WIDTH,
      gameConstants.GAME_HEIGHT,
    ]);
  };

  messageWorker = (action, options) => {
    var data = { action: action }
    if (options) {
      data.args = options;
    }
    this.worker.postMessage(data);
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
    this.interaction.frequency = 30;
    this.setupStage();
    this.setupCursor();
    this.setupListeners();
    this.setupPlayer();
    this.setupEnemy();
    this.setupGame();
  };

  setupStage = () => {
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.handleResize();
    this.refs.gameCanvas.appendChild(this.renderer.view);
  };

  setupCursor = () => {
    this.cursor = new PIXI.Graphics();
    this.cursor.moveTo(10, 10);
    this.cursor.lineStyle(2, 0xFF5126, 0.8);
    this.cursor.beginFill(0x000000, 0);
    this.cursor.drawCircle(0, 0, 20);
    this.cursor.endFill();
    this.cursor.lineStyle(4, 0xFF5126, 0.8);
    this.cursor.beginFill(0x000000, 0);
    this.cursor.drawCircle(0, 0, 10);
    this.cursor.endFill();
    this.stage.addChild(this.cursor);
  };

  setupListeners = () => {
    this.stage.mousemove = () => {
      this.moveCursor();
    };
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
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.playerSprite);
  };

  setupEnemy = () => {
    const enemyTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
    this.enemySprite = new PIXI.Sprite(enemyTexture);
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
    this.messageWorker('onsend');
    // // this.managePlayers();
    // // this.manageShots();
  };

  /** PLAYER STATES/ACTIONS **/

  moveCursor = () => {
    const mouseEvent = this.interaction.eventData.data.getLocalPosition(this.stage);
    const mouse = { x: mouseEvent.x, y: mouseEvent.y };
    this.cursor.position.set(mouse.x, mouse.y);
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

  handleWorker = (data) => {
    const playerPosition = data.player.position;
    const enemyPosition = data.enemy.position;
    this.playerSprite.position.set(playerPosition.x, playerPosition.y);
    this.enemySprite.position.set(enemyPosition.x, enemyPosition.y);
  };

  handleKeyDown = (e) => {
    if (gameConstants.MOVE_KEYS[e.keyCode]) {
      event.preventDefault();
      this.messageWorker('onKeyDown', [e.code])
    }
  };

  handleKeyUp = (e) => {
    if (gameConstants.MOVE_KEYS[e.keyCode]) {
      event.preventDefault();
      this.messageWorker('onKeyUp', [e.code])
    }
  };

  handleResize = () => {
    const width = gameConstants.GAME_WIDTH;
    const height = gameConstants.GAME_HEIGHT;
    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height,
    );
    this.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.stage.scale.set(scale);
    this.game.scale = scale;
    this.renderer.resize(
      Math.ceil(width * scale),
      Math.ceil(height * scale),
    );
  };
}

export default Game;