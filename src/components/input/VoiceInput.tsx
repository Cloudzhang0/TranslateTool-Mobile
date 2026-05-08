import React, { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useSpeech } from '../../hooks/useSpeech';
import { Mic, MicOff } from 'lucide-react';

export const VoiceInput: React.FC = () => {
  const inputText = useAppStore((s) => s.input.text);
  const isRecording = useAppStore((s) => s.input.isRecording);
  const setInputText = useAppStore((s) => s.setInputText);
  const setError = useAppStore((s) => s.setError);
  const { toggleRecording } = useSpeech();

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const handleStartRecording = useCallback(() => {
    if (!isSupported) {
      setError('您的浏览器不支持语音识别功能');
      return;
    }
    toggleRecording();
  }, [isSupported, toggleRecording, setError]);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {!isSupported ? (
        <div className="text-center">
          <MicOff className="w-16 h-16 text-[#80868B] mx-auto mb-4" />
          <p className="text-[#5F6368] mb-2">浏览器不支持语音识别</p>
          <p className="text-sm text-[#80868B]">请使用 Chrome 或 Edge 浏览器</p>
        </div>
      ) : (
        <>
          <button
            onClick={handleStartRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-[#1A73E8] hover:bg-[#1557B0]'
            }`}
          >
            {isRecording ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
          </button>
          <p className="mt-4 text-[#5F6368]">
            {isRecording ? '录音中...点击停止' : '点击开始录音'}
          </p>
          {isRecording && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-500">正在录音</span>
            </div>
          )}
          {inputText && (
            <div className="mt-6 w-full max-w-md">
              <label className="block text-sm font-medium text-[#202124] mb-2">识别结果</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-32 p-3 text-sm border border-[#DADCE0] rounded-lg bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] resize-none"
                placeholder="语音识别结果将显示在这里..."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
