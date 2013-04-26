(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

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
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",Function(['require','module','exports','__dirname','__filename','process','global'],"function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = '',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== 'string' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + '/' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === '/';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === '/',\n    trailingSlash = path.slice(-1) === '/';\n\n// Normalize the path\npath = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n  \n  return (isAbsolute ? '/' : '') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === 'string';\n  }).join('/'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || '';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return '.';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || '';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || '';\n};\n\nexports.relative = function(from, to) {\n  from = exports.resolve(from).substr(1);\n  to = exports.resolve(to).substr(1);\n\n  function trim(arr) {\n    var start = 0;\n    for (; start < arr.length; start++) {\n      if (arr[start] !== '') break;\n    }\n\n    var end = arr.length - 1;\n    for (; end >= 0; end--) {\n      if (arr[end] !== '') break;\n    }\n\n    if (start > end) return [];\n    return arr.slice(start, end - start + 1);\n  }\n\n  var fromParts = trim(from.split('/'));\n  var toParts = trim(to.split('/'));\n\n  var length = Math.min(fromParts.length, toParts.length);\n  var samePartsLength = length;\n  for (var i = 0; i < length; i++) {\n    if (fromParts[i] !== toParts[i]) {\n      samePartsLength = i;\n      break;\n    }\n  }\n\n  var outputParts = [];\n  for (var i = samePartsLength; i < fromParts.length; i++) {\n    outputParts.push('..');\n  }\n\n  outputParts = outputParts.concat(toParts.slice(samePartsLength));\n\n  return outputParts.join('/');\n};\n\n//@ sourceURL=path"
));

require.define("__browserify_process",Function(['require','module','exports','__dirname','__filename','process','global'],"var process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var canSetImmediate = typeof window !== 'undefined'\n        && window.setImmediate;\n    var canPost = typeof window !== 'undefined'\n        && window.postMessage && window.addEventListener\n    ;\n\n    if (canSetImmediate) {\n        return function (f) { return window.setImmediate(f) };\n    }\n\n    if (canPost) {\n        var queue = [];\n        window.addEventListener('message', function (ev) {\n            if (ev.source === window && ev.data === 'browserify-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n\n        return function nextTick(fn) {\n            queue.push(fn);\n            window.postMessage('browserify-tick', '*');\n        };\n    }\n\n    return function nextTick(fn) {\n        setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nprocess.binding = function (name) {\n    if (name === 'evals') return (require)('vm')\n    else throw new Error('No such module. (Possibly not yet loaded)')\n};\n\n(function () {\n    var cwd = '/';\n    var path;\n    process.cwd = function () { return cwd };\n    process.chdir = function (dir) {\n        if (!path) path = require('path');\n        cwd = path.resolve(dir, cwd);\n    };\n})();\n\n//@ sourceURL=__browserify_process"
));

require.define("/package.json",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = {\"main\":\"index.js\"}\n//@ sourceURL=/package.json"
));

