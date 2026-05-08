import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { InputType } from '../../types';
import { Type, Image, FileText, Globe, Mic } from 'lucide-react';

const features: { type: InputType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: '文字', icon: <Type className="w-5 h-5" /> },
  { type: 'image', label: '图片', icon: <Image className="w-5 h-5" /> },
  { type: 'document', label: '文档', icon: <FileText className="w-5 h-5" /> },
  { type: 'website', label: '网站', icon: <Globe className="w-5 h-5" /> },
  { type: 'voice', label: '语音', icon: <Mic className="w-5 h-5" /> },
];

export const FeatureBar: React.FC = () => {
  const inputType = useAppStore((s) => s.input.type);
  const setInputType = useAppStore((s) => s.setInputType);

  return (
    <div className="h-14 flex items-center border-t border-[#DADCE0] bg-white">
      <div className="flex items-center justify-around translate-container">
        {features.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setInputType(type)}
            className={`flex flex-col items-center gap-0.5 py-1 px-4 transition-colors ${
              inputType === type
                ? 'text-[#1A73E8]'
                : 'text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            {icon}
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
