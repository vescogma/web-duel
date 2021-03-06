var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('../webpack.config.js');

var publicPath = path.join(__dirname, '../src/');
var port = 3333;

var compiler = webpack(config);
var middleware = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: { colors: true },
  noInfo: true,
});

var app = express();
app.use(middleware);
app.use(webpackHotMiddleware(compiler));
app.use(express.static(publicPath));

var server = app.listen(port, '0.0.0.0', function (err) {
  if (err) {
    console.log(err);
  }
  console.info('Listening on port %s.', port);
});

var io = require('socket.io')(server);

//GAME STUFF

var players = {};
var sockets = {};
var rooms = {};
var roomCounter = 0;

var GAME_WIDTH = 1080;
var GAME_HEIGHT = 720;

io.on('connection', function (socket) {
  console.log('client ' + socket.client.id + ' connected');
  players[socket.client.id] = {
    id: socket.client.id,
    socket: socket,
    lifeHits: [],
    life: 10,
    data: {
      position: {},
      shots: [],
    },
  };
  io.emit('client', {
    client: socket.client.id,
    status: 'connected',
    count: io.engine.clientsCount,
  });
  socket.emit('message', {
    message: 'you are connected',
  });
  joinRoom(socket.client.id, socket);
  socket.on('data', function (data) {
    var socket = this;
    var player = players[socket.client.id];
    var roomKey = player.room;
    var enemyID = findEnemy(socket.client.id, roomKey);
    mergeData(socket.client.id, data);
    if (enemyID !== -1)  {
      var enemy = players[enemyID];
      enemy.data.shots.map(function(shot) {
        var playerPos = mirror(player.data.position);
        if (hit(shot.position, playerPos)){
          if (hitCheck(player.id, shot.timestamp) === -1) {
            player.lifeHits.push(shot.timestamp);
            player.life = player.life - 1;
            console.log(player.id + ' was hit');
            io.to(roomKey).emit('hit', { id: player.id, life: player.life });
          }
        }
      });
      io.to('/#' + enemy.id).emit('enemy', sendEnemyData(player));
    }
    io.to('/#' + player.id).emit('player', sendPlayerData(player));
  });
  socket.on('disconnect', function () {
    console.log('client ' + this.client.id + ' disconnected');
    var id = this.client.id;
    leaveRoom(id, this);
    delete players[id];
    io.emit('player', {
      client: id,
      status: 'disconnected',
      count: io.engine.clientsCount,
    });
  });
});

function hitCheck(id, shotID) {
  return players[id].lifeHits.findIndex(function (hits) {
    return hits === shotID;
  });
}

function mirror(pos) {
  return { x: GAME_WIDTH - pos.x, y: pos.y };
}

function hit(shot, enemy) {
  if ((shot.x > enemy.x - 50 && shot.x < enemy.x + 50) &&
    (shot.y > enemy.y - 50 && shot.y < enemy.y + 50)) {
    return true;
  }
  return false;
}

function findEnemy(id, room) {
  var enemyIndex = rooms[room].players.findIndex(function (player) {
    return player.id !== id;
  });
  return enemyIndex === -1 ? -1 : rooms[room].players[enemyIndex].id;
}

function sendEnemyData(enemy) {
  return {
    position: enemy.data.position,
    shots: enemy.data.shots,
    life: enemy.life,
  };
}

function sendPlayerData(player) {
  return {
    life: player.life,
  };
}

function mergeData(id, newData) {
  players[id].data.position = newData.position;
  players[id].data.shots = newData.shots;
}

function leaveRoom(id, socket) {
  var room = players[id].room;
  var index = rooms[room].players.findIndex(function (player) {
    return player.id === id;
  });
  socket.leave(room);
  rooms[room].players.splice(index, 1);
  delete players[id].room;
  io.to(room).emit('room', {
    player: id,
    action: 'left room ' + room,
    count: rooms[room].players.length,
  });
}

function joinRoom(playerID, socket) {
  var chosen;
  var available = Object.keys(rooms).findIndex(function (roomKey) {
    return rooms[roomKey].players.length < 2;
  })
  if (available === -1) {
    rooms[roomCounter] = {
      players: [
        { id: playerID },
      ],
    };
    chosen = roomCounter;
    roomCounter += 1;
  } else {
    rooms[available].players.push({ id: playerID });
    chosen = available;
  }
  players[playerID].room = chosen;
  socket.join(chosen);
  io.to(chosen).emit('room', {
    player: playerID,
    action: 'joined room ' + chosen,
    count: rooms[chosen].players.length,
  })
}