require.define("/index.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var hyperglue = require('hyperglue');\nvar EventEmitter = require('events').EventEmitter;\nvar html = require('./static/html');\nvar css = require('./static/css');\n\nmodule.exports = Slider;\nvar insertedCss = false;\n\nfunction Slider (opts) {\n    if (!(this instanceof Slider)) return new Slider(opts);\n    EventEmitter.call(this);\n    var self = this;\n    \n    if (!opts) opts = {};\n    this.max = opts.max === undefined ? 1 : opts.max;\n    this.min = opts.min === undefined ? 0 : opts.min;\n    this.snap = opts.snap;\n    \n    process.nextTick(function () {\n        if (opts.init !== undefined) {\n            self.set(opts.init);\n        }\n        else if (opts.min !== undefined) {\n            self.set(opts.min);\n        }\n        else self.set(0);\n    });\n    \n    if (!insertedCss && opts.insertCss !== false) {\n        var style = document.createElement('style');\n        style.appendChild(document.createTextNode(css));\n        if (document.head.childNodes.length) {\n            document.head.insertBefore(style, document.head.childNodes[0]);\n        }\n        else {\n            document.head.appendChild(style);\n        }\n        insertedCss = true;\n    }\n    var root = this.element = hyperglue(html);\n    \n    var turtle = this.turtle = root.querySelector('.turtle');\n    var runner = root.querySelector('.runner');\n    \n    var down = false;\n    \n    turtle.addEventListener('mousedown', function (ev) {\n        ev.preventDefault();\n        turtle.className = 'turtle pressed';\n        down = {\n            x: ev.clientX - root.offsetLeft - turtle.offsetLeft\n        }\n    });\n    root.addEventListener('mousedown', function (ev) {\n        ev.preventDefault();\n    });\n    window.addEventListener('mouseup', mouseup);\n    window.addEventListener('mousemove', onmove);\n    \n    function onmove (ev) {\n        ev.preventDefault();\n        if (!down) return;\n        var w = self._elementWidth();\n        var x = Math.max(0, Math.min(w, ev.clientX - root.offsetLeft - down.x));\n        var value = x / w;\n        if (isNaN(value)) return;\n        self.set(self.interpolate(value));\n    }\n    \n    function mouseup () {\n        down = true;\n        turtle.className = 'turtle';\n    }\n}\n\nSlider.prototype = new EventEmitter;\n\nSlider.prototype.appendTo = function (target) {\n    if (typeof target === 'string') {\n        target = document.querySelector(target);\n    }\n    target.appendChild(this.element);\n};\n\nSlider.prototype.interpolate = function (value) {\n    var v = value * (this.max - this.min) + this.min;\n    var res = this.snap\n        ? Math.round(v / this.snap) * this.snap\n        : v\n    ;\n    return Math.max(this.min, Math.min(this.max, res));\n};\n\nSlider.prototype.set = function (value) {\n    value = Math.max(this.min, Math.min(this.max, value));\n    var x = (value - this.min) / (this.max - this.min);\n    this.turtle.style.left = x * this._elementWidth();\n    value = Math.round(value * 1e10) / 1e10;\n    this.emit('value', value);\n};\n\nSlider.prototype._elementWidth = function () {\n    var style = {\n        root: window.getComputedStyle(this.element),\n        turtle: window.getComputedStyle(this.turtle)\n    };\n    return num(style.root.width) - num(style.turtle.width)\n        - num(style.turtle['border-width'])\n    ;\n};\n\nfunction num (s) {\n    return Number((/^(\\d+)/.exec(s) || [0,0])[1]);\n}\n\n//@ sourceURL=/index.js"
));

require.define("/node_modules/hyperglue/package.json",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = {\"main\":\"index.js\"}\n//@ sourceURL=/node_modules/hyperglue/package.json"
));

