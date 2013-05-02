var baudio = require('webaudio');

var textarea = document.querySelector('textarea');
var errdiv = document.querySelector('#error');

var fn = function () { return 0 };
var b = baudio(function (t, i) {
    return fn(t, i);
});

var button = document.querySelector('#play-stop');
button.addEventListener('click', function (ev) {
    var action = button.value;
    button.value = { play: 'stop', stop: 'play' }[button.value];
    
    update();
    
    if (action === 'play') {
        b.play();
    }
    else {
        b.stop();
    }
});

function update () {
    try {
        fn = Function(textarea.value)();
    }
    catch (err) {
        errdiv.appendChild(document.createTextNode(String(err)));
        return;
    }
    errdiv.innerHTML = '';
}
