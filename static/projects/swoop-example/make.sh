#!/bin/bash
yarnify knit slides -o yarn.js
browserify entry.js -o bundle.js
