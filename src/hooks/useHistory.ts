import { useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { TranslationRecord } from '../types';

export const useHistory = () => {
  const history = useAppStore((state) => state.history);

  useEffect(() => {
    useAppStore.getState().loadHistory();
  }, []);

  const toggleHistory = useCallback(() => {
    useAppStore.getState().setHistoryOpen(!useAppStore.getState().history.isOpen);
  }, []);

  const selectRecord = useCallback((record: TranslationRecord) => {
    const store = useAppStore.getState();
    store.setInputText(record.sourceText);
    store.setSourceLang(record.sourceLang);
    store.setTargetLang(record.targetLang);
    store.setStyle(record.style);
    store.setHistoryOpen(false);
  }, []);

  const deleteRecord = useCallback((id: string) => {
    useAppStore.getState().removeHistoryRecord(id);
  }, []);

  const toggleFavoriteRecord = useCallback((id: string) => {
    useAppStore.getState().toggleFavorite(id);
  }, []);

  const clearAllHistory = useCallback(() => {
    useAppStore.getState().clearHistory();
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    useAppStore.getState().setHistorySearchQuery(query);
  }, []);

  const filteredRecords = history.searchQuery
    ? history.records.filter(
        (r) =>
          r.sourceText.toLowerCase().includes(history.searchQuery.toLowerCase()) ||
          r.translatedText.toLowerCase().includes(history.searchQuery.toLowerCase())
      )
    : history.records;

  return {
    records: filteredRecords,
    isOpen: history.isOpen,
    searchQuery: history.searchQuery,
    toggleHistory,
    selectRecord,
    deleteRecord,
    toggleFavoriteRecord,
    clearAllHistory,
    setSearchQuery,
  };
};
