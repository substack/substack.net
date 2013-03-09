var hyperquest = require('hyperquest');
var JSONStream = require('JSONStream');
var hyperglue = require('hyperglue');
var EventEmitter = require('events').EventEmitter;
var through = require('through');
var inherits = require('inherits');

var vis = require('./vis');

var fs = require('fs');
var html = fs.readFileSync(__dirname + '/html/article.html');

module.exports = function () {
    var uri = 'http://' + window.location.host + '/blog.json?inline=html';
    return new Articles(uri);
};

function Articles (uri) {
    var self = this;
    self.elements = {};
    self.loading = true;
    
    var hq = hyperquest(uri);
    var parser = hq.pipe(JSONStream.parse([ true ]));
    parser.pipe(through(write, end));
    
    function write (row) {
        var elem = hyperglue(html, {
            '.body': { _html: row.body }
        });
        var title = row.title.replace(/\W+/g, '_');
        self.elements[title] = elem;
    }
    
    function end () {
        self.loading = false;
        self.emit('ready');
    }
};

inherits(Articles, EventEmitter);

Articles.prototype.showAll = function () {
    var self = this;
    if (self.loading) return self.on('ready', self.showAll);
    
    var titles = Object.keys(self.elements);
    titles.forEach(function (t) {
        vis.show(self.elements[t]);
    });
};

Articles.prototype.show = function (title) {
    var self = this;
    if (self.loading) {
        return self.on('ready', function () { self.show(title) });
    }
    
    var titles = Object.keys(self.elements);
    titles.forEach(function (t) {
        vis.hide(self.elements[t]);
    });
    
    vis.show(self.elements[title.replace(/\W+/g, '_')]);
};

Articles.prototype.appendTo = function (target) {
    var self = this;
    if (self.loading) {
        return self.on('ready', function () { self.appendTo(target) });
    }
    if (typeof target === 'string') target = document.querySelector(target);
    
    var titles = Object.keys(self.elements);
    titles.forEach(function (t) {
        target.appendChild(self.elements[t]);
    });
};
