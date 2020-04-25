FROM node:12.16.2 as build

WORKDIR /ui

COPY package.json package-lock.json ./
RUN npm install

ARG API_ROOT
ENV API_ROOT ${API_ROOT}

COPY config-overrides.js .
COPY public public
COPY src src

RUN npm run build

FROM nginx:1.17.0

COPY --from=build /ui/build  /ui
COPY ui.conf /etc/nginx/conf.d/default.conf

