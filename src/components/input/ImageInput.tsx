import React, { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { performOCR } from '../../services/ocr';
import { Upload, Camera, Loader2, X } from 'lucide-react';

export const ImageInput: React.FC = () => {
  const setInputText = useAppStore((s) => s.setInputText);
  const setImageUrl = useAppStore((s) => s.setImageUrl);
  const setError = useAppStore((s) => s.setError);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setImageUrl(url);
    setIsProcessing(true);
    setError(null);
    try {
      const result = await performOCR(file);
      if (result.success && result.data) {
        setInputText(result.data.text);
      } else {
        setError(result.error || '图片识别失败');
      }
    } catch {
      setError('图片识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [setInputText, setImageUrl, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setImageUrl(null);
    setInputText('');
  }, [setPreview, setImageUrl, setInputText]);

  const handleScreenshot = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      stream.getTracks().forEach(track => track.stop());
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'screenshot.png', { type: 'image/png' });
          await handleFileSelect(file);
        }
      }, 'image/png');
    } catch {
      setError('截图失败，请重试');
    }
  }, [handleFileSelect, setError]);

  return (
    <div className="h-full flex flex-col">
      {preview ? (
        <div className="relative mb-4">
          <img src={preview} alt="Preview" className="max-h-48 object-contain rounded-lg border border-[#DADCE0]" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-[#F1F3F4] transition-colors"
          >
            <X className="w-4 h-4 text-[#5F6368]" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
          className="flex-1 min-h-[200px] border-2 border-dashed border-[#DADCE0] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1A73E8] transition-colors"
        >
          <Upload className="w-12 h-12 text-[#80868B] mb-4" />
          <p className="text-[#5F6368] mb-2">拖拽图片到此处，或点击上传</p>
          <p className="text-sm text-[#80868B]">支持 JPG、PNG、WebP 格式，最大 10MB</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors"
        >
          <Upload className="w-4 h-4" />
          上传图片
        </button>
        <button
          onClick={handleScreenshot}
          className="flex items-center gap-2 px-4 py-2 bg-[#F1F3F4] text-[#202124] rounded-lg hover:bg-[#DADCE0] transition-colors"
        >
          <Camera className="w-4 h-4" />
          截图
        </button>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 mt-4 text-[#1A73E8]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>正在识别图片文字...</span>
        </div>
      )}
    </div>
  );
};
