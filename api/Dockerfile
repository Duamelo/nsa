###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

ENV NODE_ENV=production

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

RUN npm run build

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine AS production

WORKDIR /app

COPY --chown=node:node --from=build /usr/src/app/build ./build
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/wait-for.sh ./wait-for.sh
COPY --chown=node:node --from=build /usr/src/app/init.sh ./init.sh

RUN dos2unix ./wait-for.sh || true
RUN dos2unix ./init.sh || true
RUN chmod +x ./wait-for.sh ./init.sh

USER node

ENTRYPOINT ["/bin/sh", "/app/init.sh"]

EXPOSE 5000
