FROM node:12-alpine

LABEL maintainer="kyane@kyane.fr"

# Get code
COPY . /code
WORKDIR /code

# Install dependencies
RUN yarn install --production

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]

