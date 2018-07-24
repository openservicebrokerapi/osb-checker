FROM ubuntu:16.04
MAINTAINER Leon Wang <wanghui71leon@gmail.com>

ARG DEBIAN_FRONTEND=noninteractive

# Download and install some packages.
RUN apt-get update && apt-get install -y --no-install-recommends \
  sudo \
  wget \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get clean
RUN wget --no-check-certificate https://deb.nodesource.com/setup_8.x \
  && chmod +x setup_8.x && ./setup_8.x \
  && apt-get install -y nodejs

# Current directory is always /osb-checker/2.13/tests.
WORKDIR /osb-checker/2.13/tests

# Copy osb-checker tests into container before running command.
COPY ./ ./

RUN sudo npm install

# Define default command.
CMD /usr/bin/npm test
