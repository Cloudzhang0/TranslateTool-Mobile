import React, { useRef, useEffect } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { getLanguageName, getLanguageFlag } from '../../utils/language';
import { X, Star, Trash2, Clock } from 'lucide-react';

export const HistoryPanel: React.FC = () => {
  const {
    records,
    isOpen,
    searchQuery,
    toggleHistory,
    selectRecord,
    deleteRecord,
    toggleFavoriteRecord,
    clearAllHistory,
    setSearchQuery,
  } = useHistory();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) toggleHistory();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, toggleHistory]);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={toggleHistory} />
      )}

      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#DADCE0]">
            <h3 className="text-lg font-medium text-[#202124]">翻译历史</h3>
            <button onClick={toggleHistory} className="p-1 rounded hover:bg-[#F1F3F4] transition-colors">
              <X className="w-5 h-5 text-[#5F6368]" />
            </button>
          </div>

          <div className="px-4 py-2 border-b border-[#DADCE0]">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索历史记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#DADCE0] rounded-lg bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#80868B]">
                <Clock className="w-12 h-12 mb-2" />
                <p>暂无翻译历史</p>
              </div>
            ) : (
              <div className="divide-y divide-[#DADCE0]">
                {records.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => selectRecord(record)}
                    className="px-4 py-3 hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs text-[#5F6368]">
                        <span>{getLanguageFlag(record.sourceLang)}</span>
                        <span>{getLanguageName(record.sourceLang)}</span>
                        <span>→</span>
                        <span>{getLanguageFlag(record.targetLang)}</span>
                        <span>{getLanguageName(record.targetLang)}</span>
                      </div>
                      <span className="text-xs text-[#80868B]">{formatTime(record.timestamp)}</span>
                    </div>
                    <p className="text-sm text-[#202124] truncate mb-1">{record.sourceText}</p>
                    <p className="text-sm text-[#5F6368] truncate mb-2">{record.translatedText}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#F1F3F4] text-[#5F6368]">
                        {record.style === 'standard' ? '标准' : record.style === 'casual' ? '口语' : '正式'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavoriteRecord(record.id); }}
                          className="p-1 rounded hover:bg-[#DADCE0] transition-colors"
                        >
                          <Star className={`w-4 h-4 ${record.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-[#80868B]'}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }}
                          className="p-1 rounded hover:bg-[#DADCE0] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#80868B]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {records.length > 0 && (
            <div className="px-4 py-3 border-t border-[#DADCE0]">
              <button
                onClick={clearAllHistory}
                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空全部历史
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
