FROM haskell:8.10.2
ARG node_ver="12.x"
RUN apt-get update && \
    apt upgrade -y && \
    apt-get install -y \
    g++ gcc git gnupg libc6-dev libffi-dev libgmp-dev libkrb5-dev \
    libpq-dev libssl-dev make netcat  \
    python3 python3-pip upx xz-utils zlib1g-dev \
    unixodbc-dev freetds-dev \
    default-libmysqlclient-dev libghc-pcre-light-dev libkrb5-dev \
    && curl -sL https://deb.nodesource.com/setup_${node_ver} | bash - \
    && apt-get install -y nodejs && \
    wget libwww-perl build-essential git autoconf python3 libgmp-dev libncurses-dev -y && \
    wget 'https://storage.googleapis.com/pub/gsutil.tar.gz' && \
    tar xfz gsutil.tar.gz -C $HOME && \
    export PATH=${PATH}:$HOME/gsutil
COPY . /graphql
WORKDIR /graphql/console
RUN npx browserslist@latest --update-db && \
    npm ci && npm run server-build
WORKDIR /graphql/server
RUN ln -s cabal.project.dev cabal.project.local \
    && cabal new-update \
    && cabal new-build
CMD cabal new-run -- exe:graphql-engine --database-url="${DBSTRING}" serve --enable-console --console-assets-dir=../console/static/dist
