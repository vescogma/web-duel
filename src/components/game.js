import React, { Component } from 'react';
import { connect } from 'react-redux';
import PIXI from 'pixi.js';
import { divideBy } from '../utils/game-utils';

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      height: props.height,
      zoomLevel: props.zoomLevel,
    };
  }

  componentDidMount(){
    this.loadResources();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ zoomLevel: nextProps.zoomLevel });
    this.setZoomScale(nextProps.zoomLevel);
  }

  setZoomScale = (level) => {
    this.stage.scale.x = level || this.state.zoomLevel;
    this.stage.scale.y = level || this.state.zoomLevel;
  };

  render() {
    return (
      <div ref="gameCanvas">
      </div>
    );
  }

  loadResources = () => {
    PIXI.loader
      .add([
        { key: 'player', url: '../assets/images/player-sprite.png' }
      ])
      .on("progress", this.loadProgress)
      .load(this.setupScene);
  };

  loadProgress = (loader, resource) => {
    console.log("loading: " + resource.name); 
    console.log("progress: " + loader.progress + "%"); 
  };

  setupScene = (loader, resources) => {
    // renderer and stage setup
    this.resources = resources;
    this.stage = new PIXI.Container();
    this.renderer = new PIXI.autoDetectRenderer(
      this.state.width,
      this.state.height,
      { 
        backgroundColor: 0x1099bb,
        antialias: false,
        transparent: false,
        resolution: 1,
      },
    );
    this.renderer.autoResize = true;
    this.refs.gameCanvas.appendChild(this.renderer.view);
    // sprite creation
    const playerTexture = this.resources.player.texture;
    playerTexture.frame = new PIXI.Rectangle(64, 0, 64, 64);
    this.playerSprite = new PIXI.Sprite(playerTexture);
    this.playerSprite.anchor.set(0.5, 0.5);
    this.playerSprite.position.set(
      divideBy(this.state.width, 2),
      divideBy(this.state.height, 2),
    );
    this.stage.addChild(this.playerSprite);
    this.setState({ gameState: this.play })
    this.animate();
  };

  animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    this.state.gameState();
    this.renderer.render(this.stage);
  };

  play = () => {
    this.playerSprite.pivot.set(0.5, 0.5);
    const x = this.playerSprite.position.x;
    const y = this.playerSprite.position.y;
    this.playerSprite.position.set(
      x >= this.state.width ? 0 : x + 1,
      y >= this.state.height ? 0 : y + 1,
    );
  };

  wobble = () => {
    this.playerSprite.pivot.set(0.25, 0.25);
    this.playerSprite.rotation = (this.playerSprite.rotation + 0.05) % 1;
  };
}

export default Game;