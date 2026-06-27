FROM ubuntu:24.04

# Deno バージョン (空の場合は最新版をインストール)
ARG DENO_VERSION=
ARG USERNAME=vscode

ENV DENO_VERSION=${DENO_VERSION}
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8

# Deno のインストール先
ENV DENO_INSTALL=/usr/local
ENV PATH=${DENO_INSTALL}/bin:${PATH}

# 基本パッケージ + WebView (GTK/WebKit) ネイティブ GUI のビルド依存
RUN apt-get update \
    && apt-get install -y \
        curl \
        ca-certificates \
        gnupg \
        git \
        jq \
        tmux \
        unzip \
        build-essential \
        pkg-config \
        libgtk-3-dev \
        libwebkit2gtk-4.1-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        libsoup-3.0-dev \
        xvfb \
    && useradd -m -s /bin/bash $USERNAME \
    && rm -rf /var/lib/apt/lists/*

# Deno を全ユーザーが使えるよう /usr/local 配下にインストール
RUN if [ -n "${DENO_VERSION}" ]; then \
        curl -fsSL https://deno.land/install.sh | sh -s -- --yes "v${DENO_VERSION}"; \
    else \
        curl -fsSL https://deno.land/install.sh | sh -s -- --yes; \
    fi \
    && chmod -R a+rx ${DENO_INSTALL}/bin

RUN curl -fsSL https://gist.githubusercontent.com/DIO0550/1830ced050035c34668aa426f7258346/raw/install-gh.sh | bash

USER $USERNAME

# Deno のキャッシュディレクトリ
ENV DENO_DIR=/home/${USERNAME}/.cache/deno

SHELL ["/bin/bash", "-l", "-c"]
RUN curl -fsSL https://gist.githubusercontent.com/DIO0550/148b1392cf435ba3562da0d398bee442/raw/install-ai-tools.sh | bash
RUN curl -fsSL https://gist.githubusercontent.com/DIO0550/356434ec2b182f71d99dc0c467555ba5/raw/tmux-setup.sh | bash


WORKDIR /workspace
