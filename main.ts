// Deno ネイティブ GUI アプリの最小サンプル。
// WebView (システム標準ブラウザエンジン) で HTML/CSS/JS を表示します。
// ライブラリは用途に応じて差し替えてください。
import { Webview } from "https://deno.land/x/webview@0.8.1/mod.ts";

const html = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Deno Native App</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        display: grid;
        place-items: center;
        height: 100vh;
        margin: 0;
        background: #0a0a0a;
        color: #f5f5f5;
      }
      h1 { font-weight: 600; }
    </style>
  </head>
  <body>
    <h1>Hello from Deno 🦕</h1>
  </body>
</html>`;

const webview = new Webview();
webview.title = "Deno Native App";
webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
webview.run();
