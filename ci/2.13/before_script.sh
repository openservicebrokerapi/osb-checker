#!/bin/bash

sudo apt-get install -y make
make

cd 2.13/mocks && nohup node mockOSB.js &
