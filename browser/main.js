var classList = require('class-list');
var colorname = require('colornames');

var avatar = document.getElementById('avatar');
avatar.addEventListener('mouseover', function (ev) {
    avatar.setAttribute('src', '/images/substack_angry.png');
});
avatar.addEventListener('mouseout', function (ev) {
    avatar.setAttribute('src', '/images/substack.png');
});

var root = document.querySelector('#root');

if (root) {
    var render = require('../render/article.js')({ summary: true });
    render.on('element', function (elem) {
        if (!classList(elem).contains('summary')) return;
        
        var link = elem.querySelector('.title a')
        var href = link.getAttribute('href');
        var title = link.textContent || link.innerText;
         
        elem.addEventListener('click', function onclick (ev) {
            ev.preventDefault();
            this.removeEventListener('click', onclick);
            classList(this).remove('summary');
            
            var articles = root.querySelectorAll('.article');
            for (var i = 0; i < articles.length; i++) {
                if (articles[i] === elem) continue;
                classList(articles[i]).add('hide');
            }
            
            if (window.history && window.history.pushState) {
                classList(more).remove('hide');
                window.history.pushState(null, title, href);
                window.scrollTo(0);
            }
            else location.href = href;
        });
    });
    render.appendTo('#root .articles');
    
    if (window.addEventListener) {
        window.addEventListener('popstate', function (ev) {
            if (location.pathname === '/') {
                var articles = root.querySelectorAll('.article');
                for (var i = 0; i < articles.length; i++) {
                    var c = classList(articles[i]);
                    c.add('summary');
                    c.remove('hide');
                    classList(more).remove('hide');
                }
            }
        });
    }
    
    var moreArticles = require('./more_articles.js');
    var more = root.querySelector('.more');
    
    more.addEventListener('click', function (ev) {
        var m = moreArticles(root)
        m.pipe(render, { end: false });
        m.on('no-more', function () {
            classList(more).add('hide');
        });
    });
}

var art = document.querySelector('#art');
if (art) require('./art.js')().appendTo(art);

var banner = document.querySelector('#banner a');
if (banner) (function () {
    var chars = String(banner.textContent || '').split('');
    banner.textContent = '';
    var elems = [];
    for (var i = 0; i < chars.length; i++) {
        var span = document.createElement('span');
        span.textContent = chars[i];
        elems.push(span);
        banner.appendChild(span);
    }
    
    var offset = 0;
    var colors = [ 'cyan', 'magenta', 'orange', 'lime' ];
    var colorx = [];
    for (var i = 0; i < colors.length; i++) {
        var a = phex(colorname(colors[i]));
        var b = phex(colorname(colors[(i+1)%colors.length]));
        var steps = 10;
        for (var j = 0; j < steps; j++) {
            var ja = 1 - j/steps, jb = j/steps;
            colorx.push(shex([
                a[0] * ja + b[0] * jb,
                a[1] * ja + b[1] * jb,
                a[2] * ja + b[2] * jb
            ]));
        }
    }
    
    setInterval(function () {
        for (var i = 0; i < elems.length; i++) {
            var ix = Math.abs(i - offset) % colorx.length;
            elems[i].style.color = colorx[ix];
        }
        offset ++;
    }, 50);
})();

function phex (s) {
    return s.slice(1).split(/(\w\w)/).filter(Boolean)
        .map(function (x) { return parseInt(x,16) })
    ;
}

function shex (xs) {
    return '#' + xs.map(tos).join('');
    function tos (x) { return (x < 16 ? '0' : '') + Math.floor(x).toString(16) }
}
