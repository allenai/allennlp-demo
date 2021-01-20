FROM cypress/base

WORKDIR /it

COPY package.json yarn.lock ./
RUN yarn

COPY . .

ENTRYPOINT [ "yarn" ]
CMD [ "test" ]
