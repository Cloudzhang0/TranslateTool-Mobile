import React, { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { parseTxtFile, parseDocxFile, parsePdfFile } from '../../services/document';
import { Upload, FileText, Loader2, X } from 'lucide-react';

export const DocumentInput: React.FC = () => {
  const inputText = useAppStore((s) => s.input.text);
  const setInputText = useAppStore((s) => s.setInputText);
  const setDocumentFile = useAppStore((s) => s.setDocumentFile);
  const setError = useAppStore((s) => s.setError);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.match(/\.(txt|docx|pdf)$/i)) {
      setError('支持的文件格式：.txt、.docx、.pdf');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      return;
    }
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setDocumentFile(file);
    setIsProcessing(true);
    setError(null);
    try {
      let text = '';
      if (file.name.endsWith('.txt')) text = await parseTxtFile(file);
      else if (file.name.endsWith('.docx')) text = await parseDocxFile(file);
      else if (file.name.endsWith('.pdf')) text = await parsePdfFile(file);
      else throw new Error('不支持的文件格式');
      setInputText(text);
    } catch (error) {
      setError(error instanceof Error ? error.message : '文档解析失败');
    } finally {
      setIsProcessing(false);
    }
  }, [setInputText, setDocumentFile, setError]);

  const handleClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setFileName(null);
    setFileSize(null);
    setDocumentFile(null);
    setInputText('');
  }, [setFileName, setFileSize, setDocumentFile, setInputText]);

  return (
    <div className="h-full flex flex-col">
      {fileName ? (
        <div className="mb-4">
          <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#DADCE0]">
            <FileText className="w-8 h-8 text-[#1A73E8]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#202124]">{fileName}</p>
              <p className="text-xs text-[#5F6368]">{fileSize}</p>
            </div>
            <button onClick={handleRemove} className="p-1 rounded hover:bg-[#DADCE0] transition-colors">
              <X className="w-4 h-4 text-[#5F6368]" />
            </button>
          </div>
          <div className="mt-3">
            <label className="text-sm text-[#5F6368] mb-1 block">提取的文本内容：</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-3 text-sm border border-[#DADCE0] rounded-lg bg-white text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] resize-none"
              placeholder="文档内容将显示在这里..."
            />
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex-1 min-h-[200px] border-2 border-dashed border-[#DADCE0] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1A73E8] transition-colors"
        >
          <Upload className="w-12 h-12 text-[#80868B] mb-4" />
          <p className="text-[#5F6368] mb-2">点击上传文档</p>
          <p className="text-sm text-[#80868B]">支持 .txt、.docx、.pdf 格式，最大 10MB</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".txt,.docx,.pdf" onChange={handleFileChange} className="hidden" />

      {isProcessing && (
        <div className="flex items-center gap-2 mt-4 text-[#1A73E8]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>正在解析文档...</span>
        </div>
      )}
    </div>
  );
};
