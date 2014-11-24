var url = require('url');
var qs = require('querystring');
var xhr = require('xhr');
var through = require('through2');

module.exports = function (target) {
    var commit = target.querySelector('.article:last-child .commit');
    var u = url.resolve(location.href, '/blog.json?' + qs.stringify({
        limit: 5,
        after: commit ? commit.textContent : 0,
        inline: 'html'
    }));
    
    var output = through.obj();
    xhr(u, function (err, res, body) {
        if (err || !/^2/.test(res.status)) return;
        
        var rows = JSON.parse(body.toString('utf8'));
        for (var i = 0; i < rows.length; i++) {
            output.push(rows[i]);
        }
        output.push(null);
        
        if (rows.length < 5) {
            output.emit('no-more');
        }
    });
    return output;
};
