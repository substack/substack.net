var http = require('http');
var hyperstream = require('hyperstream');
var qs = require('querystring');
var fs = require('fs');
var path = require('path');
var archive = require('./archive.json');
var renderArticles = require('./render/article.js');

var glog = require('glog')({
    repodir: process.argv[2] || process.env.HOME + '/data',
    id: 'http://substack.net',
    title: "substack in cyberspace"
});

var ecstatic = require('ecstatic');
var staticd = ecstatic({
    root: __dirname + '/static',
    showDir: true,
    autoIndex: true,
    gzip: true
});
var scratch = ecstatic(process.env.HOME + '/data/scratch');

var server = http.createServer(function (req, res) {
    if (glog.test(req.url)) return glog(req, res);
    
    if (req.url === '/images.json') {
        var imgdir = path.join(__dirname, 'static', 'images');
        return fs.readdir(imgdir, function (err, files) {
            if (err) return res.end(err + '\n');
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(files));
        });
    }
    if (RegExp('^/posts/').test(req.url)) {
        var id = RegExp('^/posts/(.*)').exec(req.url)[1];
        if (archive[id]) {
            res.statusCode = 301;
            res.setHeader('location', '/' + archive[id]);
            res.end('moved permanently');
            return;
        }
    }
    
    if (req.url.split('?')[0] === '/') {
        res.setHeader('content-type', 'text/html');
        var root = hyperstream({
            '.articles': glog.list()
                .pipe(glog.inline('html'))
                .pipe(renderArticles())
        });
        var hs = hyperstream({
            '#root': root,
        });
        hs.pipe(res);
        fs.createReadStream(__dirname + '/static/index.html').pipe(hs);
        fs.createReadStream(__dirname + '/static/pages/root.html').pipe(root);
        return;
    }
    if (!/^\/[^\.\/]*$/.test(req.url)) {
        if (RegExp('^/(images|doc|projects|audio|video)\\b').test(req.url)) {
            return staticd(req, res);
        }
        else if (RegExp('^/scratch($|/)').test(req.url)) {
            req.url = req.url.replace(RegExp('^/scratch($|/)'), '/');
            return scratch(req, res);
        }
        else return staticd(req, res);
    }
    
    res.setHeader('content-type', 'text/html');
    
    var indexFile = path.join(__dirname, 'static', '/index.html');
    var indexStream = fs.createReadStream(indexFile);
    
    var pages = [ 'root', 'art', 'mad-science', 'music', 'code', 'me' ];
    var streams = pages.reduce(function (acc, page) {
        var name = page.replace(/-/g, '_') + '.html';
        var file = path.join(__dirname, 'static', 'pages', name);
        acc['#' + page] = fs.createReadStream(file);
        return acc;
    }, {});
    
    indexStream.pipe(hyperstream(streams)).pipe(res);
});
server.listen(process.env.PORT || Number(process.argv[3]));
