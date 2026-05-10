# 个人翻译工具（移动版）

一款为移动端优化的 Google 翻译风格翻译工具，纯前端架构，无需后端服务器。支持文本翻译、图片 OCR、文档解析、网页抓取和语音输入。

**在线体验**：https://cloudzhang0.github.io/TranslateTool/mobile/

## 功能特性

- **四种输入方式**：文字翻译、图片 OCR、文档解析、网页抓取
- **智能翻译**：支持标准、口语、正式三种翻译风格
- **语言自动检测**：自动识别输入语言（中/英/日/韩/阿/泰等）
- **语音朗读**：基于 Web Speech API，移动端优化（保持用户手势链）
- **翻译历史**：本地存储，支持搜索和一键复用
- **移动端优先**：单栏竖排布局，面板高度使用 `vh` 单位适配各屏幕

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite |
| **样式方案** | Tailwind CSS |
| **状态管理** | Zustand |
| **图标库** | Lucide React |
| **翻译 API** | 百度翻译 API（前端直接调用，CORS 代理降级） |
| **部署** | GitHub Pages + Cloudflare Worker |

## 架构特点

**纯前端架构**：无需 Flask/Express 等后端服务器，翻译请求从前端直接发送到百度翻译 API。

**CORS 代理降级策略**：
1. **直接调用** → 2. **corsproxy.io 代理** → 3. **allorigins 代理**

**Cloudflare Worker**：用于 GitHub Pages 部署时保护百度翻译 API 密钥。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端默认运行在 `http://localhost:5173`，翻译功能直接调用百度 API（开发环境下通过 CORS 代理降级）。

### 3. 构建并部署

```bash
npm run build
```

构建产物输出到 `dist/`，通过 GitHub Actions 自动部署到 GitHub Pages。

## 项目结构

```
translate-tool-mobile-new/
├── index.html                    # 入口 HTML
├── package.json                  # 前端依赖配置
├── vite.config.ts                # Vite 配置
├── cloudflare-worker.js          # Cloudflare Worker（保护 API 密钥）
├── DEPLOYMENT.md                 # 部署文档
├── server/                       # Flask 后端（OCR/文档/网页抓取，翻译不经过此后端）
│   └── app.py
└── src/
    ├── main.tsx                  # React 入口
    ├── App.tsx                   # 应用根组件（布局编排）
    ├── index.css                 # 全局样式（Google 色板）
    ├── types/index.ts            # TypeScript 类型定义
    ├── stores/appStore.ts        # Zustand 全局状态
    ├── services/
    │   ├── translation.ts        # 百度翻译 API + 语音合成（纯前端）
    │   ├── ocr.ts                # 图片 OCR 服务
    │   ├── document.ts           # 文档解析服务
    │   └── website.ts            # 网页抓取服务
    ├── hooks/
    │   ├── useTranslation.ts     # 翻译逻辑 Hook
    │   ├── useSpeech.ts          # 语音朗读 Hook
    │   └── useHistory.ts         # 历史记录 Hook
    ├── utils/
    │   ├── language.ts           # 语言列表和工具函数
    │   └── debounce.ts           # 防抖工具函数
    └── components/
        ├── layout/
        │   ├── Header.tsx        # 顶部导航（含设置下拉）
        │   ├── LanguageBar.tsx   # 语言选择栏
        │   ├── InputPanel.tsx    # 输入面板
        │   ├── OutputPanel.tsx   # 输出面板
        │   ├── FeatureBar.tsx    # 底部功能栏（4 个图标按钮）
        │   └── HistoryPanel.tsx  # 历史记录侧边栏
        └── input/
            ├── TextInput.tsx     # 文本输入
            ├── ImageInput.tsx    # 图片上传
            ├── DocumentInput.tsx # 文档上传
            └── WebsiteInput.tsx  # 网址输入
```

## 环境要求

- Node.js 18+
- 现代浏览器（Chrome、Edge、Safari 推荐）

---

## 开发历程

### 架构演进

1. **初版**：Express.js 后端 + `translators` 库
2. **Flask 迁移**：后端迁移到 Python Flask
3. **纯前端化**：移除后端依赖，翻译 API 改为前端直接调用百度翻译 API + CORS 代理降级

### UI 演进

1. **初版**：渐变背景、毛玻璃导航栏
2. **Google 风格重构**：纯白背景、扁平设计、Google 翻译配色
3. **移动端优化**：面板高度改为 `vh` 单位（23vh），适配不同屏幕尺寸

### 解决的关键问题

#### 1. 移动端语音朗读第二次失效
- **原因**：Web Speech API 要求 `speechSynthesis.speak()` 必须在用户手势（click）的**同一同步调用栈**中调用。代码中使用了 `await`（如加载语音列表），导致调用栈中断，浏览器拒绝执行朗读
- **解决**：
  - 移除 `speak()` 之前的所有 `await`，改为同步调用
  - 仅使用浏览器已缓存的语音列表（`getVoices()` 同步返回）
  - 每次调用前执行 `cancel()` + `resume()` 重置引擎状态
- **经验**：移动端浏览器对用户手势链的要求比桌面端严格得多，任何 `await` 都会破坏手势链

#### 2. 百度翻译 Invalid Sign 错误
- **原因**：MD5 签名计算时未正确处理中文 UTF-8 编码
- **解决**：在 MD5 实现中使用 `unescape(encodeURIComponent(s))` 确保 UTF-8 字节编码
- **经验**：涉及多语言文本的 API 签名必须统一使用 UTF-8 编码

#### 3. CORS 跨域问题
- **原因**：百度翻译 API 不支持浏览器跨域请求
- **解决**：实现三级降级策略 — 直接调用 → corsproxy.io → allorigins
- **经验**：公共 CORS 代理不稳定，需要多个备选方案

#### 4. 语音朗读英国腔调
- **原因**：浏览器默认英语语音是英式的（Microsoft David）
- **解决**：加载语音列表后优先选择 en-US 美式语音（Zira/Mark/Steffan）
- **经验**：`speechSynthesis.getVoices()` 需等待异步加载完成

### 经验总结

- **移动端用户手势链**：Web Speech API 等敏感操作必须在同步调用栈中完成，不能有 `await`
- **选择器模式**：Zustand 的选择器按需订阅，避免不必要的渲染
- **CORS 降级策略**：前端直接调用第三方 API 时，需准备多个代理备选方案
- **vh 布局**：移动端使用 `vh` 单位比固定 `px` 更能适配不同屏幕
