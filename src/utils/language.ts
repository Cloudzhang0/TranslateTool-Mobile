import { Language } from '../types';

export const languages: Language[] = [
  { code: 'auto', name: '自动检测', nativeName: 'Auto Detect' },
  { code: 'zh', name: '中文', nativeName: 'Chinese' },
  { code: 'en', name: '英语', nativeName: 'English' },
  { code: 'ja', name: '日语', nativeName: 'Japanese' },
  { code: 'ko', name: '韩语', nativeName: 'Korean' },
  { code: 'fr', name: '法语', nativeName: 'French' },
  { code: 'de', name: '德语', nativeName: 'German' },
  { code: 'es', name: '西班牙语', nativeName: 'Spanish' },
  { code: 'ru', name: '俄语', nativeName: 'Russian' },
  { code: 'pt', name: '葡萄牙语', nativeName: 'Portuguese' },
  { code: 'it', name: '意大利语', nativeName: 'Italian' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'Arabic' },
  { code: 'th', name: '泰语', nativeName: 'Thai' },
  { code: 'vi', name: '越南语', nativeName: 'Vietnamese' },
  { code: 'nl', name: '荷兰语', nativeName: 'Dutch' },
  { code: 'pl', name: '波兰语', nativeName: 'Polish' },
  { code: 'sv', name: '瑞典语', nativeName: 'Swedish' },
  { code: 'da', name: '丹麦语', nativeName: 'Danish' },
  { code: 'fi', name: '芬兰语', nativeName: 'Finnish' },
  { code: 'nb', name: '挪威语', nativeName: 'Norwegian' },
];

export const getLanguageName = (code: string): string => {
  const lang = languages.find(l => l.code === code);
  return lang ? lang.name : code;
};

export const getLanguageFlag = (code: string): string => {
  const flags: Record<string, string> = {
    'zh': '🇨🇳',
    'en': '🇺🇸',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'ru': '🇷🇺',
    'pt': '🇵🇹',
    'it': '🇮🇹',
    'ar': '🇸🇦',
    'th': '🇹🇭',
    'vi': '🇻🇳',
    'nl': '🇳🇱',
    'pl': '🇵🇱',
    'sv': '🇸🇪',
    'da': '🇩🇰',
    'fi': '🇫🇮',
    'nb': '🇳🇴',
  };
  return flags[code] || '🌐';
};
