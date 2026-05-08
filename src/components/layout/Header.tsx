import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Clock, Settings, ChevronDown } from 'lucide-react';
import { TranslationStyle, SpeechRate } from '../../types';

const styleOptions: { value: TranslationStyle; label: string }[] = [
  { value: 'standard', label: '标准' },
  { value: 'casual', label: '口语' },
  { value: 'formal', label: '正式' },
];

const rateOptions: { value: SpeechRate; label: string }[] = [
  { value: 'slow', label: '慢速' },
  { value: 'normal', label: '正常' },
  { value: 'fast', label: '快速' },
];

export const Header: React.FC = () => {
  const setHistoryOpen = useAppStore((s) => s.setHistoryOpen);
  const settingsOpen = useAppStore((s) => s.settings.isOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const speechRate = useAppStore((s) => s.settings.speechRate);
  const setSpeechRate = useAppStore((s) => s.setSpeechRate);
  const style = useAppStore((s) => s.output.style);
  const setStyle = useAppStore((s) => s.setStyle);

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen, setSettingsOpen]);

  return (
    <header
      className="sticky top-0 z-50 bg-white h-12 flex items-center px-4"
      style={{ boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)' }}
    >
      <div className="flex items-center justify-between translate-container">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="翻译" className="w-6 h-6" />
          <h1 className="text-xl font-medium text-[#202124]">个人翻译工具</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors"
            title="翻译历史"
          >
            <Clock className="w-5 h-5 text-[#5F6368]" />
          </button>

          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-full hover:bg-[#F1F3F4] transition-colors"
              title="设置"
            >
              <Settings className="w-5 h-5 text-[#5F6368]" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#DADCE0] rounded-lg shadow-md py-2 z-50">
                <div className="px-4 py-2 text-sm text-[#1A73E8] font-semibold uppercase tracking-wide bg-[#E8F0FE]">翻译风格</div>
                {styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStyle(opt.value); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F1F3F4] transition-colors ${
                      style === opt.value ? 'text-[#1A73E8] font-medium' : 'text-[#202124]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                <div className="border-t border-[#DADCE0] my-1" />

                <div className="px-4 py-2 text-sm text-[#1A73E8] font-semibold uppercase tracking-wide bg-[#E8F0FE]">朗读语速</div>
                {rateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSpeechRate(opt.value); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F1F3F4] transition-colors ${
                      speechRate === opt.value ? 'text-[#1A73E8] font-medium' : 'text-[#202124]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
