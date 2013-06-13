var through = require('through');
var fs = require('fs');
var hyperglue = require('hyperglue');
var html = fs.readFileSync(__dirname + '/article.html');

module.exports = function () {
    return through(function (row) {
        this.queue(hyperglue(html, {
            '.title': row.title,
            '.author': row.author,
            '.date': row.date,
            '.commit': row.commit,
            '.body': { _html: row.body }
        }).outerHTML);
    });
};
