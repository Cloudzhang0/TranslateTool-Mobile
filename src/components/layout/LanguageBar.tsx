import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { languages, getLanguageName } from '../../utils/language';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';

export const LanguageBar: React.FC = () => {
  const sourceLang = useAppStore((s) => s.input.sourceLang);
  const targetLang = useAppStore((s) => s.output.targetLang);
  const setSourceLang = useAppStore((s) => s.setSourceLang);
  const setTargetLang = useAppStore((s) => s.setTargetLang);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleSwap = useCallback(() => {
    if (sourceLang && sourceLang !== 'auto') {
      const prevSource = sourceLang;
      const prevTarget = targetLang;
      setSourceLang(prevTarget);
      setTargetLang(prevSource);
    }
  }, [sourceLang, targetLang, setSourceLang, setTargetLang]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setSourceOpen(false);
      }
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) {
        setTargetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sourceLabel = sourceLang ? getLanguageName(sourceLang) : '检测语言';
  const targetLabel = getLanguageName(targetLang);

  const sourceLanguages = languages;
  const targetLanguages = languages.filter((l) => l.code !== 'auto');

  return (
    <div className="h-12 flex items-center border-b border-[#DADCE0] bg-white">
      <div className="flex items-center justify-center translate-container">
        {/* 源语言 */}
        <div ref={sourceRef} className="relative">
          <button
            onClick={() => { setSourceOpen(!sourceOpen); setTargetOpen(false); }}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              sourceOpen ? 'bg-[#F1F3F4]' : 'hover:bg-[#F1F3F4]'
            } ${sourceLang ? 'text-[#202124]' : 'text-[#1A73E8]'}`}
          >
            {sourceLabel}
            <ChevronDown className="w-4 h-4 text-[#5F6368]" />
          </button>
          {sourceOpen && (
            <div className="absolute top-full left-0 mt-1 min-w-[180px] max-h-64 overflow-y-auto bg-white border border-[#DADCE0] rounded-lg shadow-md py-1 z-50">
              {sourceLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSourceLang(lang.code === 'auto' ? null : lang.code);
                    setSourceOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#F1F3F4] ${
                    (lang.code === 'auto' && !sourceLang) || lang.code === sourceLang
                      ? 'text-[#1A73E8] font-medium'
                      : 'text-[#202124]'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 交换按钮 */}
        <button
          onClick={handleSwap}
          className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors mx-2 flex-shrink-0"
          title="交换语言"
        >
          <ArrowLeftRight className="w-4 h-4 text-[#5F6368]" />
        </button>

        {/* 目标语言 */}
        <div ref={targetRef} className="relative">
          <button
            onClick={() => { setTargetOpen(!targetOpen); setSourceOpen(false); }}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              targetOpen ? 'bg-[#F1F3F4]' : 'hover:bg-[#F1F3F4]'
            } text-[#1A73E8]`}
          >
            {targetLabel}
            <ChevronDown className="w-4 h-4 text-[#5F6368]" />
          </button>
          {targetOpen && (
            <div className="absolute top-full left-0 mt-1 min-w-[180px] max-h-64 overflow-y-auto bg-white border border-[#DADCE0] rounded-lg shadow-md py-1 z-50">
              {targetLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setTargetLang(lang.code);
                    setTargetOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[#F1F3F4] ${
                    lang.code === targetLang
                      ? 'text-[#1A73E8] font-medium'
                      : 'text-[#202124]'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
