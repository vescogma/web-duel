function setupSocket() {
  socket.on('enemy', data => {
    worker.enemy.position = {
      x: (worker.width - data.player.position.x),
      y: data.player.position.y,
    };
  });
  socket.on('player', data => {
    console.log('client ' + data.client + ' ' + data.status);
    console.log('total clients: ' + data.count);
  });
  socket.on('room', data => {
    console.log('player ' + data.player + ' ' + data.action);
    console.log('players in room: ' + data.count);
  });
}

function sendSocketData() {
  const data = {
    player: {
      position: {
        x: worker.player.position.x,
        y: worker.player.position.y,
      },
    },
  };
  socket.emit('data', data);
}