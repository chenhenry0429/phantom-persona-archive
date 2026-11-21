const form = document.querySelector("#chat-form");
const input = document.querySelector("#question");
const send = document.querySelector("#send");
const reset = document.querySelector("#reset");
const status = document.querySelector("#status");
const chatHelp = document.querySelector("#chat-help");
const chatError = document.querySelector("#chat-error");
const chatRetry = document.querySelector("#chat-retry");
const chatCopy = document.querySelector("#chat-copy");
const chatDiagnostics = document.querySelector("#chat-diagnostics");
const log = document.querySelector("#messages");
const portrait = document.querySelector("#portrait");
const mascot = document.querySelector("#mascot-button");
const mascotArea = document.querySelector("#mascot");
const mascotBubble = document.querySelector("#mascot-bubble");
const mascotClose = document.querySelector("#mascot-close");
const mascotJoke = document.querySelector("#mascot-joke");
const mascotQuiet = document.querySelector("#mascot-quiet");
const chatApi = document.querySelector('meta[name="chat-api-base"]')?.content || "";
const welcome = log.firstElementChild.cloneNode(true);
const greetings = ["要聊聊吗？", "下一条线索，由你来问。", "来问问 Henry 的作品吧！"];
const jokes = [
  "已知砹是第 85 号元素，那么第 86 号元素是什么？\n西元。因为砹在西元前。",
  "为什么不拿微波炉加热微波炉？",
  "图书馆最公平的地方，是你学没学懂，闭馆铃都响得一样响。",
  "选课系统问我是否确定。我当然不确定，但确定的人已经选完了。",
  "课件上写着「一看便知」。我照做了，现在知道我没看懂。",
  "小组作业里最团结的一刻，是大家同时说「我都行」。",
  "老师说证明留作练习。这道题很懂礼貌，把证明又留给了老师。",
  "这学期选修怎么选？\n先选哪天能休。",
  "早八签到只查人到没到。很合理，灵魂通常要到第二节课。",
  "我排在食堂队伍的最后。只要没人排在我后面，我就永远是压轴。",
  "吃饭是我最擅长的多线程任务。\n嚼着这一口，已经开始安排下一口。",
  "菜单上写「任选两样」。我选了现在吃和待会儿再吃。",
  "食堂开了个轻食窗口。我掂了掂餐盒，店名起得很诚实。",
  "我想早点睡，就把闹钟定早了。问题被成功转交给明天的我。",
  "闹钟响了。我在等第二份独立证据。",
  "周末想补觉。醒来一看，周末也被补进去了。",
  "睡前背了遍单词，做梦时一个也没见到。它们大概背着我走了。",
  "拖延最讲究向后兼容。昨天没做的事，今天还能打开。",
  "我给待办事项加了优先级。现在我知道应该先拖延哪一个。",
  "我花了一下午优化学习计划。它现在快得惊人，一分钟就能看完。",
  "代码只在我电脑上运行。它对办公地点有明确要求。",
  "老师说这题要会解。我只会解压，压缩包已经打开了。",
  "代码没写注释。我很信任三天前的自己。三天前的自己显然也很信任我。",
  "文件名叫「最终版 2」，给最终版留一点成长空间。",
  "函数最有边界感。该返回的时候，它真会走。",
  "为什么抽屉里放饼干？\n正餐还没到，先读一点缓存。",
  "网页问我是否接受 Cookie。\n我接受。它没给。",
  "进度条卡在 99%。剩下的 1% 正在争取独立。",
  "游戏让我找失踪的人。地图直接标了坐标，看来只有我没收到通知。",
  "打最终 Boss 前舍不得喝药。通关后背包很健康。",
  "游戏说按任意键继续。我按了关机键，范围确实说得太宽了。",
  "我在开放世界里迷路。地图不同意，说这叫探索。",
  "Boss 有三条血，我有三次耐心。数值设计得很对称。",
  "怪盗最擅长偷什么？\n偷时间。一个「再来一局」，半小时就不见了。",
  "怪盗偷走了桌上的作业。老师问，提交记录也一起偷走了吗？",
  "怪盗的预告函写「今晚取走宝物」。物业回信问他来访需不需要登记。",
  "我把伞带出门了。天气一整天都没机会证明我准备充分。",
  "桌面收拾干净了。现在找东西，终于可以从零开始。",
  "镜子说我今天状态不错。证据不足，它只看了一面。",
  "电梯说最近有起有落。门一开，它就不聊了。",
];
// Bump the key if the joke list is reordered or its entries change.
const jokeStorageKey = "phantom-profile:mascot-jokes:v1";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let greeting = 0;
let mascotAction;
let turns = [];
let request;
let composing = false;
let automaticJokes = 0;
let mascotVisible = false;
let idleTimer;
let bubbleTimer;
const jokeState = readJokeState();
mascotQuiet.checked = jokeState.quiet;

