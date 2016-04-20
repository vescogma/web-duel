var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('../webpack.config.js');

var publicPath = path.join(__dirname, '../src/');
var port = 3000;

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

io.on('connection', function (socket) {
  players[socket.client.id] = {
    id: socket.client.id,
    socket: socket,
  }
  io.emit('player', {
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
    var roomKey = players[socket.client.id].room;
    var enemyID = findEnemy(socket.client.id, roomKey)
    if (enemyID !== -1)  {
      io.to('/#' + enemyID).emit('enemy', data);
    }
  });
  socket.on('disconnect', function () {
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

function findEnemy(id, room) {
  var enemyIndex = rooms[room].players.findIndex(function (player) {
    return player.id !== id;
  });
  return enemyIndex === -1 ? -1 : rooms[room].players[enemyIndex].id;
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
