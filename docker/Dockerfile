FROM node:11.6.0-alpine
LABEL name="docker-log-piper"

# copy and set entrypoint
COPY docker/bin/entrypoint.sh /usr/bin/entrypoint.sh
ENTRYPOINT [ "/usr/bin/entrypoint.sh" ]
WORKDIR /app
CMD [ "yarn", "run", "start" ]

# install app dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn --production

# copy and setup app
COPY src /app/src