.PHONY: all build docker clean

all: build

build: prebuild mockbroker testjob

prebuild:
	sudo apt-get update && sudo apt-get install -y --no-install-recommends \
	  wget \
	  g++ \
	  && sudo rm -rf /var/lib/apt/lists/* \
	  && sudo apt-get clean
	wget --no-check-certificate https://deb.nodesource.com/setup_8.x \
	  && chmod +x setup_8.x && ./setup_8.x \
	  && sudo apt-get install -y nodejs

mockbroker:
	cd ./2.13/mocks && sudo npm install

testjob:
	cd ./2.13/tests && sudo npm install

docker:
	cd ./2.13/mocks && docker build . -t osb-checker/mock-broker:2.13
	cd ./2.13/tests && docker build . -t osb-checker/test-job:2.13

clean:
	sudo apt-get uninstall -y nodejs \
	  && rm ./setup_8.x
