var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('../webpack.config.js');

var publicPath = path.join(__dirname, '../public/');
var port = 3000;

var compiler = webpack(config);
var middleware = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: { colors: true },
});

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

var app = express();
app.use(middleware);
app.use(webpackHotMiddleware(compiler));
app.use(express.static(publicPath));

app.listen(port, '0.0.0.0', function (err) {
  if (err) {
    console.log(err);
  }
  console.info('Listening on port %s.', port);
});