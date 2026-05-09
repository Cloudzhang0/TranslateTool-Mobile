import { useCallback, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { speakText } from '../services/translation';

const SPEECH_ERROR_MSGS: Record<string, string> = {
  'not-allowed': '请允许麦克风权限后重试',
  'no-speech': '未检测到语音，请靠近麦克风重试',
  'audio-capture': '无法捕获音频，请检查麦克风设备',
  'network': '语音服务网络错误，请检查网络连接',
  'service-not-allowed': '当前浏览器不支持语音服务，请使用 Chrome 浏览器',
  'language-not-supported': '不支持当前语言的语音识别',
  'aborted': '语音识别已取消',
};

export const useSpeech = () => {
  const recognitionRef = useRef<any>(null);

  const speak = useCallback(async (text: string, lang: string) => {
    if (!text.trim()) return;

    if (!('speechSynthesis' in window)) {
      useAppStore.getState().setError('当前浏览器不支持语音播放，请使用 Chrome 或 Edge 浏览器');
      return;
    }

    const { settings } = useAppStore.getState();
    useAppStore.getState().setIsSpeaking(true);
    try {
      await speakText(text, lang, settings.speechRate);
    } catch (error) {
      console.error('Speech error:', error);
      useAppStore.getState().setError('语音播放失败，请使用 Chrome 或 Edge 浏览器');
    } finally {
      useAppStore.getState().setIsSpeaking(false);
    }
  }, []);

  const speakSource = useCallback(() => {
    const { input } = useAppStore.getState();
    if (input.text.trim()) {
      speak(input.text, input.sourceLang || 'en');
    }
  }, [speak]);

  const speakTarget = useCallback(() => {
    const { output } = useAppStore.getState();
    if (output.translatedText.trim()) {
      speak(output.translatedText, output.targetLang);
    }
  }, [speak]);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      useAppStore.getState().setError('当前浏览器不支持语音识别，请使用 Chrome 浏览器');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const currentText = useAppStore.getState().input.text;
        useAppStore.getState().setInputText(currentText + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      const msg = SPEECH_ERROR_MSGS[event.error] || `语音识别错误: ${event.error}`;
      useAppStore.getState().setError(msg);
      useAppStore.getState().setIsRecording(false);
    };

    recognition.onend = () => {
      useAppStore.getState().setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    useAppStore.getState().setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    useAppStore.getState().setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    const { isRecording } = useAppStore.getState().input;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  return {
    speak,
    speakSource,
    speakTarget,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
