var handlers = {
  requestAnimationFrame: rafHandler
};

onmessage = function (message) {
  handlers[message.data.type](message);
}

function rafHandler() {
  postMessage({'foo': 'bar'});
};