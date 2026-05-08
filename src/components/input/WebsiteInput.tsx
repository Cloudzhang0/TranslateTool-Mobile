import React, { useCallback, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { extractWebsiteContent, isValidUrl } from '../../services/website';
import { Loader2, ExternalLink } from 'lucide-react';

export const WebsiteInput: React.FC = () => {
  const inputText = useAppStore((s) => s.input.text);
  const websiteUrl = useAppStore((s) => s.input.websiteUrl);
  const setInputText = useAppStore((s) => s.setInputText);
  const setWebsiteUrl = useAppStore((s) => s.setWebsiteUrl);
  const setError = useAppStore((s) => s.setError);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTitle, setExtractedTitle] = useState<string | null>(null);

  const handleExtract = useCallback(async () => {
    const url = websiteUrl.trim();
    if (!url) { setError('请输入网址'); return; }
    if (!isValidUrl(url)) { setError('请输入有效的网址（以 http:// 或 https:// 开头）'); return; }
    setIsExtracting(true);
    setError(null);
    try {
      const result = await extractWebsiteContent(url);
      if (result.success && result.data) {
        setInputText(result.data.content);
        setExtractedTitle(result.data.title);
      } else {
        setError(result.error || '网页抓取失败');
      }
    } catch {
      setError('网页抓取失败，请检查网址');
    } finally {
      setIsExtracting(false);
    }
  }, [websiteUrl, setInputText, setError]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#202124] mb-2">输入网址</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-4 py-2 border border-[#DADCE0] rounded-lg bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !websiteUrl.trim()}
            className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            提取内容
          </button>
        </div>
      </div>

      {extractedTitle && (
        <div className="mb-4 p-3 bg-[#E6F4EA] border border-[#CEEADE] rounded-lg">
          <p className="text-sm text-[#137333]">
            已提取：<strong>{extractedTitle}</strong>
          </p>
        </div>
      )}

      {inputText && (
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#202124] mb-2">提取的文本内容</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 p-3 text-sm border border-[#DADCE0] rounded-lg bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] resize-none"
            placeholder="网页内容将显示在这里..."
          />
        </div>
      )}
    </div>
  );
};
