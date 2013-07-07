var hyperquest = require('hyperquest');
var through = require('through');
var concat = require('concat-stream');
var url = require('url');
var qs = require('querystring');

module.exports = function (target) {
    var commit = target.querySelector('.article:last-child .commit');
    var u = url.resolve(location.href, '/blog.json?' + qs.stringify({
        limit: 5,
        after: commit ? commit.textContent : 0,
        inline: 'html'
    }));
    
    var output = through();
    hyperquest(u).pipe(concat(function (body) {
        var rows = JSON.parse(body);
        for (var i = 0; i < rows.length; i++) {
            output.queue(rows[i]);
        }
        output.queue(null);
        
        if (rows.length < 5) {
            output.emit('no-more');
        }
    }));
    return output;
};
