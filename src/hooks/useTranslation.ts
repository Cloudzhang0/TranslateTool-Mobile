import { useCallback, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { translateText, detectLanguage } from '../services/translation';
import { debounce } from '../utils/debounce';

export const useTranslation = () => {
  const isTranslatingRef = useRef(false);

  const performTranslation = useCallback(async () => {
    const { input, output, setIsTranslating, setTranslatedText, setError, addHistoryRecord } = useAppStore.getState();

    if (!input.text.trim() || isTranslatingRef.current) {
      return;
    }

    isTranslatingRef.current = true;
    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateText({
        text: input.text,
        sourceLang: input.sourceLang || undefined,
        targetLang: output.targetLang,
        style: output.style,
      });

      if (result.success && result.data) {
        setTranslatedText(result.data.translatedText);
        addHistoryRecord({
          sourceText: input.text.substring(0, 500),
          sourceLang: result.data.sourceLang,
          targetLang: output.targetLang,
          style: output.style,
          translatedText: result.data.translatedText,
          inputType: input.type,
        });
      } else {
        setError(result.error || '翻译失败');
      }
    } catch (error) {
      setError('翻译请求失败，请重试');
    } finally {
      isTranslatingRef.current = false;
      setIsTranslating(false);
    }
  }, []);

  const debouncedTranslate = useCallback(
    debounce(performTranslation, 500),
    [performTranslation]
  );

  const handleDetectLanguage = useCallback(async (text: string) => {
    if (!text.trim()) {
      useAppStore.getState().setSourceLang(null);
      return;
    }

    useAppStore.getState().setIsDetecting(true);
    try {
      const result = await detectLanguage(text);
      if (result.language !== 'auto') {
        useAppStore.getState().setSourceLang(result.language);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    } finally {
      useAppStore.getState().setIsDetecting(false);
    }
  }, []);

  const triggerTranslation = useCallback(() => {
    const { input } = useAppStore.getState();
    if (input.text.trim()) {
      handleDetectLanguage(input.text);
      debouncedTranslate();
    }
  }, [handleDetectLanguage, debouncedTranslate]);

  return {
    translate: performTranslation,
    detectLanguage: handleDetectLanguage,
    triggerTranslation,
  };
};
