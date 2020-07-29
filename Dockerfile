FROM node:10-alpine as build
ARG PROJECT=@monorepo
ARG CORE=core
ARG PACKAGE
WORKDIR /usr/src/app

COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .
COPY packages/${CORE} ./packages/${CORE}
COPY packages/${PACKAGE} ./packages/${PACKAGE}

RUN yarn install --pure-lockfile --non-interactive
RUN yarn workspace ${PROJECT}/${CORE} build
RUN yarn workspace ${PROJECT}/${PACKAGE} build

FROM node:10-alpine
ARG PROJECT=@monorepo
ARG CORE=core
ARG PACKAGE
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

COPY --from=build /usr/src/app/packages/${CORE}/package.json /usr/src/app/packages/${CORE}/package.json
COPY --from=build /usr/src/app/packages/${CORE}/dist /usr/src/app/packages/${CORE}/dist

COPY --from=build /usr/src/app/packages/${PACKAGE}/package.json /usr/src/app/packages/${PACKAGE}/package.json
COPY --from=build /usr/src/app/packages/${PACKAGE}/dist /usr/src/app/packages/${PACKAGE}/dist

ENV NODE_ENV production

RUN yarn install --pure-lockfile --non-interactive --production

WORKDIR /usr/src/app/packages/${PACKAGE}
ENTRYPOINT ["yarn"]
CMD ["start:prod"]