function readJokeState() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(jokeStorageKey));
  } catch {
    // The current page can still keep its own deck when storage is unavailable.
  }
  const validIndex = (index) => Number.isInteger(index) && index >= 0 && index < jokes.length;
  const quiet = saved?.quiet === true;
  const last = validIndex(saved?.last) ? saved.last : null;
  const remaining = saved?.remaining;
  if (last !== null && Array.isArray(remaining) && remaining.length < jokes.length &&
      remaining.every((index) => validIndex(index) && index !== last) &&
      new Set(remaining).size === remaining.length) {
    return { remaining, last, quiet };
  }
  return { remaining: [], last, quiet };
}

function saveJokeState() {
  try {
    localStorage.setItem(jokeStorageKey, JSON.stringify(jokeState));
  } catch {
    // The in-memory state remains active.
  }
}

function dismissMascotBubble() {
  clearTimeout(bubbleTimer);
  if (document.activeElement === mascotClose) mascotJoke.focus({ preventScroll: true });
  mascotClose.hidden = true;
  mascotBubble.textContent = "";
  delete mascotBubble.dataset.kind;
}

function showMascotBubble(message, kind = "greeting") {
  clearTimeout(bubbleTimer);
  mascotBubble.dataset.kind = kind;
  mascotBubble.textContent = message;
  mascotClose.hidden = false;
  const duration = kind === "greeting" ? 9000 : Math.min(24000, Math.max(10000, 4800 + message.length * 250));
  bubbleTimer = setTimeout(dismissMascotBubble, duration);
}

function tellJoke(kind) {
  if (!jokeState.remaining.length) {
    const deck = jokes.map((_, index) => index);
    for (let index = deck.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[other]] = [deck[other], deck[index]];
    }
    const top = deck.length - 1;
    if (deck[top] === jokeState.last) {
      const other = Math.floor(Math.random() * top);
      [deck[top], deck[other]] = [deck[other], deck[top]];
    }
    jokeState.remaining = deck;
  }
  jokeState.last = jokeState.remaining.pop();
  saveJokeState();
  showMascotBubble(jokes[jokeState.last], kind);
  if (mascotJoke.textContent !== "再来一个") mascotJoke.textContent = "再来一个";
}

function canTellIdleJoke() {
  return mascotVisible && !document.hidden && !mascotQuiet.checked && automaticJokes < 2 &&
    !request && !composing && document.activeElement !== input && !input.value.trim();
}

function scheduleIdleJoke() {
  clearTimeout(idleTimer);
  if (!canTellIdleJoke()) return;

  idleTimer = setTimeout(() => {
    if (!canTellIdleJoke()) return;
    automaticJokes++;
    tellJoke("idle");
    scheduleIdleJoke();
  }, 60000);
}

if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    mascotVisible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    scheduleIdleJoke();
  }, { threshold: 0.25 }).observe(mascotArea);
}
document.addEventListener("visibilitychange", scheduleIdleJoke);
document.querySelector("#echo").addEventListener("pointermove", scheduleIdleJoke, { passive: true });
document.querySelector("#echo").addEventListener("keydown", scheduleIdleJoke);
mascotQuiet.addEventListener("change", () => {
  jokeState.quiet = mascotQuiet.checked;
  saveJokeState();
  if (mascotQuiet.checked && mascotBubble.dataset.kind === "idle") dismissMascotBubble();
  scheduleIdleJoke();
});
mascotJoke.addEventListener("click", () => {
  tellJoke("manual");
  scheduleIdleJoke();
});
mascotClose.addEventListener("click", () => {
  dismissMascotBubble();
  scheduleIdleJoke();
});

