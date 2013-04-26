var tilemap = require('../');
var grid = tilemap(window.outerWidth, window.outerHeight);
grid.appendTo(document.body);

for (var x = -10; x < 10; x++) {
    for (var y = -10; y < 10; y++) {
        var tile = grid.createTile(x, y);
        tile.element.attr('fill', 'rgba(210,210,210,1.0)');
        tile.element.attr('stroke-width', '1');
        tile.element.attr('stroke', 'rgb(255,255,200)');
    }
}

window.addEventListener('resize', function (ev) {
    grid.resize(window.outerWidth, window.outerHeight);
});

grid.on('mouseover', function (tile) {
    tile.element.toFront();
    tile.element.attr('fill', 'rgba(255,127,127,0.8)');
});

grid.on('mouseout', function (tile) {
    tile.element.toBack();
    tile.element.attr('fill', 'rgba(210,210,210,1.0)');
});

grid.on('mousedown', function (tile) {
    if (grid.itemAt(tile.x, tile.y)) {
        grid.removeItem(tile.x, tile.y);
    }
    else grid.createItem(
        'http://substack.net/projects/datacenter/rack_0.png',
        tile.x, tile.y
    );
});
