FROM node:current-alpine AS stage

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


FROM node:current-alpine as runtime
WORKDIR /bot
COPY --from=stage /tmp/RedsBot/ ./
ENTRYPOINT ["npm run start"]