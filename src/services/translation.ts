import { TranslationRequest, TranslationResponse, SpeechRate } from '../types';

// 百度翻译 API 配置（移动版直接调用，密钥内嵌）
const BAIDU_APP_ID = '20260508002608997';
const BAIDU_SECRET_KEY = 'r7QE_JA0kEvC34H0mtxI';
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 百度 API 不支持的语言映射（映射到支持的语言）
const LANG_MAP: Record<string, string> = {
  'sv': 'en',  // 瑞典语 → 英语
  'da': 'en',  // 丹麦语 → 英语
  'fi': 'en',  // 芬兰语 → 英语
  'nb': 'no',  // 挪威语 → 挪威语
};

// MD5 实现
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function md51(s: string) {
    // 将 Unicode 字符串转为 UTF-8 字节（百度翻译要求 UTF-8 编码）
    s = unescape(encodeURIComponent(s));
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i: number;

    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }

    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }

    tail[i >> 2] |= 0x80 << ((i % 4) << 3);

    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }

    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  const hex_chr = '0123456789abcdef'.split('');

  function rhex(n: number) {
    let s = '';
    for (let j = 0; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
    }
    return s;
  }

  function hex(x: number[]) {
    return x.map(rhex).join('');
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  return hex(md51(string));
}

// 语言检测（简单实现）
export async function detectLanguage(text: string): Promise<{ language: string; languageName: string; confidence: number }> {
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

// CORS 代理列表（百度 API 不支持浏览器跨域请求）
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

// 发送翻译请求（支持 CORS 代理降级）
async function fetchTranslation(params: URLSearchParams): Promise<any> {
  const body = params.toString();

  // 策略1: 直接调用
  try {
    const response = await fetch(BAIDU_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    return await response.json();
  } catch {
    // CORS 拦截，尝试代理
  }

  // 策略2~3: 公共 CORS 代理
  for (const buildUrl of CORS_PROXIES) {
    try {
      const proxyUrl = buildUrl(BAIDU_API_URL);
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      return await response.json();
    } catch {
      continue;
    }
  }

  throw new Error('网络请求失败，无法连接翻译服务');
}

// 直接调用百度翻译 API（CORS 代理降级）
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const { text, sourceLang, targetLang } = request;

    // 映射不支持的语言
    const from = (sourceLang && LANG_MAP[sourceLang]) || sourceLang || 'auto';
    const to = (targetLang && LANG_MAP[targetLang]) || targetLang || 'en';

    // 生成签名
    const salt = Date.now().toString();
    const sign = md5(BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY);

    // 构建请求参数
    const params = new URLSearchParams({
      q: text,
      from: from,
      to: to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign,
    });

    // 调用翻译 API（自动降级）
    const data = await fetchTranslation(params);

    // 检查错误
    if (data.error_code) {
      throw new Error(`翻译失败: ${data.error_msg}`);
    }

    return {
      success: true,
      data: {
        sourceLang: data.from || from || 'auto',
        targetLang: targetLang,
        style: request.style,
        translatedText: data.trans_result.map((item: { dst: string }) => item.dst).join('\n'),
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

// 语音相关函数
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
  if (lang === 'en' || lang.startsWith('en')) {
    const usVoice = voices.find(
      (v) => v.lang === 'en-US' || v.lang.startsWith('en-US')
    );
    if (usVoice) return usVoice;

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

    const anyEn = voices.find((v) => v.lang.startsWith('en'));
    if (anyEn) return anyEn;
  }

  return null;
}

export async function speakText(text: string, lang: string, rate: SpeechRate = 'normal'): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('浏览器不支持语音合成');
  }

  // 重置引擎状态：cancel + resume 确保引擎就绪
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // 延迟等引擎完全重置（移动端 Chrome 必须）
  await new Promise(r => setTimeout(r, 150));

  const rateMap: Record<SpeechRate, number> = { slow: 0.7, normal: 1.0, fast: 1.5 };
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rateMap[rate];
  utterance.pitch = 1.0;

  const voices = await ensureVoices();
  const best = findBestVoice(voices, lang);
  if (best) {
    utterance.voice = best;
  }

  // 只在 speak() 回调处包装 Promise
  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === 'canceled') {
        resolve();
      } else {
        reject(event.error);
      }
    };
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
