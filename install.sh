#!/bin/bash
browserify -t brfs browser/main.js | uglifyjs | gzip > static/bundle.js.gz
