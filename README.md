# deno_app_template

Deno でネイティブ GUI アプリを開発するための [Dev Container](https://containers.dev/) テンプレートリポジトリです。
**WebView + React (Vite)** によるフロントエンドと、`deno compile` による単一バイナリ生成までを一括サポートします。

## 含まれるツール

| カテゴリ | ツール / バージョン |
| --- | --- |
| OS | Ubuntu 24.04 |
| バックエンド | Deno (最新版) — `main.ts` / `deno compile` |
| フロントエンド | React 19 + Vite 6 (Node.js v24 + pnpm 管理) |
| パッケージマネージャ | pnpm (safe-chain 設定済み — `minimumReleaseAge` 等) |
| GUI ビルド依存 | GTK 3 / WebKit2GTK 4.1 / libayatana-appindicator3 / librsvg2 / libsoup-3 |
| 仮想ディスプレイ | Xvfb (ヘッドレス GUI テスト用) |
| フォーマッタ / Linter | `deno fmt` / `deno lint` (Deno 内蔵) / Prettier + ESLint (web/) |
| バージョン管理 | Git |
| GitHub CLI | gh |
| ターミナル | tmux |

## VS Code 拡張機能

- [Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) — `main.ts` / root のフォーマット (`web/` は対象外に設定済み)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) — `web/` 用
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — `web/` の保存時フォーマット

## 前提条件

- [Docker](https://www.docker.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## 使い方

1. **Use this template** でリポジトリをコピー、またはクローンします。
2. VS Code でプロジェクトを開きます。
3. コマンドパレット (`F1`) → **Dev Containers: Reopen in Container** を選択します。
4. コンテナのビルドが完了すると、開発環境が利用可能になります。

## 開発フロー

```bash
# 初回 / 依存更新時 (コンテナ起動時の自動インストールはしません — 手動で実行)
deno task install:web    # cd web && pnpm install --frozen-lockfile
deno task cache          # deno install --frozen (バックエンド)

# 開発時 (Vite dev server + WebView を同時起動、HMR 有効)
deno task dev

# それぞれ別ターミナルで起動したい場合
deno task dev:web   # Vite dev server (http://127.0.0.1:5173) — 内部で pnpm dev
deno task dev:app   # WebView 本体 (DENO_ENV=development)
```

`main.ts` は `DENO_ENV=development` のときは Vite dev server に接続し、それ以外では `dist-web/` を埋め込み HTTP サーバで配信します。

## ネイティブアプリのビルド

`deno compile` で React フロントエンド (`dist-web/`) ごと同梱した単一バイナリを生成します。

```bash
# 現在の OS 向け (web ビルド → ネイティブバイナリ)
deno task build           # dist/app

# クロスコンパイル
deno task build:linux     # dist/app-linux
deno task build:mac       # dist/app-mac (aarch64)
deno task build:win       # dist/app-win.exe

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

バックエンド (Deno) とフロントエンド (pnpm) で **依存固定によるサプライチェーン攻撃の緩和**を二層で行います。

### バックエンド (Deno)

- root `deno.json` の `"lock": true` で `deno.lock` に完全性ハッシュを記録
- `"vendor": true` で Deno 依存を `vendor/` 配下にダウンロードしリポジトリで管理
- `"nodeModulesDir": "none"` で `main.ts` 側に npm の `node_modules` を生成させない
- `deno install --frozen` (= `deno task cache`) でロックファイル不一致を検出
- `deno compile` 時は **必要最小限の `--allow-*` フラグのみ**をビルドに埋め込む
- 新規依存追加時は **JSR ([jsr.io](https://jsr.io)) を優先** — postinstall スクリプトなし / 型必須 / provenance 付き

`deno.lock` と `vendor/` は必ずコミットしてください。

### フロントエンド (pnpm)

Dockerfile で gist 経由の `pnpm-safe-chain-setup.sh` を実行し、pnpm に以下のような防御を仕込んでいます。

- ライフサイクルスクリプト (postinstall 等) のデフォルト無効 / 許可制
- `minimumReleaseAge` による新版インストール遅延
- `pnpm audit` / overrides の活用

`web/` 側では `pnpm install --frozen-lockfile` (= `deno task install:web`) で `pnpm-lock.yaml` 不一致を検出します。`pnpm-lock.yaml` は必ずコミットしてください。

## プロジェクト構成

```
.
├── .devcontainer/
│   ├── devcontainer.json     # Dev Container 設定
│   ├── docker-compose.yml    # Docker Compose 定義
│   └── deno/
│       └── Dockerfile        # コンテナイメージ定義
├── deno.json                 # バックエンド (main.ts) の Deno 設定 / タスク
├── main.ts                   # WebView ホスト + 静的サーバ
├── web/                      # フロントエンド (Vite + React, pnpm 管理)
│   ├── package.json
│   ├── pnpm-lock.yaml        # 初回 pnpm install で生成 → commit
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── App.css
├── dist-web/                 # Vite ビルド成果物 (deno compile に同梱)
├── dist/                     # ネイティブバイナリ出力 (.gitignored)
└── vendor/                   # vendored Deno 依存 (commit する)
```

## ライセンス

[MIT](LICENSE)
