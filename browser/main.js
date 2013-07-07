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
        elem.addEventListener('click', function onclick (ev) {
            ev.preventDefault();
            this.removeEventListener('click', onclick);
            classList(this).remove('summary');
        });
    });
    render.appendTo('#root .articles');
    
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
