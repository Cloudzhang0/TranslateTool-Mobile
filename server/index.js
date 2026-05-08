const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Mimo API 配置（Anthropic 兼容）
const MIMO_BASE_URL = process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/anthropic';
const MIMO_API_KEY = process.env.MIMO_API_KEY || '';
const MIMO_MODEL = process.env.MIMO_MODEL || 'mimo-v2.5-pro';

if (MIMO_API_KEY) {
  console.log('Mimo 翻译 API 已配置');
} else {
  console.log('警告: 未设置 MIMO_API_KEY，翻译功能不可用');
}

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 翻译缓存
const translationCache = new Map();

// 语言检测 API
app.post('/api/detect', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: '文本不能为空' });
  }

  // 简单的语言检测逻辑
  const detectLanguage = (text) => {
    const chineseRegex = /[一-鿿]/;
    const japaneseRegex = /[぀-ゟ゠-ヿ]/;
    const koreanRegex = /[가-힯ᄀ-ᇿ]/;
    const arabicRegex = /[؀-ۿ]/;
    const thaiRegex = /[฀-๿]/;

    if (chineseRegex.test(text)) return { language: 'zh', languageName: '中文', confidence: 0.95 };
    if (japaneseRegex.test(text)) return { language: 'ja', languageName: '日语', confidence: 0.95 };
    if (koreanRegex.test(text)) return { language: 'ko', languageName: '韩语', confidence: 0.95 };
    if (arabicRegex.test(text)) return { language: 'ar', languageName: '阿拉伯语', confidence: 0.95 };
    if (thaiRegex.test(text)) return { language: 'th', languageName: '泰语', confidence: 0.95 };

    // 默认检测为英语
    return { language: 'en', languageName: '英语', confidence: 0.85 };
  };

  const result = detectLanguage(text);
  res.json(result);
});

// 语言名称映射
const langNames = {
  'zh': '中文', 'en': '英语', 'ja': '日语', 'ko': '韩语',
  'de': '德语', 'fr': '法语', 'es': '西班牙语', 'pt': '葡萄牙语',
  'ru': '俄语', 'ar': '阿拉伯语', 'it': '意大利语', 'nl': '荷兰语',
  'pl': '波兰语', 'tr': '土耳其语', 'vi': '越南语', 'th': '泰语',
  'id': '印尼语', 'uk': '乌克兰语', 'cs': '捷克语', 'da': '丹麦语',
  'el': '希腊语', 'et': '爱沙尼亚语', 'fi': '芬兰语', 'hu': '匈牙利语',
  'lt': '立陶宛语', 'lv': '拉脱维亚语', 'ro': '罗马尼亚语', 'sk': '斯洛伐克语',
  'sl': '斯洛文尼亚语', 'sv': '瑞典语', 'nb': '挪威语', 'bg': '保加利亚语',
};

// 风格描述
const styleDesc = {
  'standard': '标准翻译',
  'casual': '口语化、轻松的翻译',
  'formal': '正式、书面语的翻译',
};

// 调用 Mimo API
async function callMimoAPI(prompt) {
  const url = new URL(MIMO_BASE_URL + '/v1/messages');
  const body = JSON.stringify({
    model: MIMO_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': MIMO_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

// 翻译 API
app.post('/api/translate', async (req, res) => {
  const { text, source_lang, target_lang, style } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: '文本不能为空' });
  }

  // 检查缓存
  const cacheKey = `${text}_${source_lang}_${target_lang}_${style}`;
  if (translationCache.has(cacheKey)) {
    return res.json({
      translated_text: translationCache.get(cacheKey),
      source_lang: source_lang || 'auto',
      cached: true,
    });
  }

  if (!MIMO_API_KEY) {
    return res.status(500).json({
      error: '请在 server/.env 文件中配置 MIMO_API_KEY',
    });
  }

  try {
    const targetName = langNames[target_lang] || target_lang;
    const sourceName = (source_lang && source_lang !== 'auto') ? (langNames[source_lang] || source_lang) : '自动检测';
    const styleName = styleDesc[style] || '标准翻译';

    const prompt = `你是一个专业的翻译引擎。请将以下文本翻译成${targetName}。
要求：${styleName}。只输出翻译结果，不要添加任何解释、引号或额外文字。

源语言：${sourceName}
目标语言：${targetName}

待翻译文本：
${text}`;

    const translatedText = await callMimoAPI(prompt);

    // 保存到缓存
    translationCache.set(cacheKey, translatedText);
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    res.json({
      translated_text: translatedText,
      source_lang: source_lang || 'auto',
      cached: false,
    });
  } catch (error) {
    console.error('翻译错误:', error.message);
    res.status(500).json({ error: `翻译失败: ${error.message}` });
  }
});

// OCR API
app.post('/api/ocr', upload.single('image'), (req, res) => {
  if (!req.file && !req.body.image) {
    return res.status(400).json({ error: '请上传图片' });
  }

  // 模拟OCR识别
  const mockOCRResult = {
    text: '这是一段从图片中识别出的文字。\nThis is text recognized from the image.',
    confidence: 0.95,
    language: 'zh',
  };

  res.json(mockOCRResult);
});

// 文档解析 API
app.post('/api/document/parse', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传文件' });
  }

  const fileName = req.file.originalname;
  const fileContent = req.file.buffer.toString('utf-8');

  // 模拟文档解析
  res.json({
    text: fileContent || `文档内容提取自: ${fileName}`,
    pages: 1,
    wordCount: (fileContent || '').split(/\s+/).length,
  });
});

// 网页抓取 API
app.post('/api/website/extract', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: '请输入网址' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: '无效的网址' });
  }

  // 模拟网页抓取
  const mockResult = {
    title: '示例网页标题',
    content: `这是从 ${url} 抓取的网页内容。\n\n这里是文章的正文内容，包含了主要的信息和观点。网页抓取功能可以提取网页中的主要文本内容，去除广告、导航栏等干扰元素。`,
    author: '示例作者',
    publishDate: new Date().toISOString().split('T')[0],
  };

  res.json(mockResult);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API 端点:`);
  console.log(`  POST /api/detect - 语言检测`);
  console.log(`  POST /api/translate - 翻译`);
  console.log(`  POST /api/ocr - 图片OCR`);
  console.log(`  POST /api/document/parse - 文档解析`);
  console.log(`  POST /api/website/extract - 网页抓取`);
  console.log(`  GET  /api/health - 健康检查`);
});
