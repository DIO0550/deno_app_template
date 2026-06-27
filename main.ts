// Deno ネイティブ GUI アプリのエントリポイント。
// - 開発時 (DENO_ENV=development): Vite dev サーバ (http://127.0.0.1:5173) に接続
// - 本番 (deno compile): dist-web をバイナリに同梱し、ローカルに静的サーバを立てて配信
import { Webview } from "https://deno.land/x/webview@0.8.1/mod.ts";

const isDev = Deno.env.get("DENO_ENV") === "development";
const url = isDev ? "http://127.0.0.1:5173" : await startStaticServer();

const webview = new Webview();
webview.title = "Deno Native App";
webview.navigate(url);
webview.run();

async function startStaticServer(): Promise<string> {
  const root = new URL("./dist-web/", import.meta.url);
  const mime: Record<string, string> = {
    html: "text/html; charset=utf-8",
    js: "application/javascript",
    mjs: "application/javascript",
    css: "text/css",
    json: "application/json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
  };

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req) => {
      let pathname = new URL(req.url).pathname;
      if (pathname === "/" || pathname.endsWith("/")) pathname += "index.html";
      try {
        const file = await Deno.readFile(new URL("." + pathname, root));
        const ext = pathname.split(".").pop() ?? "";
        return new Response(file, {
          headers: { "content-type": mime[ext] ?? "application/octet-stream" },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    },
  );

  const { port } = server.addr as Deno.NetAddr;
  return `http://127.0.0.1:${port}`;
}
