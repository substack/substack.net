var http = require('http');
var hyperstream = require('hyperstream');
var qs = require('querystring');
var fs = require('fs');
var path = require('path');

var glog = require('glog')(process.argv[3]);
var ecstatic = require('ecstatic')(__dirname + '/static');

var server = http.createServer(function (req, res) {
    if (glog.test(req.url)) return glog(req, res);
    
    if (!/^\/[^\.\/]*$/.test(req.url)) {
        return ecstatic(req, res);
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
server.listen(Number(process.argv[2]));
