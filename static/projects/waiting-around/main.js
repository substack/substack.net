var files = {
    'images/robot.png' : 0.6,
    'images/twain.png' : 0.7,
    'images/trex.png' : 1,
    'images/poe.png' : 1,
    'images/triceratops.png' : 1,
    'images/t-rex.png' : 1,
    'images/apatosaur.png' : 1,
    'images/raptor.png' : 1,
    'images/spy.png' : 0.8
};

var createQueue = require('../');
var queue = createQueue(files, { height : 300 });
queue.appendTo(document.body);

window.addEventListener('resize', function () {
    queue.resize(window.innerWidth, 300);
});

var spot = 35;
var total = 80;
var iv = setInterval(function () {
    spot --;
    total --;
    if (spot === 0) return clearInterval(iv);
    
    queue.spot(spot, total);
}, 250);
