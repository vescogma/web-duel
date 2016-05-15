function setupSocket() {
  socket.on('enemy', data => {
    worker.enemy.position = {
      x: (worker.width - data.position.x),
      y: data.position.y,
    };
    worker.enemy.shots = data.shots.map(shot => {
      shot.position = {
        x: (worker.width - shot.position.x),
        y: shot.position.y,
      };
      return shot;
    });
    worker.enemy.life = data.life;
  });
  socket.on('player', data => {
    worker.player.life = data.life;
  });
  socket.on('client', data => {
    console.log('client ' + data.client + ' ' + data.status);
    console.log('total clients: ' + data.count);
  });
  socket.on('hit', data => {
    console.log('client ' + data.id + ' was hit!');
  });
  socket.on('room', data => {
    console.log('player ' + data.player + ' ' + data.action);
    console.log('players in room: ' + data.count);
  });
}

function sendSocketData() {
  const data = {
    position: {
      x: worker.player.position.x,
      y: worker.player.position.y,
    },
    shots: worker.player.shots,
    // life: worker.player.life,
  };
  socket.emit('data', data);
}