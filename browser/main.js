var hyperglue = require('hyperglue');

var fs = require('fs');
var html = {
    page: fs.readFileSync(__dirname + '/html/page.html'),
    root: fs.readFileSync(__dirname + '/html/root.html'),
    art: fs.readFileSync(__dirname + '/html/art.html'),
    music: fs.readFileSync(__dirname + '/html/music.html')
};

var body = document.getElementById('body');
var pageNames = [ 'root', 'art', 'music' ];
var pages = pageNames.reduce(function (acc, key) {
    var elem = hyperglue(html.page, { '.page': { _html: html[key] } });
    body.appendChild(elem);
    acc[key] = elem;
    return acc;
}, {});

var singlePage = require('single-page');
var showPage = singlePage(function (href) {
    Object.keys(pages).forEach(function (key) {
        hide(pages[key]);
    });
    
    var name = href.replace(/^\//, '');
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
