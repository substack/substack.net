#!/bin/bash
echo -n compiling the bundle... 
browserify -t brfs browser/main.js | uglifyjs | gzip > static/bundle.js.gz
echo done
