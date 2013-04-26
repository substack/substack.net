var sorta = require('../../');
var $ = require('jquery-browserify');

var s = sorta(function (row) {
    var name = $('<span>').attr('class', 'name').text(row.key);
    var rank = $('<span>').attr('class', 'rank');
    var score = $('<span>').attr('class', 'score');
    
    var up = $('<input>')
        .attr('type', 'button')
        .val('+')
        .click(function () { row.update(row.value + 1) })
    ;
    
    var down = $('<input>')
        .attr('type', 'button')
        .val('-')
        .click(function () { row.update(Math.max(0, row.value - 1)) })
    ;
    
    row.on('update', function () {
        rank.text(row.index + 1);
        score.text(row.value);
    });
    
    return $('<div>').append(
        '#', rank, ' ', name, ', ', score, ' points', up, down
    )[0];
});
s.appendTo(document.body);

s.write({ key : 'robots', value : 0 });
s.write({ key : 'dinosaurs', value : 0 });
s.write({ key : 'insects', value : 0 });
s.write({ key : 'electromagnets', value : 0 });