portrait.addEventListener("click", () => {
  const flipped = portrait.getAttribute("aria-pressed") === "false";
  portrait.setAttribute("aria-pressed", String(flipped));
  if (flipped) {
    portrait.setAttribute("aria-describedby", "portrait-details");
  } else {
    portrait.removeAttribute("aria-describedby");
  }
});

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const entrance = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    mascot.classList.replace("is-awaiting", "is-arriving");
    entrance.disconnect();
  }, { threshold: 0.25 });
  mascot.classList.add("is-awaiting");
  entrance.observe(mascot);
}

function addMessage(kind, content) {
  const message = document.createElement("p");
  message.className = "message " + kind;
  message.textContent = content;
  log.append(message);
  log.scrollTop = log.scrollHeight;
  return message;
}

async function callChatApi(path, controller, timeout, options = {}) {
  const url = new URL(`${chatApi}${path}`, location.origin);
  const timer = setTimeout(() => controller.abort("timeout"), timeout);
  let http;
  let type;
  const fail = (code, message) => ({ error: { url, code, message, http, type } });
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "omit",
      redirect: "manual",
      cache: "no-store",
    });
    if (response.type === "opaqueredirect") return fail("redirect", "连接被重定向，问答服务未返回有效答复。");
    http = response.status;
    const mime = response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
    type = mime === "application/json" ? "json" : mime === "text/html" ? "html" : "other";
    if (http === 401) return fail("unauthorized", "问答服务要求身份验证，当前无法匿名访问。");
    if (http === 403) return fail("forbidden", "问答服务拒绝了这次请求（HTTP 403）。");
    if (type !== "json") return fail("non-json", "问答服务返回了非 JSON 页面，请稍后重试。");
    const data = await response.json();
    if (!response.ok) {
      return fail("api-error", typeof data?.error === "string" ? data.error : "问答服务暂时不可用。");
    }
    if (path === "/api/status" && typeof data?.configured === "boolean") {
      return data.configured ? { data } : fail("unconfigured", "数字分身暂未配置模型。");
    }
    if (path === "/api/chat" && typeof data?.answer === "string" && data.answer.trim()) return { data };
    return fail("invalid-json", "问答服务返回的内容不完整。");
  } catch {
    if (controller.signal.reason === "timeout") return fail("timeout", "问答服务连接超时，请重试。");
    if (type === "json") return fail("invalid-json", "问答服务的 JSON 响应无法读取。");
    return fail("fetch-failed", "浏览器未能读取问答服务的响应，暂时无法判断原因。");
  } finally {
    clearTimeout(timer);
  }
}

function showChatError(problem) {
  const { url, code, message, http, type } = problem;
  chatError.textContent = message;
  chatDiagnostics.value = [
    `时间 ${new Date().toISOString()}`,
    `页面 ${location.origin}${location.pathname}`,
    `接口 ${url.origin}${url.pathname}`,
    `类别 ${code}${http ? ` · HTTP ${http}` : ""}${type ? ` · ${type}` : ""}`,
  ].join("\n");
  chatDiagnostics.hidden = true;
  chatCopy.textContent = "复制诊断信息";
  chatHelp.hidden = false;
}

chatCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(chatDiagnostics.value);
    chatCopy.textContent = "已复制";
  } catch {
    chatDiagnostics.hidden = false;
    chatDiagnostics.select();
  }
});

async function checkStatus() {
  if (chatRetry.disabled) return;
  chatRetry.disabled = true;
  status.textContent = "正在检查连接";
  const result = await callChatApi("/api/status", new AbortController(), 9000);
  chatRetry.disabled = false;
  status.dataset.ready = String(!result.error);
  if (result.error) {
    status.textContent = result.error.code === "unconfigured" ? "模型待配置" : "暂时无法检查连接";
    showChatError(result.error);
  } else {
    status.textContent = (result.data.model || "模型") + " · 已配置";
    chatHelp.hidden = true;
  }
}

