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

# copy story.json to build directory
cp story.json build

# change the src property of the script tag to app.js
sed -i 's/build-dev\/app.js/app.js/g' build/index.html

# change the url to 'story.json'
sed -i "s/url: '..\/story.json'/url: 'story.json'/g" build/app.js

docker build -t jhines2017/pubsub .

date; echo;