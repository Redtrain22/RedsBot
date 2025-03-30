ARG DOCKER_IMAGE=docker.io/library/node:22.14-alpine

FROM ${DOCKER_IMAGE} AS builder

USER root
RUN apk upgrade && apk add --no-cache --upgrade autoconf \
	automake \
	build-base \ 
	git \
	libtool \
	python3 \
	libsodium

WORKDIR /home/node/build/RedsBot

COPY package.json .
COPY pnpm-lock.yaml .
COPY tsconfig.json .
COPY index.ts .
COPY bot ./bot

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile -P
RUN pnpm run build


FROM ${DOCKER_IMAGE}
RUN apk upgrade && apk add --no-cache --upgrade ffmpeg \
	libsodium \
	libc6-compat

USER node

WORKDIR /bot

COPY --from=builder --chown=node:node /home/node/build/RedsBot/dist .
COPY --from=builder --chown=node:node /home/node/build/RedsBot/node_modules ./node_modules

CMD ["node", "/bot/index.js"]
