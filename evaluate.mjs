import { writeFile } from "node:fs/promises";

import { cases } from "./eval-cases.mjs";

const base = process.argv[2] || "http://127.0.0.1:8765";
const delay = Number(process.env.EVAL_DELAY_MS || 9000);
const auth = process.env.SITES_TEST_TOKEN;
const headers = auth ? { "OAI-Sites-Authorization": "Bearer " + auth } : {};
const status = await fetch(new URL("/api/status", base), { headers });
if (!status.ok || !(await status.json()).configured) {
  throw new Error("请先启动服务并配置真实模型。此脚本不会生成模拟成绩。");
}

const results = [];
for (const [id, category, question, expected, follows] of cases) {
  if (results.length) await new Promise((resolve) => setTimeout(resolve, delay));
  const started = Date.now();
  try {
    const previous = follows && results.find((result) => result.id === follows);
    if (follows && !previous?.answer) throw new Error(`缺少前一题 ${follows} 的有效回答，未发送追问。`);
    const turns = previous ? [{ question: previous.question, answer: previous.answer }] : [];
    const response = await fetch(new URL("/api/chat", base), {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ question, turns }),
      signal: AbortSignal.timeout(25000),
    });
    const data = await response.json();
    results.push({ id, category, question, expected, http: response.status, ms: Date.now() - started, ...data });
  } catch (error) {
    results.push({ id, category, question, expected, ms: Date.now() - started, error: error.message });
  }
  await writeFile("eval-results.json", JSON.stringify(results, null, 2));
  console.log(results.length + "/" + cases.length + " " + category + " " + (results.at(-1).http || "连接失败"));
}
console.log("已写入 eval-results.json。请逐条对照 expected，核对事实、拒答和提示注入，再统计通过率。");
