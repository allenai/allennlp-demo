FROM node:12.16.2 as build

WORKDIR /ui

COPY package.json yarn.lock ./
RUN yarn

ARG env
ARG sha

ENV SENTRY_ENVIRONMENT=${env}
ENV SENTRY_RELEASE=${sha}

COPY . .
RUN yarn build

FROM nginx:1.17.0

COPY --from=build /ui/build  /ui
COPY ui.conf /etc/nginx/conf.d/default.conf

