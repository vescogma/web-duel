
var ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

var simWorker = new Worker('sim.js');

simWorker.onmessage = function(message) {
  console.log(message.data);
};

requestAnimationFrame(function () {
  simWorker.postMessage({type: 'requestAnimationFrame'});
});