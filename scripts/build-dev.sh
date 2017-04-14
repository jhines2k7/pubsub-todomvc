#!/usr/bin/env bash
# clean the build directory
if [ -d build-dev ]; then
  rm build-dev/*
fi

if [ ! -d build-dev ]; then
  mkdir build-dev
fi

# js transform
node_modules/.bin/webpack --config=webpack.config-dev.js
# timestamp = date +"%Y%m%d_%H%M%S"
# append # to end of js file for cache busting

date; echo;
