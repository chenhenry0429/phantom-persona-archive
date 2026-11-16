import { createServer } from "node:http";
import { Readable } from "node:stream";
import "./build.mjs";

const { default: worker } = await import("./dist/server/index.js");

const host = process.env.BIND_HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8765);
const server = createServer(async (incoming, outgoing) => {
  try {
    const { method, headers } = incoming;
    const url = new URL(incoming.url, "http://" + (headers.host || host + ":" + port));
    const request = new Request(url, {
      method,
      headers,
      ...(["GET", "HEAD"].includes(method) ? {} : { body: Readable.toWeb(incoming), duplex: "half" }),
    });
    const response = await worker.fetch(request, process.env);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    outgoing.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    outgoing.end(JSON.stringify({ error: "服务器暂时不可用。" }));
  }
});
server.listen(port, host, () => console.log("Local http://" + host + ":" + port + "/"));
