FROM node:20.11-alpine AS stage

USER root
RUN apk add --upgrade autoconf \
	automake \
	build-base \ 
	git \
	libtool \
	python3 \
	libsodium

WORKDIR /home/node/build/RedsBot
COPY index.ts .
COPY bot ./bot
COPY package.json .
COPY pnpm-lock.yaml .
COPY tsconfig.json .

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile -P
RUN pnpm build


FROM node:lts-alpine as bot
RUN apk add --upgrade python3 \
	ffmpeg \
	libsodium

USER node
WORKDIR /bot
COPY --from=stage --chown=node:node /home/node/build/RedsBot/dist .
COPY --from=stage --chown=node:node /home/node/build/RedsBot/node_modules ./node_modules
COPY --from=stage --chown=node:node /home/node/build/RedsBot/package.json .
CMD ["npm", "run", "start:prod"]