chatRetry.addEventListener("click", checkStatus);

input.addEventListener("compositionstart", () => {
  composing = true;
});
input.addEventListener("compositionend", () => {
  composing = false;
});
input.addEventListener("blur", () => {
  composing = false;
});
for (const event of ["focus", "blur", "input", "compositionstart", "compositionend"]) {
  input.addEventListener(event, scheduleIdleJoke);
}
input.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey) ||
      composing || event.isComposing || event.keyCode === 229) return;
  event.preventDefault();
  form.requestSubmit();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question || request || composing) return;
  const controller = new AbortController();
  request = controller;
  scheduleIdleJoke();
  send.disabled = true;
  input.value = "";
  addMessage("user", question);
  const pending = addMessage("notice", "正在生成回答…");
  try {
    const result = await callChatApi("/api/chat", controller, 26000, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, turns }),
    });
    if (request !== controller) return;
    if (result.error) {
      pending.textContent = "发送失败，问题已保留。";
      if (!input.value) input.value = question;
      showChatError(result.error);
      return;
    }
    chatHelp.hidden = true;
    pending.remove();
    addMessage("assistant", result.data.answer);
    turns = [...turns, { question, answer: result.data.answer }].slice(-3);
  } finally {
    if (request === controller) {
      request = undefined;
      send.disabled = false;
      scheduleIdleJoke();
    }
  }
});

document.querySelectorAll(".suggestions button").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.textContent;
    input.focus();
  });
});

mascot.addEventListener("click", () => {
  showMascotBubble(greetings[greeting]);
  greeting = (greeting + 1) % greetings.length;
  mascotAction?.cancel();
  if (!reduceMotion.matches) {
    mascotAction = mascot.animate(
      [{ transform: "none" }, { transform: "translateY(-9px) rotate(-9deg)" }, { transform: "translateY(2px) rotate(4deg)" }, { transform: "none" }],
      { duration: 390, easing: "ease-out" },
    );
  }
  input.focus();
});

reset.addEventListener("click", () => {
  request?.abort();
  request = undefined;
  turns = [];
  log.replaceChildren(welcome.cloneNode(true));
  input.value = "";
  send.disabled = false;
  input.focus();
});

checkStatus();

const feedbackForm = document.querySelector("#feedback-form");
const feedbackMessage = document.querySelector("#feedback-message");
const feedbackCount = document.querySelector("#feedback-count");
const feedbackSend = document.querySelector("#feedback-send");
const feedbackStatus = document.querySelector("#feedback-status");

function updateFeedbackCount() {
  feedbackCount.textContent = feedbackMessage.value.length + " / 500";
}

feedbackMessage.addEventListener("input", updateFeedbackCount);
feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (feedbackSend.disabled) return;
  const message = feedbackMessage.value.trim();
  if (message.length < 3) {
    feedbackStatus.dataset.state = "error";
    feedbackStatus.textContent = "请至少写下三个字。";
    feedbackMessage.focus();
    return;
  }
  const fields = new FormData(feedbackForm);
  fields.set("message", message);
  fields.set("_subject", "PHANTOM PROFILE - New Feedback");
  fields.set("_template", "table");
  feedbackSend.disabled = true;
  feedbackStatus.dataset.state = "sending";
  feedbackStatus.textContent = "正在提交反馈…";
  try {
    const response = await fetch("https://formsubmit.co/ajax/Henrychen2008@hotmail.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: fields,
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (response.ok && (result.success === true || result.success === "true")) {
      feedbackForm.reset();
      updateFeedbackCount();
      feedbackStatus.dataset.state = "success";
      feedbackStatus.textContent = "反馈已提交。谢谢你的建议！";
    } else {
      feedbackStatus.dataset.state = "error";
      feedbackStatus.textContent = /activat/i.test(result?.message || "")
        ? "反馈邮箱需要激活，你填写的内容已保留。"
        : "暂时没能提交反馈，你填写的内容已保留。";
    }
  } catch {
    feedbackStatus.dataset.state = "error";
    feedbackStatus.textContent = "暂时无法确认提交结果，你填写的内容已保留。";
  } finally {
    feedbackSend.disabled = false;
  }
});
