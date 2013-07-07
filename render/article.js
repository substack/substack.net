var through = require('through');
var fs = require('fs');
var hyperglue = require('hyperglue');
var html = fs.readFileSync(__dirname + '/article.html');

module.exports = function (opts) {
    if (!opts) opts = {};
    
    return through(function (row) {
        this.queue(hyperglue(html, {
            '.article': opts.summary ? { 'class': 'article summary' } : {},
            '.expand': opts.summary ? { href: row.href } : {},
            '.title a': {
                _text: row.title,
                href: row.href
            },
            '.author': row.author,
            '.date': row.date,
            '.commit': row.commit,
            '.body': { _html: row.body }
        }).outerHTML);
    });
};
