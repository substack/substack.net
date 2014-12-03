var http = require('http');
var trumpet = require('trumpet');
var qs = require('querystring');
var fs = require('fs');
var path = require('path');
var archive = require('./archive.json');
var renderArticles = require('./render/article.js');
var through = require('through2');

var glog = require('glog')({
    repodir: process.argv[2] || process.env.HOME + '/data',
    id: 'http://substack.net',
    title: "substack in cyberspace"
});

function blogStream (url, cb) {
    var u = url.split('?')[0];
    
    if (RegExp('^/[^/]+$').test(u)) {
        return glog.get(u, cb).pipe(glog.inline('html'));
    }
    
    var params = qs.parse(url.split('?')[1]);
    var list = glog.list({
        after: params.after,
        limit: params.limit || 5
    });
    return list.pipe(glog.inline('html'))
}

var ecstatic = require('ecstatic');
var staticd = ecstatic({
    root: __dirname + '/static',
    showDir: true,
    autoIndex: true,
    gzip: true
});
var scratch = ecstatic('/scratch');

var server = http.createServer(function (req, res) {
    if ((req.headers.host || '').split('.')[0] === 'scratch') {
        return scratch(req, res);
    }
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
    
    var page = req.url.split('?')[0].split('/')[1];
    
    if (page === 'art' || page === 'mad-science' || page === 'music'
    || page === 'code' || page === 'me' || page === 'hire') {
        var index = trumpet();
        var art = index.select('#content').createWriteStream();
        var file = path.join(
            __dirname, 'static/pages',
            page.replace(/-/g, '_') + '.html'
        );
        
        index.pipe(dropEmpty()).pipe(res);
        fs.createReadStream(file).pipe(art);
        fs.createReadStream(__dirname + '/static/index.html').pipe(index);
        return;
    }
    
    if (RegExp('^/[^/.]*($|\\?)').test(req.url)) {
        res.setHeader('content-type', 'text/html');
        var summary = req.url.split('?')[0] === '/';
        
        var render = renderArticles({ summary: summary });
        var index = trumpet();
        index.pipe(dropEmpty()).pipe(res);
        
        var root = trumpet();
        root.pipe(index.select('#content').createWriteStream());
        
        blogStream(req.url, ontags)
            .pipe(through.obj(function (row, enc, next) {
                if (tstream) tstream.end(row.title);
                this.push(row);
                next();
            }))
            .pipe(render)
            .pipe(root.select('.articles').createWriteStream())
        ;
        function ontags (err, tags) {
            if (tstream && tags && tags.length === 0) {
                tstream.end();
            }
        }
        
        var tstream;
        if (!summary) {
            root.select('.more').setAttribute('class', 'more hide');
            tstream = index.select('title').createWriteStream();
        }
        
        fs.createReadStream(__dirname + '/static/index.html').pipe(index);
        fs.createReadStream(__dirname + '/static/pages/root.html').pipe(root);
        return;
    }
    return staticd(req, res);
});
server.listen(process.env.PORT || Number(process.argv[3]));

function dropEmpty () {
    return through(function (buf, enc, next) {
        if (buf.length > 0) this.push(buf);
        next();
    });
}
