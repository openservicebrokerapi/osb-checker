#!/bin/bash

apt-get update && apt-get install -y make
make

cd 2.13/mocks
npm test
nohup node mockOSB.js &
