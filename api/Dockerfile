###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine AS build

RUN addgroup -S service-web && adduser -S service-web -G service-web

WORKDIR /usr/src/app

COPY --chown=service-web:service-web package*.json ./

ENV NODE_ENV=production

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=service-web:service-web . .

RUN npm run build

USER service-web


###################
# PRODUCTION
###################

FROM node:20-alpine AS production

RUN addgroup -S service-web && adduser -S service-web -G service-web

WORKDIR /app

RUN mkdir -p ./logs && chown service-web:service-web ./logs

COPY --chown=service-web:service-web --from=build /usr/src/app/build ./build
COPY --chown=service-web:service-web --from=build /usr/src/app/node_modules ./node_modules

COPY --chown=service-web:service-web --from=build /usr/src/app/package.json ./package.json
COPY --chown=service-web:service-web --from=build /usr/src/app/wait-for.sh ./wait-for.sh
COPY --chown=service-web:service-web --from=build /usr/src/app/init.sh ./init.sh

RUN dos2unix ./wait-for.sh || true
RUN dos2unix ./init.sh || true
RUN chmod +x ./wait-for.sh ./init.sh

USER service-web

ENTRYPOINT ["/bin/sh", "/app/init.sh"]

EXPOSE 5000
