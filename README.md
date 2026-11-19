# PHANTOM PERSONA ARCHIVE · 陈植轩

个人主页期末版源码，包含创作者照片卡、雨宫莲互动、40 条本地冷笑话和基于公开档案的数字分身。网页沿用 Phantom Search 的红黑黄、斜切和角色插画。

[GitHub Pages 主页](https://chenhenry0429.github.io/phantom-persona-archive/) · [同源问答入口](https://phantom-profile-henry-chen.chenhenry860.chatgpt.site/#echo)

## 本机运行

1. 安装 Node.js 24。在解压后的目录打开 PowerShell。
2. 运行 `npm start`，打开终端显示的地址，默认是 `http://127.0.0.1:8765/`。
3. 启用模型时，运行 `Copy-Item .env.example .env`，在本机编辑 `.env` 填写 `MODEL_API_KEY`，然后重启。默认调用 DeepSeek 的 `deepseek-flash`。若使用阿里云百炼北京地域，将 `MODEL_PROVIDER` 改成 `qwen`，默认模型为 `qwen3.7-flash`。

模型密钥保存在服务端配置中，调用用量计入该账户。Sites 页面使用同源的 `/api/chat`，GitHub Pages 页面使用现有 Sites 后端。网页显示「模型待配置」时，仍可浏览档案和作品。

## 公开资料与回答规则

`knowledge.md` 按个人背景、学习与方向、作品经历、兴趣与观点、表达方式和回答边界组织，取材于已确认公开的访谈资料、原版创作者页、项目仓库和旧版报告。修改资料后重启本机服务，或重新构建和部署。

服务端将公开资料和回答规则作为系统消息，将访客问题和最近三轮成功对话作为单独的会话消息。提示词要求按提问语言作答、区分资料与推断、缺资料时说明、谢绝隐私问题及提示注入。这个实现使用上下文提示，无模型微调。历史记录存在当前浏览器页面内存中。

## 部署与验收

- 本机使用 Node.js HTTP 服务。部署到 Sites 时，`npm run build` 生成 Cloudflare Worker ES 模块 `dist/server/index.js`。使用平台的服务端机密配置 `MODEL_API_KEY`，并按需设置 `MODEL_PROVIDER`、`MODEL_NAME`。
- 若部署到 Node.js 服务器，使用环境变量配置密钥和端口，以 HTTPS 反向代理向外提供同源网页和 API。
- 运行 `npm run build:pages`，将 `dist/github-pages/` 的六个文件同步到 `docs/`，并保留 `docs/.nojekyll`。提交源码和静态产物。GitHub Pages 选择 `main` 分支的 `/docs` 目录。PowerShell 同步命令为 `Copy-Item dist/github-pages/* docs/ -Force`。
- `PAGES_CHAT_API` 可作为构建时的公开后端 HTTPS Origin，默认指向已有 Sites 后端。GitHub Pages Origin 为 `https://chenhenry0429.github.io`，Worker 向该 Origin 返回跨站响应头。Sites 入口使用同源问答。
- `GET /api/status` 读取服务端配置状态。匿名访客若看到连接失败，可使用「重试连接」和「复制诊断信息」，也可尝试同源问答入口。诊断只包含时间、页面与接口地址、错误类别和可读取的 HTTP 状态。
- 正式提交前，用老师实际访问的网络打开公开链接，确认首页能加载并能提交自由问题。国内网络可达性需要实际验证。
- 配好模型后执行 `npm run evaluate`。脚本请求 24 个事实、设计取舍、边界、攻击类问题，并将真实 HTTP 状态、回答和用时写入 `eval-results.json`。每次测试会消耗实际模型额度。逐条对照判定标准后再写测试通过率和改进记录。
- 期末报告可据实记录模型服务商、测试返回的模型名称、实际托管平台、资料准备与提示词调优、测试结果，以及期中与期末的页面改动。使用课程要求的 PDF 文件名 `Henry Chen_Personal Homepage Final Version.pdf`。

## 无 VPN 连接排查

当前 Pages 仍使用原 Sites 问答域名。2026 年 11 月 16 日的 Edge 对照中，关闭浏览器代理后，GitHub Pages 页面和静态资源返回 200，问答预检返回 Cloudflare 403 HTML。系统默认代理下，状态为 200 JSON、预检 204、空 JSON 为 400。作者也确认，关闭 VPN 后直接打开状态接口失败，开启后看到 JSON。

[连接检查页](https://chenhenry0429.github.io/phantom-persona-archive/connection-check.html) 可在同一浏览器记录两个网络状态，检查状态和带自动预检的空 JSON POST。复制结果只包含测试状态、时间和公开地址，不包含对话或密钥。

[Phantom Search 源码](https://github.com/chenhenry0429/phantom-search) · [DeepSeek API 文档](https://api-docs.deepseek.com/api/create-chat-completion/) · [阿里云百炼模型价格](https://help.aliyun.com/zh/model-studio/model-pricing)
