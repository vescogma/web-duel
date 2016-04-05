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
// var nsp = io.of('/my-namespace');
// nsp.on('connection', function(socket){
//   console.log('someone connected'):
// });
// nsp.emit('hi', 'everyone!');

// server.listen(8080);

var playerCount = 0;
var roomCounter = 0;
var rooms = [];
var players = [];

io.on('connection', function (socket) {
  playerCount += 1;
  io.on('disconnect', function () {
    playerCount -= 1;
  })
  var roomIndex = rooms.findIndex(function (room) {
    return room.playerCount < 2;
  });
  if (roomIndex === -1) {
    rooms.push({
      playerCount: 1,
      players: [
        { id: socket.client.id },
      ],
    })
    roomIndex = 0;
  } else {
    rooms[roomIndex].players.push({ id: socket.client.id });
    rooms[roomIndex].playerCount += 1;
  }
  players.push({
    room: roomIndex,
    id: socket.client.id,
  })
  socket.emit('room', { message: 'joined room ' + roomIndex });
});

