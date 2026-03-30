/** Web server — serves the regex-lab UI and API, zero deps */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { findMatches } from "./matcher";
import { explainRegex } from "./explainer";
import { replaceMatches } from "./replacer";
import { listPatterns, getPattern } from "./common";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function jsonResponse(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export function startServer(port: number = 3464): void {
  const publicDir = path.resolve(__dirname, "..", "public");

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    // CORS for API
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // API routes
    if (url.pathname === "/api/match" && req.method === "POST") {
      try {
        const body = JSON.parse(await readBody(req));
        const { pattern, text, flags = "g" } = body;
        const matches = findMatches(pattern, text, flags);
        jsonResponse(res, { matches });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        jsonResponse(res, { error: msg }, 400);
      }
      return;
    }

    if (url.pathname === "/api/explain" && req.method === "POST") {
      try {
        const body = JSON.parse(await readBody(req));
        const { pattern, lang = "en" } = body;
        const tokens = explainRegex(pattern, lang);
        jsonResponse(res, { tokens });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        jsonResponse(res, { error: msg }, 400);
      }
      return;
    }

    if (url.pathname === "/api/replace" && req.method === "POST") {
      try {
        const body = JSON.parse(await readBody(req));
        const { pattern, replacement, text, flags = "g" } = body;
        const result = replaceMatches(pattern, replacement, text, flags);
        jsonResponse(res, result);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        jsonResponse(res, { error: msg }, 400);
      }
      return;
    }

    if (url.pathname === "/api/common" && req.method === "GET") {
      const name = url.searchParams.get("name");
      if (name) {
        const p = getPattern(name);
        if (p) {
          jsonResponse(res, p);
        } else {
          jsonResponse(res, { error: `Unknown pattern: ${name}` }, 404);
        }
      } else {
        jsonResponse(res, { patterns: listPatterns() });
      }
      return;
    }

    // Static files
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const fullPath = path.join(publicDir, filePath);

    // Security: prevent path traversal
    if (!fullPath.startsWith(publicDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const data = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(port, () => {
    console.log(`\x1b[36mregex-lab\x1b[0m web UI running at \x1b[32mhttp://localhost:${port}\x1b[0m`);
    console.log("Press Ctrl+C to stop.");
  });
}
