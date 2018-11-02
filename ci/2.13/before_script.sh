#!/bin/bash

apt-get update && apt-get install -y make
make

cd 2.13/mocks && nohup node mockOSB.js &
