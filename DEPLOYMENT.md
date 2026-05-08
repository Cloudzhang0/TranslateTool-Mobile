# 部署指南

## 一、部署 Cloudflare Worker（保护 API 密钥）

### 步骤 1：注册 Cloudflare

1. 访问 https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（免费）
3. 验证邮箱

### 步骤 2：创建 Worker

1. 登录 Cloudflare Dashboard
2. 左侧菜单点击 **Workers & Pages**
3. 点击 **Create Application**
4. 选择 **Create Worker**
5. 输入 Worker 名称，例如：`translate-api`
6. 点击 **Deploy**

### 步骤 3：编辑 Worker 代码

1. 在 Worker 详情页，点击 **Edit Code**
2. 删除默认代码
3. 将 `cloudflare-worker.js` 的内容复制粘贴进去
4. 点击 **Save and Deploy**

### 步骤 4：配置环境变量（保护 API 密钥）

1. 在 Worker 详情页，点击 **Settings** 标签
2. 点击 **Variables**
3. 添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `BAIDU_APP_ID` | `20260508002608997` |
| `BAIDU_SECRET_KEY` | `r7QE_JA0kEvC34H0mtxI` |

4. 点击 **Save and Deploy**

### 步骤 5：获取 Worker URL

1. 在 Worker 详情页，可以看到 Worker 的 URL
2. 格式类似：`https://translate-api.你的用户名.workers.dev`
3. **复制这个 URL**

---

## 二、配置前端项目

### 步骤 1：创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# Windows (PowerShell)
echo "VITE_WORKER_URL=https://translate-api.你的用户名.workers.dev" > .env

# 或者手动创建 .env 文件，内容：
VITE_WORKER_URL=https://translate-api.你的用户名.workers.dev
```

### 步骤 2：测试本地开发

```bash
npm run dev
```

打开 http://localhost:5173，测试翻译功能是否正常。

---

## 三、部署到 GitHub Pages

### 步骤 1：构建项目

```bash
npm run build
```

### 步骤 2：提交并推送到 GitHub

```bash
git add .
git commit -m "feat: 使用 Cloudflare Worker 保护 API 密钥"
git push origin master
```

### 步骤 3：启用 GitHub Pages

1. 访问 https://github.com/Cloudzhang0/TranslateTool/settings/pages
2. **Source** 选择：`GitHub Actions`
3. 保存

### 步骤 4：等待部署完成

GitHub Actions 会自动构建和部署。完成后访问：

**https://cloudzhang0.github.io/TranslateTool**

---

## 四、验证部署

### 检查项

1. ✅ 访问 https://cloudzhang0.github.io/TranslateTool
2. ✅ 输入文字，点击翻译
3. ✅ 翻译结果正常显示
4. ✅ 按 F12 查看源代码，看不到 API 密钥

### 如果翻译失败

1. 检查浏览器控制台（F12 → Console）的错误信息
2. 检查 Cloudflare Worker 的日志：
   - Cloudflare Dashboard → Workers & Pages → 你的 Worker → Logs
3. 确认环境变量配置正确

---

## 五、安全说明

✅ **API 密钥已安全存储在 Cloudflare Worker 的环境变量中**

- 用户无法在前端代码中看到密钥
- 密钥只在 Cloudflare 服务器上使用
- 即使有人查看网页源代码，也看不到密钥

---

## 六、免费额度

| 服务 | 免费额度 |
|------|---------|
| Cloudflare Workers | 每天 10 万次请求 |
| 百度翻译 API | 每月 5 万字符 |
| GitHub Pages | 无限 |

---

## 七、常见问题

### Q: Cloudflare Worker URL 是什么？

A: 部署 Worker 后，Cloudflare 会给你一个 URL，格式为：
`https://你的worker名称.你的用户名.workers.dev`

### Q: 如何查看 Worker 日志？

A: Cloudflare Dashboard → Workers & Pages → 你的 Worker → Logs

### Q: 翻译失败怎么办？

A: 检查：
1. 环境变量是否配置正确
2. 百度翻译 API 是否还有免费额度
3. Worker 是否正常运行

### Q: 可以使用自定义域名吗？

A: 可以，但需要：
1. 拥有自己的域名
2. 在 Cloudflare 中配置 DNS
3. 在 Worker 中绑定自定义域名

---

## 八、技术架构

```
用户浏览器 (GitHub Pages)
    ↓
Cloudflare Worker (保护 API 密钥)
    ↓
百度翻译 API (免费翻译)
    ↓
返回翻译结果
```

---

## 九、文件说明

| 文件 | 说明 |
|------|------|
| `cloudflare-worker.js` | Cloudflare Worker 代码 |
| `.env.example` | 环境变量示例 |
| `DEPLOYMENT.md` | 本部署指南 |

---

## 十、下一步

1. ✅ 注册 Cloudflare
2. ✅ 创建并部署 Worker
3. ✅ 配置环境变量
4. ✅ 获取 Worker URL
5. ✅ 更新前端 `.env` 文件
6. ✅ 推送到 GitHub
7. ✅ 启用 GitHub Pages
8. ✅ 访问 https://cloudzhang0.github.io/TranslateTool

完成以上步骤后，你的翻译工具就可以在线使用了！
