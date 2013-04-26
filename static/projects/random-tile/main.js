var raphael = require('raphael-browserify');
var div = document.createElement('div');
var grid = raphael(div, 1100, 800);

function createTile (tx, ty) {
    var pt = fromTile(tx, ty);
    var x = pt[0], y = pt[1];
    
    var points = [
        [ x - 0.5, y ],
        [ x, y - 0.5 ],
        [ x + 0.5, y ],
        [ x, y + 0.5 ],
    ];
    var tile = grid.path(polygon(points.map(toWorld)));
    tile.attr('stroke-width', '1');
    tile.attr('fill', 'rgba(0,0,127,0.5)');
    tile.attr('stroke', 'rgba(0,0,64,0.5)');
    return tile;
}

function fromTile (x, y) {
    return [ x / 2 + y / 2, -x / 2 + y / 2 ];
}

function toWorld (pt) {
    var x = pt[0] + 6;
    var y = pt[1] + 6;
    return [ x * 100, y * 50 ];
}

function polygon (points) {
    var xs = points.map(function (p) { return p.join(',') });
    console.log('M' + xs[0] + ' L' + xs.slice(1).join(' ') + ' Z');
    return 'M' + xs[0] + ' L' + xs.slice(1).join(' ') + ' Z';
}

setInterval(function () {
    var x = Math.floor(Math.random() * 10) - 5;
    var y = Math.floor(Math.random() * 10) - 5;
    var t = createTile(x, y);
    
    setTimeout(function () {
        t.remove();
    }, 5000);
}, 50);

document.body.appendChild(div);
