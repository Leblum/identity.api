FROM mhart/alpine-node

WORKDIR /usr/app

ENV NODE_ENV development

# If you have native dependencies, you'll need extra tools
# This is used to rebuild bcrypt from source Don't remove it unless you want a segmentation fault on the building
# of the docker image
RUN apk --no-cache add make gcc g++ python

RUN npm i -g pm2

RUN npm i -g gulp

RUN pm2 install pm2-logrotate

# install node modules  Notice how this is before we move app code over
# this will make sure that we cache this portion.
COPY package.json /usr/app/package.json
RUN  cd /usr/app && npm install

# This is required to not have a segmentation fault when running the server
RUN npm rebuild bcrypt --build-from-source

COPY . .

RUN gulp build 

RUN npm test

EXPOSE 8080
CMD ["npm", "start"]