require.define("/node_modules/hyperglue/index.js",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = function (src, updates) {\n    if (!updates) updates = {};\n    \n    var div = src;\n    if (typeof div !== 'object') {\n        div = document.createElement('div');\n        div.innerHTML = src.trim();\n        if (div.childNodes.length === 1) {\n            div = div.childNodes[0];\n        }\n    }\n    \n    forEach(objectKeys(updates), function (selector) {\n        var value = updates[selector];\n        var nodes = div.querySelectorAll(selector);\n        for (var i = 0; i < nodes.length; i++) {\n            if (isElement(value)) {\n                nodes[i].innerHTML = '';\n                nodes[i].appendChild(value);\n            }\n            else if (value && typeof value === 'object') {\n                forEach(objectKeys(value), function (key) {\n                    if (key === '_text') {\n                        setText(nodes[i], value[key]);\n                    }\n                    else if (key === '_html' && isElement(value[key])) {\n                        nodes[i].innerHTML = '';\n                        nodes[i].appendChild(value[key]);\n                    }\n                    else if (key === '_html') {\n                        nodes[i].innerHTML = value[key];\n                    }\n                    else nodes[i].setAttribute(key, value[key]);\n                });\n            }\n            else setText(nodes[i], value);\n        }\n    });\n    \n    return div;\n};\n\nfunction forEach(xs, f) {\n    if (xs.forEach) return xs.forEach(f);\n    for (var i = 0; i < xs.length; i++) f(xs[i], i)\n}\n\nvar objectKeys = Object.keys || function (obj) {\n    var res = [];\n    for (var key in obj) res.push(key);\n    return res;\n};\n\nfunction isElement (e) {\n    return e && typeof e === 'object' && e.childNodes\n        && typeof e.appendChild === 'function'\n    ;\n}\n\nfunction setText (e, s) {\n    e.innerHTML = '';\n    var txt = document.createTextNode(s);\n    e.appendChild(txt);\n}\n\n//@ sourceURL=/node_modules/hyperglue/index.js"
));

require.define("events",Function(['require','module','exports','__dirname','__filename','process','global'],"if (!process.EventEmitter) process.EventEmitter = function () {};\n\nvar EventEmitter = exports.EventEmitter = process.EventEmitter;\nvar isArray = typeof Array.isArray === 'function'\n    ? Array.isArray\n    : function (xs) {\n        return Object.prototype.toString.call(xs) === '[object Array]'\n    }\n;\nfunction indexOf (xs, x) {\n    if (xs.indexOf) return xs.indexOf(x);\n    for (var i = 0; i < xs.length; i++) {\n        if (x === xs[i]) return i;\n    }\n    return -1;\n}\n\n// By default EventEmitters will print a warning if more than\n// 10 listeners are added to it. This is a useful default which\n// helps finding memory leaks.\n//\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nvar defaultMaxListeners = 10;\nEventEmitter.prototype.setMaxListeners = function(n) {\n  if (!this._events) this._events = {};\n  this._events.maxListeners = n;\n};\n\n\nEventEmitter.prototype.emit = function(type) {\n  // If there is no 'error' event listener then throw.\n  if (type === 'error') {\n    if (!this._events || !this._events.error ||\n        (isArray(this._events.error) && !this._events.error.length))\n    {\n      if (arguments[1] instanceof Error) {\n        throw arguments[1]; // Unhandled 'error' event\n      } else {\n        throw new Error(\"Uncaught, unspecified 'error' event.\");\n      }\n      return false;\n    }\n  }\n\n  if (!this._events) return false;\n  var handler = this._events[type];\n  if (!handler) return false;\n\n  if (typeof handler == 'function') {\n    switch (arguments.length) {\n      // fast cases\n      case 1:\n        handler.call(this);\n        break;\n      case 2:\n        handler.call(this, arguments[1]);\n        break;\n      case 3:\n        handler.call(this, arguments[1], arguments[2]);\n        break;\n      // slower\n      default:\n        var args = Array.prototype.slice.call(arguments, 1);\n        handler.apply(this, args);\n    }\n    return true;\n\n  } else if (isArray(handler)) {\n    var args = Array.prototype.slice.call(arguments, 1);\n\n    var listeners = handler.slice();\n    for (var i = 0, l = listeners.length; i < l; i++) {\n      listeners[i].apply(this, args);\n    }\n    return true;\n\n  } else {\n    return false;\n  }\n};\n\n// EventEmitter is defined in src/node_events.cc\n// EventEmitter.prototype.emit() is also defined there.\nEventEmitter.prototype.addListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('addListener only takes instances of Function');\n  }\n\n  if (!this._events) this._events = {};\n\n  // To avoid recursion in the case that type == \"newListeners\"! Before\n  // adding it to the listeners, first emit \"newListeners\".\n  this.emit('newListener', type, listener);\n\n  if (!this._events[type]) {\n    // Optimize the case of one listener. Don't need the extra array object.\n    this._events[type] = listener;\n  } else if (isArray(this._events[type])) {\n\n    // Check for listener leak\n    if (!this._events[type].warned) {\n      var m;\n      if (this._events.maxListeners !== undefined) {\n        m = this._events.maxListeners;\n      } else {\n        m = defaultMaxListeners;\n      }\n\n      if (m && m > 0 && this._events[type].length > m) {\n        this._events[type].warned = true;\n        console.error('(node) warning: possible EventEmitter memory ' +\n                      'leak detected. %d listeners added. ' +\n                      'Use emitter.setMaxListeners() to increase limit.',\n                      this._events[type].length);\n        console.trace();\n      }\n    }\n\n    // If we've already got an array, just append.\n    this._events[type].push(listener);\n  } else {\n    // Adding the second element, need to change to array.\n    this._events[type] = [this._events[type], listener];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.once = function(type, listener) {\n  var self = this;\n  self.on(type, function g() {\n    self.removeListener(type, g);\n    listener.apply(this, arguments);\n  });\n\n  return this;\n};\n\nEventEmitter.prototype.removeListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('removeListener only takes instances of Function');\n  }\n\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (!this._events || !this._events[type]) return this;\n\n  var list = this._events[type];\n\n  if (isArray(list)) {\n    var i = indexOf(list, listener);\n    if (i < 0) return this;\n    list.splice(i, 1);\n    if (list.length == 0)\n      delete this._events[type];\n  } else if (this._events[type] === listener) {\n    delete this._events[type];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.removeAllListeners = function(type) {\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (type && this._events && this._events[type]) this._events[type] = null;\n  return this;\n};\n\nEventEmitter.prototype.listeners = function(type) {\n  if (!this._events) this._events = {};\n  if (!this._events[type]) this._events[type] = [];\n  if (!isArray(this._events[type])) {\n    this._events[type] = [this._events[type]];\n  }\n  return this._events[type];\n};\n\n//@ sourceURL=events"
));

