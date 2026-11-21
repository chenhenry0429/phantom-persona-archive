import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("./", import.meta.url);
const read = (name, encoding = "utf8") => readFile(new URL(name, root), encoding);
const assets = {
  "/": ["text/html; charset=utf-8", await read("index.html")],
  "/style.css": ["text/css; charset=utf-8", await read("style.css")],
  "/app.js": ["text/javascript; charset=utf-8", await read("app.js")],
  "/phantom.webp": ["image/webp", await read("phantom.webp", "base64"), true],
  "/creator-photo.webp": ["image/webp", await read("creator-photo.webp", "base64"), true],
  "/joker.svg": ["image/svg+xml; charset=utf-8", await read("joker.svg")],
};
for (const name of ["headphones", "rice-roll", "guangzhou", "keyboard-cat"]) {
  const path = `/assets/after-class/${name}.webp`;
  assets[path] = ["image/webp", await read(path.slice(1), "base64"), true];
}

if (process.argv.includes("--github-pages")) {
  const output = new URL("dist/github-pages/", root);
  const backend = new URL(process.env.PAGES_CHAT_API || "https://stylpjkkvvqg.sealosbja.site");
  if (backend.protocol !== "https:" || backend.username || backend.password ||
      backend.pathname !== "/" || backend.search || backend.hash) {
    throw new Error("PAGES_CHAT_API must be a public HTTPS origin.");
  }
  const apiMeta = `  <meta name="chat-api-base" content="${backend.origin}">`;
  const html = assets["/"][1].replace("  <title>", `${apiMeta}\n  <title>`);
  await mkdir(output, { recursive: true });
  await writeFile(new URL("index.html", output), html);
  for (const path of Object.keys(assets).filter((path) => path !== "/")) {
    const name = path.slice(1);
    await mkdir(new URL(name.slice(0, name.lastIndexOf("/") + 1), output), { recursive: true });
    await copyFile(new URL(name, root), new URL(name, output));
  }
}

const knowledge = await read("knowledge.md");
const worker = "const assets = " + JSON.stringify(assets) + ";\nconst knowledge = " +
  JSON.stringify(knowledge) + ";\n" + await read("worker.mjs");

await mkdir(new URL("dist/server/", root), { recursive: true });
await writeFile(new URL("dist/server/index.js", root), worker);
try {
  await mkdir(new URL("dist/.openai/", root), { recursive: true });
  await copyFile(new URL(".openai/hosting.json", root), new URL("dist/.openai/hosting.json", root));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
