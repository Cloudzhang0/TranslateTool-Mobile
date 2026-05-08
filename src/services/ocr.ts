import { OCRResponse } from '../types';

export async function performOCR(imageFile: File): Promise<OCRResponse> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('OCR请求失败');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        text: data.text,
        confidence: data.confidence,
        language: data.language,
      },
    };
  } catch (error) {
    console.error('OCR error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片识别失败，请重试',
    };
  }
}

export async function performOCRWithBase64(base64Image: string): Promise<OCRResponse> {
  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error('OCR请求失败');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        text: data.text,
        confidence: data.confidence,
        language: data.language,
      },
    };
  } catch (error) {
    console.error('OCR error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片识别失败，请重试',
    };
  }
}
