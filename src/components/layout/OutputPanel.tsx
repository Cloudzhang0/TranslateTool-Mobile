import React, { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useSpeech } from '../../hooks/useSpeech';
import { Volume2, Copy, Check, Loader2 } from 'lucide-react';

export const OutputPanel: React.FC = () => {
  const translatedText = useAppStore((s) => s.output.translatedText);
  const isTranslating = useAppStore((s) => s.output.isTranslating);
  const ui = useAppStore((s) => s.ui);
  const setCopySuccess = useAppStore((s) => s.setCopySuccess);
  const { speakTarget } = useSpeech();

  const handleCopy = useCallback(async () => {
    if (translatedText.trim()) {
      try {
        await navigator.clipboard.writeText(translatedText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1500);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  }, [translatedText, setCopySuccess]);

  return (
    <div className="flex flex-col h-[35vh] lg:h-auto lg:flex-1 lg:min-h-[400px] lg:border-l border-[#DADCE0] relative bg-[#F8F9FA]">
      {/* 翻译结果区 */}
      <div className="flex-1 px-4 py-2 flex flex-col overflow-auto">
        {isTranslating ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-[154px] h-[154px] text-[#1A73E8] animate-spin" strokeWidth={3} />
          </div>
        ) : translatedText ? (
          <div className="text-base text-[#202124] whitespace-pre-wrap leading-6">
            {translatedText}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#80868B] text-[42px] select-none">
            翻译
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-[#DADCE0]">
        <button
          onClick={speakTarget}
          disabled={!translatedText.trim() || ui.isSpeaking}
          className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="发音"
        >
          {ui.isSpeaking ? (
            <div className="sound-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          ) : (
            <Volume2 className="w-5 h-5 text-[#5F6368]" />
          )}
        </button>
        <button
          onClick={handleCopy}
          disabled={!translatedText.trim()}
          className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="复制"
        >
          {ui.copySuccess ? (
            <Check className="w-5 h-5 text-[#1A73E8]" />
          ) : (
            <Copy className="w-5 h-5 text-[#5F6368]" />
          )}
        </button>
      </div>
    </div>
  );
};
