FROM node:20.10-alpine AS stage

USER root
RUN apk add --upgrade autoconf \
	automake \
	build-base \ 
	git \
	libtool \
	python3 \
	libsodium
WORKDIR /home/node/build/RedsBot
COPY --chown=node:node index.ts ./index.ts
COPY --chown=node:node bot ./bot
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=node:node tsconfig.json ./tsconfig.json
RUN npm install -g pnpm 
RUN pnpm install --frozen-lockfile
RUN pnpm build


FROM node:lts-alpine as bot
RUN apk add --upgrade python3 \
	ffmpeg \
	libsodium
USER node
WORKDIR /bot
COPY --from=stage /home/node/build/RedsBot/dist/* ./
COPY --from=stage /home/node/build/RedsBot/node_modules ./node_modules
COPY --from=stage /home/node/build/RedsBot/package.json ./package.json
CMD ["npm", "run", "start:prod"]