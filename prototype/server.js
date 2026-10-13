// Minimal URL shortener prototype: zero dependencies, mappings kept in memory.
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";

const PORT = process.env.PORT || 3000;
const urls = new Map(); // code -> original URL

const page = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

function newCode() {
  let code;
  do code = crypto.randomBytes(4).toString("base64url").slice(0, 6);
  while (urls.has(code));
  return code;
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") return send(res, 200, page, "text/html");

  if (req.method === "POST" && req.url === "/shorten") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let url;
      try {
        url = new URL(JSON.parse(body).url);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return send(res, 400, { error: "Invalid URL" });
      }
      const code = newCode();
      urls.set(code, url.href);
      send(res, 201, { code, short: `http://${req.headers.host}/${code}` });
    });
    return;
  }

  if (req.method === "GET") {
    const target = urls.get(req.url.slice(1));
    if (target) {
      res.writeHead(302, { Location: target });
      return res.end();
    }
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => console.log(`Prototype running at http://localhost:${PORT}`));
