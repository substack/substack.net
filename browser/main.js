var classList = require('class-list');

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
