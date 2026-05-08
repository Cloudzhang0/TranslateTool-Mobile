import { TranslationRequest, TranslationResponse, SpeechRate } from '../types';

// Cloudflare Worker URL（部署后需要替换为你的 Worker URL）
// 访问 https://cloudzhang0.github.io/TranslateTool 时，会使用这个地址
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://your-worker-url.workers.dev';

// 百度 API 不支持的语言映射（映射到支持的语言）
const LANG_MAP: Record<string, string> = {
  'sv': 'en',  // 瑞典语 → 英语
  'da': 'en',  // 丹麦语 → 英语
  'fi': 'en',  // 芬兰语 → 英语
  'nb': 'no',  // 挪威语 → 挪威语
};

// 语言检测（简单实现）
export async function detectLanguage(text: string): Promise<{ language: string; languageName: string; confidence: number }> {
  // 简单的正则语言检测
  const patterns: [RegExp, string, string, number][] = [
    [/[一-鿿]/, 'zh', '中文', 0.95],
    [/[぀-ゟ゠-ヿ]/, 'ja', '日语', 0.95],
    [/[가-힯ᄀ-ᇿ]/, 'ko', '韩语', 0.95],
    [/[؀-ۿ]/, 'ar', '阿拉伯语', 0.95],
    [/[฀-๿]/, 'th', '泰语', 0.95],
  ];

  for (const [pattern, lang, name, conf] of patterns) {
    if (pattern.test(text)) {
      return { language: lang, languageName: name, confidence: conf };
    }
  }

  return { language: 'en', languageName: '英语', confidence: 0.85 };
}

// 调用 Cloudflare Worker 进行翻译
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const { text, sourceLang, targetLang } = request;

    // 映射不支持的语言
    const from = (sourceLang && LANG_MAP[sourceLang]) || sourceLang || 'auto';
    const to = (targetLang && LANG_MAP[targetLang]) || targetLang || 'en';

    // 调用 Cloudflare Worker
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        from: from,
        to: to,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '翻译请求失败');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '翻译失败');
    }

    return {
      success: true,
      data: {
        sourceLang: data.data.from || sourceLang || 'auto',
        targetLang: targetLang,
        style: request.style,
        translatedText: data.data.translatedText,
        cached: false,
      },
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '翻译失败，请重试',
    };
  }
}

// 语音相关函数保持不变
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);

  return new Promise((resolve) => {
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

function findBestVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  // 如果是英语，优先选美国腔 (en-US)
  if (lang === 'en' || lang.startsWith('en')) {
    // 优先找 en-US 的语音
    const usVoice = voices.find(
      (v) => v.lang === 'en-US' || v.lang.startsWith('en-US')
    );
    if (usVoice) return usVoice;

    // 其次找名称中包含 "US" 或 "American" 的英语语音
    const usNamed = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('US') ||
          v.name.includes('American') ||
          v.name.includes('Zira') ||
          v.name.includes('Mark') ||
          v.name.includes('Steffan'))
    );
    if (usNamed) return usNamed;

    // 最后 fallback 到第一个英语语音
    const anyEn = voices.find((v) => v.lang.startsWith('en'));
    if (anyEn) return anyEn;
  }

  return null;
}

export async function speakText(text: string, lang: string, rate: SpeechRate = 'normal'): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    const rateMap: Record<SpeechRate, number> = { slow: 0.7, normal: 1.0, fast: 1.5 };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rateMap[rate];
    utterance.pitch = 1.0;

    // 等待语音列表加载，然后选择最佳语音（英语选美式，其他语言保持默认）
    const voices = await ensureVoices();
    const best = findBestVoice(voices, lang);
    if (best) {
      utterance.voice = best;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    window.speechSynthesis.speak(utterance);
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}
