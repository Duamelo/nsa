FROM node:18-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install netcat for the wait script
RUN apk add --no-cache bash netcat-openbsd

COPY . .
RUN yarn install

# Add wait script and entrypoint
COPY wait-for.sh /wait-for.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /wait-for.sh /entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]