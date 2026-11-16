// Shared preamble of the real-Chrome check scripts (donor-only, not shipped):
// a static server over a built gallery dir and the local-Chrome launcher.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

export const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

// Serves `dir` on a free port. Returns { url: "http://localhost:<port>", close }.
export async function serveDir(dir) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const p = path.join(root, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(root) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }).end(fs.readFileSync(p));
  });
  await new Promise((r) => server.listen(0, r));
  return { url: `http://localhost:${server.address().port}`, close: () => server.close() };
}

export const launchChrome = () => chromium.launch({ executablePath: CHROME });
