import { WebsiteExtractResponse } from '../types';

export async function extractWebsiteContent(url: string): Promise<WebsiteExtractResponse> {
  try {
    const response = await fetch('/api/website/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('网页抓取失败');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        title: data.title,
        content: data.content,
        author: data.author,
        publishDate: data.publishDate,
      },
    };
  } catch (error) {
    console.error('Website extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网页抓取失败，请检查URL',
    };
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
