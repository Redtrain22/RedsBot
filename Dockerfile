FROM node:lts-alpine AS stage

USER root
RUN apk add --upgrade autoconf \
	automake \
	build-base \ 
	git \
	libtool \
	python3
WORKDIR /tmp
RUN git clone https://gitea.redtrain.me/Redtrain22/RedsBot.git
WORKDIR /tmp/RedsBot
RUN npm install


FROM node:lts-alpine as runtime
RUN apk add --upgrade python3 \
	ffmpeg
WORKDIR /bot
COPY --from=stage /tmp/RedsBot/ ./
CMD ["npm", "run", "start"]