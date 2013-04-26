(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            return require(file, dirname);
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = { exports : {} };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();
});

require.define("/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/index.js",function(require,module,exports,__dirname,__filename,process){var inside = require('point-in-polygon');
var geohash = (function () {
    var gh = require('geohash');
    return {
        encode : gh.encodeGeoHash.bind(gh),
        decode : gh.decodeGeoHash.bind(gh),
        subs : gh.subGeohashes.bind(gh)
    };
})();

var commondir = require('commondir');
function commonHash (hashes) {
    var paths = hashes.map(function (s) {
        return '/' + s.split('').join('/');
    });
    return commondir(paths).split('/').join('');
}

function containment (hash, polygon) {
    var decoded = geohash.decode(hash);
    var hext = {
        w : decoded.longitude[0],
        s : decoded.latitude[0],
        e : decoded.longitude[1],
        n : decoded.latitude[1],
    };
    var hpoly = [
        [ hext.s, hext.w ],
        [ hext.s, hext.e ],
        [ hext.n, hext.e ],
        [ hext.n, hext.w ],
    ];
    
    var c = hpoly.filter(function (pt) {
        return inside(pt, polygon);
    }).length;
    return { 0 : 'none', 4 : 'complete' }[c] || 'partial';
}

module.exports = function (points, level) {
    var ch = commonHash(points.map(function (p) {
        return geohash.encode(p[0], p[1]);
    }));
    if (level === undefined) level == 22;
    
    var res = (function divide (hash) {
        var c = containment(hash, points);
        if (hash.length >= level) return c === 'none' ? [] : [ hash ];
        if (c === 'complete') return [ hash ];
        
        return geohash.subs(hash).reduce(function (acc, sh) {
            return acc.concat(divide(sh));
        }, []);
    })(ch);
    return res.length ? res : [ ch ];
};
});

require.define("/node_modules/point-in-polygon/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/point-in-polygon/index.js",function(require,module,exports,__dirname,__filename,process){module.exports = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};
});

