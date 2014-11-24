var xhr = require('xhr');
var shuffle = require('deck').shuffle;

module.exports = function () { return new Art };

function Art () {
    var self = this;
    self.root = document.createElement('div');
    self.root.className = 'list';
    
    self.element = document.createElement('div');
    self.root.appendChild(self.element);
    
    var more = self.moreLink = document.createElement('div');
    more.className = 'more';
    more.appendChild(document.createTextNode('more'));
    more.addEventListener('click', function (ev) {
        ev.preventDefault();
        self.more();
    });
    
    self.root.appendChild(more);
    
    self.limit = 0;
    self.showing = 0;
    
    loadImages(function (images) {
        self.images = images;
        self.more();
    });
}

Art.prototype.appendTo = function (target) {
    var self = this;
    if (typeof target === 'string') target = document.querySelector(target);
    target.appendChild(self.root);
};

Art.prototype.more = function () {
    var self = this;
    if (!self.moreLink) return;
    
    self.limit += 10;
    self.images.slice(self.showing, self.limit)
        .forEach(function (src) { self.render(src) })
    ;
    self.showing += 10;
    if (self.showing >= self.images.length) {
        self.root.removeChild(self.moreLink);
        self.moreLink = null;
    }
};

Art.prototype.render = function (src) {
    var link = document.createElement('a');
    link.setAttribute('href', '/images/' + src);
    
    var img = document.createElement('img');
    img.setAttribute('src', '/images/' + src);
    link.appendChild(img);
    
    this.element.appendChild(link);
};

function loadImages (cb) {
    var u = 'http://' + window.location.host + '/images.json';
    xhr(u, function (err, res, body) {
        if (err || !/^2/.test(res.statusCode)) return;
        var data = body.toString('utf8');
        
        self.images = shuffle(JSON.parse(data)).filter(function (file) {
            return /\.(png|jpg)$/.test(file);
        });
        cb(self.images);
    });
};
