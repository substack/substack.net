var hyperglue = require('hyperglue');

var fs = require('fs');
var html = {
    root: fs.readFileSync(__dirname + '/html/root.html'),
    art: fs.readFileSync(__dirname + '/html/art.html'),
    music: fs.readFileSync(__dirname + '/html/music.html'),
    'mad-science': fs.readFileSync(__dirname + '/html/mad_science.html'),
    me: fs.readFileSync(__dirname + '/html/me.html')
};

var avatar = document.getElementById('avatar');
avatar.addEventListener('mouseover', function (ev) {
    avatar.setAttribute('src', '/images/substack_angry.png');
});
avatar.addEventListener('mouseout', function (ev) {
    avatar.setAttribute('src', '/images/substack.png');
});

var content = document.getElementById('content');
var pages = Object.keys(html).reduce(function (acc, key) {
    var elem = acc[key] = hyperglue(html[key]);
    hide(elem);
    content.appendChild(elem);
    return acc;
}, {});

var singlePage = require('single-page');
var showPage = singlePage(function (href) {
    Object.keys(pages).forEach(function (key) {
        hide(pages[key]);
    });
    
    var name = href.replace(/^\//, '');
    
    var prev = document.querySelector('.section.active');
    if (prev) prev.className = prev.className.replace(/\s*\bactive\b\s*/, '');
    
    var section = document.querySelector('.section.' + name);
    if (section) section.className += ' active';
    
    if (href === '/') show(pages.root)
    else if (pages[name]) show(pages[name])
});

var links = document.querySelectorAll('a[href]');
for (var i = 0; i < links.length; i++) (function (link) {
    var href = link.getAttribute('href');
    if (RegExp('^/').test(href)) {
        link.addEventListener('click', function (ev) {
            ev.preventDefault();
            showPage(href);
        });
    }
})(links[i]);

function hide (e) { e.style.display = 'none' }
function show (e) { e.style.display = 'block' }
