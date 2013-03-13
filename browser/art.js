var hyperquest = require('hyperquest');
var shuffle = require('deck').shuffle;

module.exports = function () { return new Art };

function Art () {
    var self = this;
    self.element = document.createElement('div');
    self.pageIndex = 0;
    self.pages = [];
    
    loadImages(function (images) {
        images.forEach(function (src, ix) {
            var i = ix % 10;
            var j = Math.floor(ix / 10);
            var page = self.pages[j];
            if (!page) {
                page = self.pages[j] = document.createElement('div');
                page.className = 'page';
                if (j === self.pageIndex) page.className += ' active';
                self.element.appendChild(page);
            }
            
            var link = document.createElement('a');
            link.setAttribute('href', '/images/' + src);
            
            var img = document.createElement('img');
            img.setAttribute('src', '/images/' + src);
            
            link.appendChild(img);
            page.appendChild(link);
        });
    });
}

Art.prototype.appendTo = function (target) {
    var self = this;
    if (typeof target === 'string') target = document.querySelector(target);
    target.appendChild(self.element);
};

Art.prototype.next = function () {};
Art.prototype.prev = function () {};

function loadImages (cb) {
    var r = hyperquest('http://' + window.location.host + '/images.json');
    
    var data = '';
    r.on('data', function (buf) { data += buf });
    r.on('end', function () {
        self.images = shuffle(JSON.parse(data)).filter(function (file) {
            return /\.(png|jpg)$/.test(file);
        });
        cb(self.images);
    });
};
