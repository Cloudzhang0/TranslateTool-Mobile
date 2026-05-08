import React, { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';

export const TextInput: React.FC = () => {
  const text = useAppStore((state) => state.input.text);
  const setInputText = useAppStore((state) => state.setInputText);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  }, [setInputText]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    setInputText(pastedText);
  }, [setInputText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      <textarea
        value={text}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder="输入要翻译的文本..."
        className="flex-1 min-h-[200px] w-full resize-none border-0 outline-none bg-transparent text-base leading-relaxed"
        style={{ fontSize: '16px', color: '#202124' }}
      />
    </div>
  );
};
