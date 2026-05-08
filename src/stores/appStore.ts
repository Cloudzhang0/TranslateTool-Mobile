import { create } from 'zustand';
import { AppState, InputType, TranslationStyle, TranslationRecord, SpeechRate } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>((set) => ({
  input: {
    type: 'text',
    text: '',
    sourceLang: null,
    isDetecting: false,
    imageUrl: null,
    documentFile: null,
    websiteUrl: '',
    isRecording: false,
  },
  output: {
    targetLang: 'en',
    style: 'standard',
    translatedText: '',
    isTranslating: false,
  },
  history: {
    records: [],
    isOpen: false,
    searchQuery: '',
  },
  settings: {
    isOpen: false,
    speechRate: 'normal',
  },
  ui: {
    isLoading: false,
    error: null,
    theme: 'light',
    isSpeaking: false,
    copySuccess: false,
  },

  setInputType: (type: InputType) => set((state) => ({
    input: { ...state.input, type }
  })),

  setInputText: (text: string) => set((state) => ({
    input: { ...state.input, text }
  })),

  setSourceLang: (lang: string | null) => set((state) => ({
    input: { ...state.input, sourceLang: lang }
  })),

  setIsDetecting: (isDetecting: boolean) => set((state) => ({
    input: { ...state.input, isDetecting }
  })),

  setImageUrl: (url: string | null) => set((state) => ({
    input: { ...state.input, imageUrl: url }
  })),

  setDocumentFile: (file: File | null) => set((state) => ({
    input: { ...state.input, documentFile: file }
  })),

  setWebsiteUrl: (url: string) => set((state) => ({
    input: { ...state.input, websiteUrl: url }
  })),

  setIsRecording: (isRecording: boolean) => set((state) => ({
    input: { ...state.input, isRecording }
  })),

  setTargetLang: (lang: string) => set((state) => ({
    output: { ...state.output, targetLang: lang }
  })),

  setStyle: (style: TranslationStyle) => set((state) => ({
    output: { ...state.output, style }
  })),

  setTranslatedText: (text: string) => set((state) => ({
    output: { ...state.output, translatedText: text }
  })),

  setIsTranslating: (isTranslating: boolean) => set((state) => ({
    output: { ...state.output, isTranslating }
  })),

  setHistoryOpen: (isOpen: boolean) => set((state) => ({
    history: { ...state.history, isOpen }
  })),

  setHistorySearchQuery: (query: string) => set((state) => ({
    history: { ...state.history, searchQuery: query }
  })),

  setSettingsOpen: (isOpen: boolean) => set((state) => ({
    settings: { ...state.settings, isOpen }
  })),

  setSpeechRate: (rate: SpeechRate) => set((state) => ({
    settings: { ...state.settings, speechRate: rate }
  })),

  addHistoryRecord: (record: Omit<TranslationRecord, 'id' | 'timestamp' | 'isFavorite'>) => {
    const newRecord: TranslationRecord = {
      ...record,
      id: generateId(),
      timestamp: Date.now(),
      isFavorite: false,
    };
    set((state) => {
      const records = [newRecord, ...state.history.records].slice(0, 100);
      localStorage.setItem('translationHistory', JSON.stringify(records));
      return { history: { ...state.history, records } };
    });
  },

  removeHistoryRecord: (id: string) => set((state) => {
    const records = state.history.records.filter(r => r.id !== id);
    localStorage.setItem('translationHistory', JSON.stringify(records));
    return { history: { ...state.history, records } };
  }),

  toggleFavorite: (id: string) => set((state) => {
    const records = state.history.records.map(r =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    localStorage.setItem('translationHistory', JSON.stringify(records));
    return { history: { ...state.history, records } };
  }),

  clearHistory: () => set((state) => {
    localStorage.removeItem('translationHistory');
    return { history: { ...state.history, records: [] } };
  }),

  loadHistory: () => {
    const saved = localStorage.getItem('translationHistory');
    if (saved) {
      try {
        const records = JSON.parse(saved);
        set((state) => ({ history: { ...state.history, records } }));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  },

  setIsLoading: (isLoading: boolean) => set((state) => ({
    ui: { ...state.ui, isLoading }
  })),

  setError: (error: string | null) => set((state) => ({
    ui: { ...state.ui, error }
  })),

  setTheme: (theme: 'light' | 'dark') => set((state) => ({
    ui: { ...state.ui, theme }
  })),

  setIsSpeaking: (isSpeaking: boolean) => set((state) => ({
    ui: { ...state.ui, isSpeaking }
  })),

  setCopySuccess: (copySuccess: boolean) => set((state) => ({
    ui: { ...state.ui, copySuccess }
  })),
}));
