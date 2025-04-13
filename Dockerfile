FROM docker.io/library/node:lts-alpine

RUN apk upgrade && apk add --no-cache --upgrade pnpm \
	ffmpeg \
	libsodium \
	python3

WORKDIR /bot

COPY package.json .
COPY pnpm-lock.yaml .
COPY tsconfig.json .
COPY index.ts .
COPY bot ./bot

RUN pnpm install --frozen-lockfile -P


CMD ["/usr/bin/pnpm", "run", "start"]
