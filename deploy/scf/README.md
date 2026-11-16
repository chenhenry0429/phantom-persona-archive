# 腾讯云广州 SCF 候选部署

候选包复用主页的 Worker、公开资料、提示词和最近三轮对话逻辑。模型调用由云函数直接发送到 DeepSeek，密钥使用云函数的服务端环境变量。部署的前提是账号已有可用 SCF 权限或已确认开通费用。

## 生成和部署

1. 在仓库根目录运行 `python deploy/scf/package.py Phantom-SCF-Candidate.zip`。需要 Node.js 与 Python。ZIP 中的 `scf_bootstrap` 已标为可执行并使用 LF 换行。
2. 在[腾讯云云函数控制台](https://console.cloud.tencent.com/scf)创建广州地域的 Web 函数，选择 Node.js 20.19，上传 ZIP，配置执行超时 25 秒，并启用公网 HTTPS 函数 URL。选择无需鉴权以供匿名访客使用。CORS 由应用处理，允许来源为 `https://chenhenry0429.github.io`。若控制台代答 OPTIONS，配置为仅允许该来源，允许 GET、POST、OPTIONS 及 `Content-Type`，关闭凭据支持，并验证返回头。
3. 初次部署可以先不设置 `MODEL_API_KEY`。在无 VPN 的目标浏览器检查候选 `/api/status`、预检与 `/api/chat` 的空 JSON POST。状态应为 JSON 和 `configured:false`，预检应为 204 或其他成功状态并带正确的 CORS 头，空输入应为带 CORS 头的 400 JSON。可用 Pages 连接检查页的 `?backend=` 参数指定候选 HTTPS Origin。
4. 连接通过后，在云函数服务端填写 `MODEL_API_KEY`，设置 `MODEL_PROVIDER=deepseek` 和 `MODEL_NAME=deepseek-flash`。如平台向应用传入的 Host 与公开 URL 不同，设置 `SCF_PUBLIC_ORIGIN` 为实际 HTTPS Origin。外网出口需要能访问 `api.deepseek.com`。将本轮剩余的两次请求留给目标网络上的首问和带历史的追问。

当前候选按实例共享已有的每分钟 8 次模型请求上限。平台可另外配置项目侧用量限制和账单提醒。无密钥的状态请求、OPTIONS 和空 JSON 都不会请求模型。

## 切换与回退

无 VPN 的首问和追问通过后，在仓库根目录将 `PAGES_CHAT_API` 设为候选 HTTPS Origin，执行 `npm run build:pages`。将 `dist/github-pages/` 中的六个文件同步到 `docs/` 并提交。随后用匿名浏览器确认 Pages 实际请求了新 Origin。若需要回退，将 `PAGES_CHAT_API` 设回 `https://phantom-profile-henry-chen.chenhenry860.chatgpt.site`，重建并同步 `docs/`。

选型和费用以 [函数 URL](https://cloud.tencent.com/document/product/583/96099)、[SCF 计费](https://cloud.tencent.com/document/product/583/17299)与[产品定价](https://cloud.tencent.com/document/product/583/12281)为准。试用资格看账户状态，计算、调用、流量及可能的日志费用应以控制台显示为准。
