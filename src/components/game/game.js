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
    };
    this.player = {
      shots: [],
    };
    this.enemy = {
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
    this.worker.onmessage = event => this.handleWorker(event.data);
    this.messageWorker('onstart', [gameConstants.GAME_WIDTH, gameConstants.GAME_HEIGHT]);
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
    this.interaction.interactionFrequency = 30;
    this.setupStage();
    this.setupCursor();
    this.setupListeners();
    this.setupShots();
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

  setupShots = () => {
    this.shotTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
  };

  setupPlayer = () => {
    const playerTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
    this.player.sprite = new PIXI.Sprite(playerTexture);
    this.player.sprite.anchor.set(0.5, 0.5);
    this.player.sprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH / 4),
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.player.sprite);
  };

  setupEnemy = () => {
    const enemyTexture = window.devicePixelRatio >= 2 ?
      this.resources.player128.texture : this.resources.player64.texture;
    this.enemy.sprite = new PIXI.Sprite(enemyTexture);
    this.enemy.sprite.anchor.set(0.5, 0.5);
    this.enemy.sprite.scale.set(-1, 1);
    this.enemy.sprite.position.set(
      Math.floor(gameConstants.GAME_WIDTH * 3 / 4),
      Math.floor(gameConstants.GAME_HEIGHT / 2),
    );
    this.stage.addChild(this.enemy.sprite);
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
  };

  moveCursor = () => {
    const mouseEvent = this.interaction.eventData.data.getLocalPosition(this.stage);
    const mouse = { x: mouseEvent.x, y: mouseEvent.y };
    this.cursor.position.set(mouse.x, mouse.y);
  };

  /** SHOT HANDLERS **/

  shoot = () => {
    const mouseEvent = this.interaction.eventData.data.getLocalPosition(this.stage);
    const mouse = { x: mouseEvent.x, y: mouseEvent.y };
    const speed = 10;
    this.messageWorker('shoot', [mouse, speed]);
  };

  /** GAME HANDLERS **/

  handleWorker = (data) => {
    const shotsToRemove = [];
    this.player.shots.map((shot, index) => {
      const workerIndex = data.player.shots.findIndex(workerShot => {
        return workerShot.timestamp === shot.timestamp;
      });
      if (workerIndex !== -1) {
        shot.current = data.player.shots[workerIndex].current;
        shot.sprite.position.set(shot.current.x, shot.current.y);
      } else {
        shotsToRemove.push(index);
      }
      return shot;
    });
    shotsToRemove.reverse().map(shotIndex => {
      this.stage.removeChild(this.player.shots[shotIndex].sprite);
      this.player.shots.splice(shotIndex, 1);
      return shotIndex;
    });
    const shotsToAdd = data.player.shots.filter(shot => {
      const clientIndex = this.player.shots.findIndex(clientShot => {
        return clientShot.timestamp === shot.timestamp;
      });
      return clientIndex === -1;
    });
    shotsToAdd.map(shot => {
      const shotTexture = window.devicePixelRatio >= 2 ?
        this.resources.player128.texture : this.resources.player64.texture;
      shot.sprite = new PIXI.Sprite(shotTexture);
      shot.sprite.anchor.set(0.5, 0.5);
      shot.sprite.position.set(shot.current.x, shot.current.y);
      this.stage.addChild(shot.sprite);
    });
    // add logic
    this.player.shots = this.player.shots.concat(shotsToAdd);
    this.player.sprite.position.set(data.player.position.x, data.player.position.y);
    this.enemy.sprite.position.set(data.enemy.position.x, data.enemy.position.y);
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