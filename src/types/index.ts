export type InputType = 'text' | 'image' | 'document' | 'website' | 'voice';
export type TranslationStyle = 'standard' | 'casual' | 'formal';

export interface TranslationRecord {
  id: string;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  style: TranslationStyle;
  translatedText: string;
  inputType: InputType;
  timestamp: number;
  isFavorite: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationRequest {
  text: string;
  sourceLang?: string;
  targetLang: string;
  style: TranslationStyle;
}

export interface TranslationResponse {
  success: boolean;
  data?: {
    sourceLang: string;
    targetLang: string;
    style: TranslationStyle;
    translatedText: string;
    cached: boolean;
  };
  error?: string;
}

export interface OCRResponse {
  success: boolean;
  data?: {
    text: string;
    confidence: number;
    language: string;
  };
  error?: string;
}

export interface DocumentParseResponse {
  success: boolean;
  data?: {
    text: string;
    pages: number;
    wordCount: number;
  };
  error?: string;
}

export interface WebsiteExtractResponse {
  success: boolean;
  data?: {
    title: string;
    content: string;
    author?: string;
    publishDate?: string;
  };
  error?: string;
}

export interface LanguageDetectResponse {
  success: boolean;
  data?: {
    language: string;
    languageName: string;
    confidence: number;
  };
  error?: string;
}

export type SpeechRate = 'slow' | 'normal' | 'fast';

export interface AppState {
  input: {
    type: InputType;
    text: string;
    sourceLang: string | null;
    isDetecting: boolean;
    imageUrl: string | null;
    documentFile: File | null;
    websiteUrl: string;
    isRecording: boolean;
  };
  output: {
    targetLang: string;
    style: TranslationStyle;
    translatedText: string;
    isTranslating: boolean;
  };
  history: {
    records: TranslationRecord[];
    isOpen: boolean;
    searchQuery: string;
  };
  settings: {
    isOpen: boolean;
    speechRate: SpeechRate;
  };
  ui: {
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
    isSpeaking: boolean;
    copySuccess: boolean;
  };

  // Actions
  setInputType: (type: InputType) => void;
  setInputText: (text: string) => void;
  setSourceLang: (lang: string | null) => void;
  setIsDetecting: (isDetecting: boolean) => void;
  setImageUrl: (url: string | null) => void;
  setDocumentFile: (file: File | null) => void;
  setWebsiteUrl: (url: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setTargetLang: (lang: string) => void;
  setStyle: (style: TranslationStyle) => void;
  setTranslatedText: (text: string) => void;
  setIsTranslating: (isTranslating: boolean) => void;
  setHistoryOpen: (isOpen: boolean) => void;
  setHistorySearchQuery: (query: string) => void;
  addHistoryRecord: (record: Omit<TranslationRecord, 'id' | 'timestamp' | 'isFavorite'>) => void;
  removeHistoryRecord: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  loadHistory: () => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setSpeechRate: (rate: SpeechRate) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setCopySuccess: (copySuccess: boolean) => void;
}
