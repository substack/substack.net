var swoop = require('../');
var domready = require('domready');
var yarn = require('./yarn');

domready(function () {
    var sw = swoop({
        foo : yarn('foo.html'),
        bar : yarn('bar.html'),
        baz : yarn('baz.html'),
        beep : yarn('beep.html'),
        boop : yarn('boop.html'),
        end : yarn('end.html')
    });
    sw.size(800, 600);
    sw.appendTo(document.body);
    sw.show('foo');
});
