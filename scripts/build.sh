#!/usr/bin/env bash
# clean the build directory
if [ -d "build" ]; then
  rm build/*
fi

if [ ! -d "build" ]; then
  mkdir build
fi

# js transform
node_modules/.bin/webpack --config=webpack.config.js

# copy index.html to build directory
cp index.html build

# copy css files to build directory
cp node_modules/todomvc-app-css/index.css build
cp node_modules/todomvc-common/base.css build

# change the src property of the script tag to app.js
sed -i 's/build-dev\/app.js/app.js/g' build/index.html

sudo docker build -t jhines2017/pubsub-todomvc .

date; echo;
