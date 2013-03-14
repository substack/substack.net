var articles = require('./articles')();
articles.appendTo('#root .articles');

var art = require('./art')();
art.appendTo('#art');

var vis = require('./vis');

var avatar = document.getElementById('avatar');
avatar.addEventListener('mouseover', function (ev) {
    avatar.setAttribute('src', '/images/substack_angry.png');
});
avatar.addEventListener('mouseout', function (ev) {
    avatar.setAttribute('src', '/images/substack.png');
});

var pages = [].slice.call(document.querySelectorAll('.page'))
    .reduce(function (acc, elem) {
        acc[elem.getAttribute('id')] = elem;
        return acc;
    }, {})
;

var singlePage = require('single-page');
var showPage = singlePage(function (href) {
    Object.keys(pages).forEach(function (key) {
        vis.hide(pages[key]);
    });
    
    var prev = document.querySelector('.section.active');
    if (prev) prev.className = prev.className.replace(/\s*\bactive\b\s*/, '');
    
    var name = href.replace(/^\//, '');
    
    if (href === '/') {
        vis.show(pages.root);
        return articles.showAll();
    }
    
    var section = document.querySelector('.section.' + name);
    if (section) section.className += ' active';
    
    if (pages[name]) vis.show(pages[name])
    else {
        vis.show(pages.root);
        articles.show(name);
    }
});

var links = document.querySelectorAll('a[href]');
for (var i = 0; i < links.length; i++) (function (link) {
    var href = link.getAttribute('href');
    if (RegExp('^/').test(href)) {
        link.addEventListener('click', function (ev) {
            if (ev.ctrlKey) return;
            ev.preventDefault();
            showPage(href);
        });
    }
})(links[i]);

articles.on('link', function (link, href) {
    link.addEventListener('click', function (ev) {
        ev.preventDefault();
        showPage(href);
    });
});

articles.on('show', showPage);
