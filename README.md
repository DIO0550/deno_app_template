# deno_app_template

Deno でネイティブ GUI アプリを開発するための [Dev Container](https://containers.dev/) テンプレートリポジトリです。
WebView (システム標準ブラウザエンジン) を用いた GUI と、`deno compile` による単一バイナリ生成までを一括サポートします。

## 含まれるツール

| カテゴリ | ツール / バージョン |
| --- | --- |
| OS | Ubuntu 24.04 |
| ランタイム | Deno (最新版) |
| GUI ビルド依存 | GTK 3 / WebKit2GTK 4.1 / libayatana-appindicator3 / librsvg2 / libsoup-3 |
| 仮想ディスプレイ | Xvfb (ヘッドレス GUI テスト用) |
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

1. **Use this template** でリポジトリをコピー、またはクローンします。
2. VS Code でプロジェクトを開きます。
3. コマンドパレット (`F1`) → **Dev Containers: Reopen in Container** を選択します。
4. コンテナのビルドが完了すると、開発環境が利用可能になります。

## ネイティブアプリのビルド

`deno compile` で Deno ランタイムを同梱した単一バイナリを生成します。

```bash
# 開発時 (ファイル変更を監視して再起動)
deno task dev

# 現在の OS 向けにビルド → dist/app
deno task build

# クロスコンパイル
deno task build:linux  # dist/app-linux
deno task build:mac    # dist/app-mac (aarch64)
deno task build:win    # dist/app-win.exe

# 全プラットフォーム一括
deno task build:all
```

ホスト OS で配布バイナリを実行するには、各 OS のシステム依存 (Windows: WebView2 / macOS: WebKit / Linux: WebKit2GTK 4.1) が必要です。

## GUI を Dev Container 内で動作確認する

Dev Container は標準ではディスプレイを持たないため、以下のいずれかで GUI を表示します。

- **ホスト側で実行する** (推奨): `deno task build` で生成したバイナリをホスト OS に持ち出して実行
- **Xvfb で仮想ディスプレイ**: ヘッドレス検証や CI 用
  ```bash
  Xvfb :99 -screen 0 1280x800x24 &
  export DISPLAY=:99
  deno task start
  ```
- **X11 フォワーディング**: `.devcontainer/docker-compose.yml` に `DISPLAY` と `/tmp/.X11-unix` の bind マウントを追加する (ホスト OS 依存)

## サプライチェーン対策

このテンプレートは **依存固定によるサプライチェーン攻撃の緩和**を前提に設定しています。

- `deno.json` の `"lock": true` で `deno.lock` に完全性ハッシュを記録
- `"vendor": true` で依存を `vendor/` 配下にダウンロードしリポジトリで管理
- `"nodeModulesDir": "none"` で npm 由来の `node_modules` を生成させない
- `deno install --frozen` (= `deno task cache`) でロックファイル不一致を検出
- `deno compile` 時は **必要最小限の `--allow-*` フラグのみ**をビルドに埋め込む (本テンプレートは `--allow-ffi --allow-env --allow-read` を指定)
- 新規依存追加時は **JSR ([jsr.io](https://jsr.io)) を優先** — postinstall スクリプトなし / 型必須 / provenance 付き

`deno.lock` と `vendor/` は必ずコミットしてください。

## プロジェクト構成

```
.
├── .devcontainer/
│   ├── devcontainer.json   # Dev Container 設定
│   ├── docker-compose.yml  # Docker Compose 定義
│   └── deno/
│       └── Dockerfile      # コンテナイメージ定義
├── deno.json               # Deno 設定 / タスク定義
├── main.ts                 # WebView を使った GUI エントリポイント
└── vendor/                 # vendored 依存 (初回 deno install 後に生成)
```

## ライセンス

[MIT](LICENSE)
