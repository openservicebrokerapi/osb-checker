FROM node:8.12.0
MAINTAINER Leon Wang <wanghui71leon@gmail.com>

ARG DEBIAN_FRONTEND=noninteractive

# Current directory is always /osb-checker/2.13/tests.
WORKDIR /osb-checker/2.13/tests

# Copy osb-checker tests into container before running command.
COPY ./ ./

# Install some required packages.
RUN npm install

# Define default command.
CMD /usr/local/bin/npm test
