# deno_app_template

Deno でネイティブ GUI アプリを開発するための [Dev Container](https://containers.dev/) テンプレートリポジトリです。
**WebView + React (Vite)** によるフロントエンドと、`deno compile` による単一バイナリ生成までを一括サポートします。

## 含まれるツール

| カテゴリ | ツール / バージョン |
| --- | --- |
| OS | Ubuntu 24.04 |
| ランタイム | Deno (最新版) |
| フロントエンド | React 19 + Vite 6 (Deno 経由) |
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

## 開発フロー

```bash
# 開発時 (Vite dev server + WebView を同時起動、HMR 有効)
deno task dev

# それぞれ別ターミナルで起動したい場合
deno task dev:web   # Vite dev server (http://127.0.0.1:5173)
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

このテンプレートは **依存固定によるサプライチェーン攻撃の緩和**を前提に設定しています。

- root `deno.json` の `"lock": true` で `deno.lock` に完全性ハッシュを記録
- `"vendor": true` で Deno 依存を `vendor/` 配下にダウンロードしリポジトリで管理
- root の `"nodeModulesDir": "none"` でバックエンドには npm の `node_modules` を生成させない
- `web/deno.json` は Vite/React 用に `"nodeModulesDir": "auto"` を許可 (lockfile でハッシュ固定)
- `deno install --frozen` (= `deno task cache`) でロックファイル不一致を検出
- `deno compile` 時は **必要最小限の `--allow-*` フラグのみ**をビルドに埋め込む
- 新規依存追加時は **JSR ([jsr.io](https://jsr.io)) を優先** — postinstall スクリプトなし / 型必須 / provenance 付き

`deno.lock` と `vendor/` は必ずコミットしてください。

### `minimumReleaseAge` 相当の対策

Deno 自体には pnpm の `minimumReleaseAge` (新しすぎる版のインストール拒否) はありません。代替として **Renovate** での遅延更新を推奨します:

```json
// renovate.json
{
  "extends": ["config:recommended"],
  "minimumReleaseAge": "7 days"
}
```

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
├── web/                      # フロントエンド (Vite + React)
│   ├── deno.json             # Vite / React の設定とタスク
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
