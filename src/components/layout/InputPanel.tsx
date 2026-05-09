import React, { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { TextInput } from '../input/TextInput';
import { ImageInput } from '../input/ImageInput';
import { DocumentInput } from '../input/DocumentInput';
import { WebsiteInput } from '../input/WebsiteInput';
import { useSpeech } from '../../hooks/useSpeech';
import { Volume2, Copy, Check } from 'lucide-react';

export const InputPanel: React.FC = () => {
  const inputType = useAppStore((s) => s.input.type);
  const inputText = useAppStore((s) => s.input.text);
  const ui = useAppStore((s) => s.ui);
  const setCopySuccess = useAppStore((s) => s.setCopySuccess);
  const { speakSource } = useSpeech();

  const handleCopy = useCallback(async () => {
    if (inputText.trim()) {
      try {
        await navigator.clipboard.writeText(inputText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1500);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  }, [inputText, setCopySuccess]);

  const renderInputComponent = () => {
    switch (inputType) {
      case 'image': return <ImageInput />;
      case 'document': return <DocumentInput />;
      case 'website': return <WebsiteInput />;
      default: return <TextInput />;
    }
  };

  return (
    <div className="flex flex-col h-[23vh] lg:h-auto lg:flex-1 lg:min-h-[400px]">
      {/* 输入内容区 */}
      <div className="flex-1 overflow-auto px-4 py-2">
        {renderInputComponent()}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#DADCE0]">
        <div className="flex items-center gap-1">
          <button
            onClick={speakSource}
            disabled={!inputText.trim() || ui.isSpeaking}
            className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="朗读原始文本"
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
            disabled={!inputText.trim()}
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
    </div>
  );
};
