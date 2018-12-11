VERSION_NUMBER := 2.13

.PHONY: all build docker clean

all: build

build: prebuild mockbroker testjob testcommon

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
	cd ./$(VERSION_NUMBER)/mocks && sudo npm install

testjob:
	cd ./$(VERSION_NUMBER)/tests && sudo npm install

testcommon:
	cd ./common && sudo npm install

docker:
	cd ./$(VERSION_NUMBER)/mocks && docker build . -t osb-checker/mock-broker:$(VERSION_NUMBER)
	cd ./$(VERSION_NUMBER)/tests && docker build . -t osb-checker/test-job:$(VERSION_NUMBER)

clean:
	sudo apt-get uninstall -y nodejs \
	  && rm ./setup_8.x
