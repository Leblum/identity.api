# # Dockerfile
# # The FROM directive sets the Base Image for subsequent instructions
# FROM debian:jessie
# # ...
# # Replace shell with bash so we can source files
# RUN rm /bin/sh && ln -s /bin/bash /bin/sh
# # Set environment variables
# ENV appDir /src/server
# # ...
# # Run updates and install deps
# RUN apt-get update

# # Install needed deps and clean up after
# RUN apt-get install -y -q --no-install-recommends \
#     apt-transport-https \
#     build-essential \
#     ca-certificates \
#     curl \
#     g++ \
#     gcc \
#     git \
#     make \
#     nginx \
#     sudo \
#     wget \
#     && rm -rf /var/lib/apt/lists/* \
#     && apt-get -y autoclean

# # Dockerfile
# # ...
# ENV NVM_DIR /usr/local/nvm
# ENV NODE_VERSION 8.2.1

# # Install nvm with node and npm
# RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash \
#     && source $NVM_DIR/nvm.sh \
#     && nvm install $NODE_VERSION \
#     && nvm alias default $NODE_VERSION \
#     && nvm use default

# # Set up our PATH correctly so we don't have to long-reference npm, node, &c.
# ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
# ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
# ENV NODE_ENV development

# # Set the work directory
# RUN mkdir -p /var/www/app/current
# WORKDIR ${appDir}

# # Add our package.json and install *before* adding our application files
# ADD package.json ./
# RUN npm i 

# # Install pm2 *globally* so we can run our application
# RUN npm i -g pm2

# # Install pm2 *globally* so we can run our application
# RUN npm i -g gulp

# # Add application files
# ADD . /var/www/app/current

# RUN npm install

# COPY . .

# EXPOSE 8080

# CMD [ "npm", "start" ]


FROM mhart/alpine-node

WORKDIR /src
ADD . .

ENV NODE_ENV development

# If you have native dependencies, you'll need extra tools
RUN apk add --no-cache make gcc g++ python

RUN npm i -g pm2

RUN npm i -g gulp

# If you need npm, don't use a base tag
RUN npm install

RUN npm rebuild bcrypt --build-from-source

RUN gulp build

RUN npm test

EXPOSE 8080
CMD ["npm", "start"]