FROM node:6-onbuild

MAINTAINER Rademade

ENV USER prerender
ENV INSTALL_PATH /$USER

RUN apt-get update \
    && apt-get install -qq -y build-essential g++ flex bison gperf ruby perl libsqlite3-dev libfontconfig1-dev libicu-dev libfreetype6 libssl-dev libpng-dev libjpeg-dev python libx11-dev libxext-dev --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p $INSTALL_PATH \
    && groupadd -r $USER \
    && useradd -r -g $USER -d $INSTALL_PATH $USER \
    && chown $USER:$USER $INSTALL_PATH

USER $USER
WORKDIR $INSTALL_PATH

COPY . .
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
