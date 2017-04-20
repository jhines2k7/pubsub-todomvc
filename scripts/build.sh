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

# change the src property of the script tag to app.js
sed -i 's/build-dev\/app.js/app.js/g' build/index.html

docker build -t jhines2017/pubsub-todomvc .

date; echo;
