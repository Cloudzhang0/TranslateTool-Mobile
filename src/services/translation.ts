import { TranslationRequest, TranslationResponse, SpeechRate } from '../types';

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        source_lang: request.sourceLang,
        target_lang: request.targetLang,
        style: request.style,
      }),
    });

    if (!response.ok) {
      throw new Error('翻译请求失败');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        sourceLang: data.source_lang || request.sourceLang || 'auto',
        targetLang: request.targetLang,
        style: request.style,
        translatedText: data.translated_text,
        cached: data.cached || false,
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

export async function detectLanguage(text: string): Promise<{ language: string; languageName: string; confidence: number }> {
  try {
    const response = await fetch('/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('语言检测失败');
    }

    const data = await response.json();
    return {
      language: data.language,
      languageName: data.language_name,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error('Language detection error:', error);
    return {
      language: 'auto',
      languageName: '未知',
      confidence: 0,
    };
  }
}

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
