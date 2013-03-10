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
        var title = row.title.replace(/\W+/g, '_');
        var elem = hyperglue(html, {
            '.title': (function () {
                var link = document.createElement('a');
                link.setAttribute('href', '/' + title);
                link.appendChild(document.createTextNode(row.title));
                self.emit('link', link, '/' + title);
                return link;
            })(),
            '.commit': row.commit,
            '.author': row.author,
            '.date': row.date,
            '.body': { _html: row.body },
        });
        addLinks(elem);
        self.elements[title] = elem;
    }
    
    function end () {
        self.loading = false;
        self.emit('ready');
        
        if (window.location.hash) {
            var h = window.location.hash;
            window.location.hash = '';
            window.location.hash = h;
        }
    }
};

inherits(Articles, EventEmitter);

Articles.prototype.showAll = function (opts) {
    var self = this;
    if (!opts) opts = {};
    if (opts.summary === undefined) opts.summary = true;
    
    if (self.loading) {
        return self.on('ready', function () { self.showAll(opts) });
    }
    
    var titles = Object.keys(self.elements);
    titles.forEach(function (t) {
        var elem = self.elements[t];
        if (opts.summary) {
            elem.className += ' summary';
            elem.addEventListener('click', function (ev) {
                if (!/\bsummary\b/.test(elem.className)) return;
                ev.preventDefault();
                self.emit('show', t);
            });
        }
        vis.show(elem);
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
    
    var elem = self.elements[title.replace(/\W+/g, '_')];
    elem.className = elem.className.replace(/\s*\bsummary\b\s*/g, '');
    vis.show(elem);
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

function addLinks (elem) {
    var body = elem.querySelector('.body');
    var anchors = {};
    var nodes = [].slice.call(body.childNodes);
    nodes.forEach(function (node) {
        var tag = String(node.tagName).toLowerCase();
        if (/^h\d+/.test(tag)) {
            var name = node.textContent.replace(/\W+/g, '-');
            if (anchors[name]) name = name.replace(/\d*$/, function (x) {
                return Number(x) + 1;
            });
            var anchor = document.createElement('a');
            anchor.setAttribute('name', name);
            anchor.setAttribute('id', 'article-anchor-' + name);
            anchors[name] = anchor;
            body.insertBefore(anchor, node);
        }
    });
}
