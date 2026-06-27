# deno_app_template

Deno 開発用の [Dev Container](https://containers.dev/) テンプレートリポジトリです。
VS Code の Dev Containers 拡張機能を使って、すぐに開発を始められる環境を提供します。

## 含まれるツール

| カテゴリ | ツール / バージョン |
| --- | --- |
| OS | Ubuntu 24.04 |
| ランタイム | Deno (最新版) |
| フォーマッタ / Linter | `deno fmt` / `deno lint` (Deno 内蔵) |
| バージョン管理 | Git |
| GitHub CLI | gh |
| ターミナル | tmux |

## VS Code 拡張機能

- [Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) — 保存時に `deno fmt` で自動フォーマット

## 前提条件

- [Docker](https://www.docker.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## 使い方

1. このリポジトリを **Use this template** でコピー、またはクローンします。
2. VS Code でプロジェクトを開きます。
3. コマンドパレット (`F1`) → **Dev Containers: Reopen in Container** を選択します。
4. コンテナのビルドが完了すると、開発環境が利用可能になります。

ポート **8000** がホストへ自動転送されます。

## Deno バージョンの指定

`.devcontainer/deno/Dockerfile` の `ARG DENO_VERSION=` でバージョンを固定できます。空のままにすると最新版がインストールされます。

```dockerfile
ARG DENO_VERSION=2.1.4
```

## プロジェクト構成

```
.devcontainer/
├── devcontainer.json   # Dev Container 設定
├── docker-compose.yml  # Docker Compose 定義
└── deno/
    └── Dockerfile      # コンテナイメージ定義
```

## ライセンス

[MIT](LICENSE)
