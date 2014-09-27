var hyperspace = require('hyperspace');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/article.html', 'utf8');

module.exports = function (opts) {
    if (!opts) opts = {};
    
    return hyperspace(html, function (row) {
        return {
            '.article': opts.summary ? { 'class': 'article summary' } : {},
            '.title a': {
                _text: row.title,
                href: row.href
            },
            '.author': row.author,
            '.date': row.date,
            '.commit': row.commit,
            '.body': { _html: row.body }
        };
    });
};
