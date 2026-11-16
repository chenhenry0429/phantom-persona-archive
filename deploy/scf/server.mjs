import { createServer } from "node:http";
import { Readable } from "node:stream";
import worker from "./worker.mjs";

const port = Number(process.env.PORT || 9000);
const host = process.env.BIND_HOST || "0.0.0.0";
const publicOrigin = process.env.SCF_PUBLIC_ORIGIN ? new URL(process.env.SCF_PUBLIC_ORIGIN).origin : null;

createServer(async (incoming, outgoing) => {
  try {
    const headers = new Headers(incoming.headers);
    // The Worker header is assigned by Cloudflare only on its own deployment.
    // Here the existing limiter uses its shared per-instance bucket.
    headers.delete("cf-connecting-ip");
    const origin = publicOrigin || `https://${incoming.headers.host || "localhost"}`;
    const body = ["GET", "HEAD"].includes(incoming.method) ? undefined : Readable.toWeb(incoming);
    const request = new Request(new URL(incoming.url, origin), {
      method: incoming.method,
      headers,
      ...(body ? { body, duplex: "half" } : {}),
    });
    const response = await worker.fetch(request, process.env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    if (outgoing.headersSent) {
      outgoing.destroy();
      return;
    }
    const origin = incoming.headers.origin;
    outgoing.writeHead(500, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      Vary: "Origin",
      ...(origin === "https://chenhenry0429.github.io" ? { "Access-Control-Allow-Origin": origin } : {}),
    });
    outgoing.end(JSON.stringify({ error: "问答服务暂时不可用。" }));
  }
}).listen(port, host, () => console.log(`Phantom API listening on ${host}:${port}`));
