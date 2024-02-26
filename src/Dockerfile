#FROM golang:1.17-alpine AS gcsfuse
#RUN apk add --no-cache git
#ENV GOPATH /go
#RUN go install github.com/googlecloudplatform/gcsfuse@latest

FROM node:16.14-alpine AS builder

RUN mkdir -p /usr/src/writex
WORKDIR /usr/src/writex

COPY . /usr/src/writex

RUN apk add --no-cache --update bash make gcc g++ python3
RUN yarn plugin import workspace-tools
RUN yarn workspaces focus --all --production
RUN yarn install
RUN yarn build
RUN cp -R node_modules prod_node_modules
RUN rm -rf node_modules && mv prod_node_modules node_modules
RUN rm -rf .yarn/cache

FROM node:16.14-alpine
WORKDIR /usr/src/writex
RUN apk add --no-cache ca-certificates bash mongodb-tools && rm -rf /tmp/*
COPY --from=builder /usr/src/writex .
#COPY --from=gcsfuse /go/bin/gcsfuse /usr/local/bin

EXPOSE 8118

CMD [ "/bin/bash", "/usr/src/writex/startup.sh" ]