require.define("/node_modules/geohash/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {}});

require.define("/node_modules/geohash/index.js",function(require,module,exports,__dirname,__filename,process){// geohash.js
// Geohash library for Javascript
// (c) 2008 David Troy
// (c) 2010 Chris Williams
// (c) 2012 Max Ogden
// Distributed under the MIT License

function GeoHash() {
  this.BITS = [16, 8, 4, 2, 1]
  this.MAX_PRECISION = 11
  
  
  this.BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"
  var NEIGHBORS = { right  : { even :  "bc01fg45238967deuvhjyznpkmstqrwx" },
                left   : { even :  "238967debc01fg45kmstqrwxuvhjyznp" },
                top    : { even :  "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
                bottom : { even :  "14365h7k9dcfesgujnmqp0r2twvyx8zb" } }
  var BORDERS   = { right  : { even : "bcfguvyz" },
                left   : { even : "0145hjnp" },
                top    : { even : "prxz" },
                bottom : { even : "028b" } }

  NEIGHBORS.bottom.odd = NEIGHBORS.left.even
  NEIGHBORS.top.odd = NEIGHBORS.right.even
  NEIGHBORS.left.odd = NEIGHBORS.bottom.even
  NEIGHBORS.right.odd = NEIGHBORS.top.even

  BORDERS.bottom.odd = BORDERS.left.even
  BORDERS.top.odd = BORDERS.right.even
  BORDERS.left.odd = BORDERS.bottom.even
  BORDERS.right.odd = BORDERS.top.even
  
  this.NEIGHBORS = NEIGHBORS
  this.BORDERS = BORDERS

  var dimensionTables = this.buildLengthToDimensionTables(this.MAX_PRECISION)
  this.latitudeHeights = dimensionTables.latitudeHeights
  this.longitudeWidths = dimensionTables.longitudeWidths
}

GeoHash.prototype.refineInterval = function (interval, cd, mask) {
  if (cd&mask) interval[0] = (interval[0] + interval[1])/2
  else interval[1] = (interval[0] + interval[1])/2
}

GeoHash.prototype.encodeGeoHash = function (latitude, longitude) {
  var self = this
  var isEven = 1
  var i = 0
  var lat = []
  var lon = []
  var bit = 0
  var ch = 0
  geohash = ""

  lat[0] = -90.0
  lat[1] = 90.0
  lon[0] = -180.0
  lon[1] = 180.0

  while (geohash.length < self.MAX_PRECISION) {
    if (isEven) {
      mid = (lon[0] + lon[1]) / 2
      if (longitude > mid) {
        ch |= self.BITS[bit]
        lon[0] = mid
      } else
        lon[1] = mid
    } else {
      mid = (lat[0] + lat[1]) / 2
      if (latitude > mid) {
        ch |= self.BITS[bit]
        lat[0] = mid
      } else
        lat[1] = mid
    }

    isEven = !isEven
    if (bit < 4)
      bit++
    else {
      geohash += self.BASE32[ch]
      bit = 0
      ch = 0
    }
  }
  return geohash
}

GeoHash.prototype.decodeGeoHash =  function (geohash) {
  var self = this
  var isEven = 1
  var lat = []
  var lon = []
  lat[0] = -90.0
  lat[1] = 90.0
  lon[0] = -180.0
  lon[1] = 180.0
  lat_err = 90.0
  lon_err = 180.0

  for (i = 0; i < geohash.length; i++) {
    c = geohash[i]
    cd = self.BASE32.indexOf(c)
    for (j = 0; j < 5; j++) {
      mask = self.BITS[j]
      if (isEven) {
        lon_err /= 2
        self.refineInterval(lon, cd, mask)
      } else {
        lat_err /= 2
        self.refineInterval(lat, cd, mask)
      }
      isEven = !isEven
    }
  }
  lat[2] = (lat[0] + lat[1])/2
  lon[2] = (lon[0] + lon[1])/2

  return { latitude: lat, longitude: lon}
}

GeoHash.prototype.calculateAdjacent = function (srcHash, dir) {
  var self = this
  srcHash = srcHash.toLowerCase()
  var lastChr = srcHash.charAt(srcHash.length-1)
  var type = (srcHash.length % 2) ? 'odd' : 'even'
  var base = srcHash.substring(0, srcHash.length - 1)
  if (self.BORDERS[dir][type].indexOf(lastChr) != -1)
    base = self.calculateAdjacent(base, dir)
  return base + self.BASE32[self.NEIGHBORS[dir][type].indexOf(lastChr)]
}

GeoHash.prototype.neighbors = function (srcHash) {
  var self = this
  var neighbors = []
  var directions = [['top', 'right'], ['right', 'bottom'], ['bottom', 'left'], ['left', 'top']]
  directions.forEach(function(dir) {
    var point = self.calculateAdjacent(srcHash, dir[0])
    neighbors.push(point)
    neighbors.push(self.calculateAdjacent(point, dir[1]))
  })
  return neighbors
}


GeoHash.prototype.buildLengthToDimensionTables = function(precision) {
  var self = this
  var hashLenToLatHeight = []
  var hashLenToLonWidth = []
  hashLenToLatHeight[0] = 90 * 2
  hashLenToLonWidth[0] = 180 * 2
  var even = false
  for(var i = 1; i <= precision; i++) {
    hashLenToLatHeight[i] = hashLenToLatHeight[i-1] / (even ? 8 : 4)
    hashLenToLonWidth[i] = hashLenToLonWidth[i-1] / (even ? 4 : 8 )
    even = !even
  }
  return {latitudeHeights: hashLenToLatHeight, longitudeWidths: hashLenToLonWidth}
}

GeoHash.prototype.hashLengthForWidthHeight = function(width, height) {
  var self = this
  //loop through hash length arrays from beginning till we find one.
  var length = false
  for(var len = 1; len <= self.MAX_PRECISION; len++) {
    var latHeight = self.latitudeHeights[len]
    var lonWidth = self.longitudeWidths[len]
    if (latHeight < height || lonWidth < width) {
      length = len - 1 //previous length is big enough to encompass specified width & height
      len = self.MAX_PRECISION
    }
  }
  if (length) return length
  return self.MAX_PRECISION
}

GeoHash.prototype.subGeohashes = function (baseGeohash) {
  var self = this
  var hashes = []
  for (var i = 0; i < self.BASE32.length; i++) {
    var c = self.BASE32[i]
    hashes.push(baseGeohash + c)
  }
  return hashes
}

GeoHash.prototype.geohashRange = function (lat, lon, radius) {
  var diff = radius / 111034 // convert from meters to degrees
  diff = diff / 2 // square diameter -> radius
  var upper = this.encodeGeoHash(lat + diff, lon + diff)
  var lower = this.encodeGeoHash(lat - diff, lon - diff)
  return [lower, upper]  
}

module.exports = new GeoHash()});

require.define("/node_modules/commondir/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/commondir/index.js",function(require,module,exports,__dirname,__filename,process){var path = require('path');

module.exports = function (basedir, relfiles) {
    if (relfiles) {
        var files = relfiles.map(function (r) {
            return path.resolve(basedir, r);
        });
    }
    else {
        var files = basedir;
    }
    
    var res = files.slice(1).reduce(function (ps, file) {
        if (!file.match(/^([A-Za-z]:)?\/|\\/)) {
            throw new Error('relative path without a basedir');
        }
        
        var xs = file.split(/\/+|\\+/);
        for (
            var i = 0;
            ps[i] === xs[i] && i < Math.min(ps.length, xs.length);
            i++
        );
        return ps.slice(0, i);
    }, files[0].split(/\/+|\\+/));
    
    // Windows correctly handles paths with forward-slashes
    return res.length > 1 ? res.join('/') : '/'
};
});

require.define("/example/render/browser.js",function(require,module,exports,__dirname,__filename,process){var polyhash = require('../../');
var geohash = (function () {
    var gh = require('geohash');
    return {
        encode : gh.encodeGeoHash.bind(gh),
        decode : gh.decodeGeoHash.bind(gh)
    };
})();

var polygon = [ [ 37.96, -122.45 ], [ 37.95, -122.90 ], [ 38.21, -122.62 ] ];
polyhash(polygon, 5).forEach(plot);

polygon.forEach(function (pt) {
    var xy = toScreen(pt[0], pt[1]);
    var div = document.createElement('div');
    div.className = 'point';
    div.style.left = xy[0] - 3;
    div.style.top = xy[1] - 3;
    document.body.appendChild(div);
});

function plot (hash) {
    var decoded = geohash.decode(hash);
    var ex = {
        w : decoded.longitude[0],
        s : decoded.latitude[0],
        e : decoded.longitude[1],
        n : decoded.latitude[1],
    };
    var nw = toScreen(ex.n, ex.w);
    var se = toScreen(ex.s, ex.e);
    
    var div = document.createElement('div');
    div.className = 'hash';
    div.style.left = nw[0];
    div.style.top = nw[1];
    
    div.style.width = se[0] - nw[0];
    div.style.height = nw[1] - se[1];
    
    document.body.appendChild(div);
}

function toScreen (lat, lon) {
    var min = { lat : 37.5, lon : -123.5 };
    var max = { lat : 39.0, lon : -122.0 };
    var y = (lat - min.lat) / (max.lat - min.lat);
    var x = (lon - min.lon) / (max.lon - min.lon);
    return [ window.innerWidth * x, window.innerHeight * y ];
}
});
require("/example/render/browser.js");
})();
