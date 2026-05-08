# 个人翻译工具

一款基于 Google 翻译风格设计的免费翻译工具，支持文本翻译、图片 OCR、文档解析、网页抓取和语音输入，提供标准/口语/正式三种翻译风格。

## 功能特性

- **五种输入方式**：文字翻译、图片 OCR、文档解析、网页抓取、语音输入
- **智能翻译**：支持标准、口语、正式三种翻译风格
- **语言自动检测**：自动识别输入语言（中/英/日/韩/阿/泰）
- **语音功能**：语音输入（浏览器语音识别）+ 语音朗读（美式发音）
- **翻译历史**：本地存储，支持搜索
- **响应式设计**：桌面端双栏并排，移动端单栏堆叠
- **简洁界面**：Google 翻译风格 UI，纯白背景，扁平设计

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript 6 |
| **构建工具** | Vite 8 |
| **样式方案** | Tailwind CSS 4 |
| **状态管理** | Zustand 5 |
| **图标库** | Lucide React |
| **后端** | Python Flask（替代原 Express.js） |
| **翻译引擎** | translators 库 v6.0.4（引擎回退链） |

## 快速开始

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装并启动后端（Flask 翻译服务）

```bash
cd server
pip install translators flask flask-cors python-dotenv
python app.py
```

后端默认运行在 `http://localhost:3001`。

### 3. 启动前端

```bash
npm run dev
```

前端默认运行在 `http://localhost:5173`，API 请求通过 Vite 代理自动转发到后端。

### 4. 同时启动（需要 concurrently）

```bash
npm run dev:all
```

## 项目结构

```
translate-tool/
├── index.html                    # 入口 HTML
├── package.json                  # 前端依赖配置
├── vite.config.ts                # Vite + API 代理配置
├── tsconfig.json                 # TypeScript 配置
├── public/
│   ├── favicon.svg               # 标签页图标
│   └── icons.svg                 # 功能图标
├── server/
│   └── app.py                    # Flask 后端翻译服务
└── src/
    ├── main.tsx                  # React 入口
    ├── App.tsx                   # 应用根组件（布局编排）
    ├── index.css                 # 全局样式（Google 色板）
    ├── types/index.ts            # TypeScript 类型定义
    ├── stores/appStore.ts        # Zustand 全局状态
    ├── services/
    │   ├── translation.ts        # 翻译 API + 语音合成
    │   ├── ocr.ts                # 图片 OCR 服务
    │   ├── document.ts           # 文档解析服务
    │   └── website.ts            # 网页抓取服务
    ├── hooks/
    │   ├── useTranslation.ts     # 翻译逻辑 Hook
    │   ├── useSpeech.ts          # 语音输入/输出 Hook
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
        │   ├── FeatureBar.tsx    # 底部功能栏
        │   └── HistoryPanel.tsx  # 历史记录侧边栏
        └── input/
            ├── TextInput.tsx     # 文本输入
            ├── ImageInput.tsx    # 图片上传
            ├── DocumentInput.tsx # 文档上传
            ├── WebsiteInput.tsx  # 网址输入
            └── VoiceInput.tsx    # 语音输入
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/detect` | POST | 语言检测 |
| `/api/translate` | POST | 翻译（含缓存） |
| `/api/ocr` | POST | 图片文字识别 |
| `/api/document/parse` | POST | 文档解析 |
| `/api/website/extract` | POST | 网页抓取 |
| `/api/health` | GET | 健康检查 |

## 设计规范

采用 Google 翻译风格配色方案：

- 背景色：`#FFFFFF`
- 主色：`#1A73E8`
- 文字主色：`#202124`
- 文字次要：`#5F6368`
- 边框：`#DADCE0`
- 悬停背景：`#F1F3F4`
- 输出区背景：`#F8F9FA`
- 占位符：`#80868B`
- 字体：Roboto + 微软雅黑

## 环境要求

- Node.js 18+
- Python 3.x
- 现代浏览器（Chrome、Edge 推荐）

---

## 开发历程总结

### 主要改造

1. **UI 重构**：从渐变背景、毛玻璃风格全面改造为 Google 翻译风格的扁平白色设计
2. **后端迁移**：Express.js → Python Flask，使用 translators 库免费翻译，无需 API Key

### 遇到的主要问题

#### 1. 翻译引擎超时导致 500 错误
- **原因**：Bing 引擎极慢（>15s），Flask 单线程被阻塞
- **解决**：改用 alibaba 引擎、8 秒超时、4 引擎回退链 + 2 次重试
- **经验**：调用第三方库必须设计超时和降级策略

#### 2. 默认目标语言错误
- **原因**：targetLang 默认 `'zh'`，导致中文→中文无意义翻译
- **解决**：默认改为 `'en'`（英语）
- **经验**：默认值直接影响用户体验，需仔细验证

#### 3. 语音朗读英国腔调
- **原因**：浏览器默认英语语音是英式的（Microsoft David）
- **解决**：加载语音列表后优先选择 en-US 美式语音
- **经验**：`speechSynthesis.getVoices()` 需等待异步加载完成

#### 4. Flask 进程管理
- **原因**：调试模式下 Flask 启动两个进程（reloader + worker），多次重启导致端口冲突
- **解决**：使用 `wmic process` 清理旧进程
- **经验**：Windows 上需专门的进程管理策略

### 可吸取的经验

- **先预览再修改**：大规模 UI 重构前先做独立预览页，确认效果后再改源码
- **选择器模式**：Zustand 的选择器按需订阅，避免不必要的渲染
- **配色变量化**：CSS 变量集中管理色板，便于统一修改
- **引擎回退链**：多服务提供商的场景下，按优先级依次尝试是提高可用性的有效模式