require.define("/static/html.js",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = [\n  '<div class=\"slideways\">',\n    '<div class=\"runner\"></div>',\n    '<div class=\"turtle\"></div>',\n  '</div>'\n].join('\\n')\n\n//@ sourceURL=/static/html.js"
));

require.define("/static/css.js",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = [\n  '.slideways {',\n    'position: relative;',\n    'left: 0px;',\n    'top: 0px;',\n    'display: inline-block;',\n    'height: 24px;',\n    'width: 150px;',\n  '}',\n  '.slideways .turtle {',\n    'position: absolute;',\n    'top: 0px;',\n    'left: 0px;',\n    'bottom: 0px;',\n    'width: 8px;',\n    'margin-top: 0px;',\n    'margin-bottom: 0px;',\n    'background-color: white;',\n    'border: 2px solid rgb(52,52,52);',\n    'border-radius: 4px;',\n  '}',\n  '.slideways .turtle.pressed {',\n    'background-color: rgb(223,223,223);',\n  '}',\n  '.slideways .runner {',\n    'position: absolute;',\n    'top: 8px;',\n    'left: 4px;',\n    'right: 4px;',\n    'height: 5px;',\n    'background-color: rgb(96,96,96);',\n    'border: 2px solid rgb(52,52,52);',\n    'border-radius: 3px;',\n  '}'\n].join('\\n')\n\n//@ sourceURL=/static/css.js"
));

require.define("/example/main.js",Function(['require','module','exports','__dirname','__filename','process','global'],"var slideways = require('../');\nvar slider = slideways({ min: 2, max: 10, snap: 0.1, init: 5 });\nslider.appendTo('#slider');\n\nvar result = document.querySelector('#result');\nslider.on('value', function (value) {\n    result.value = value;\n});\n\n//@ sourceURL=/example/main.js"
));
require("/example/main.js");
})();
