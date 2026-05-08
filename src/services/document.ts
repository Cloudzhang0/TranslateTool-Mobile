import { DocumentParseResponse } from '../types';

export async function parseDocument(file: File): Promise<DocumentParseResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/document/parse', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('文档解析失败');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        text: data.text,
        pages: data.pages,
        wordCount: data.wordCount,
      },
    };
  } catch (error) {
    console.error('Document parse error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文档解析失败，请重试',
    };
  }
}

export async function parseTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export async function parseDocxFile(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parse error:', error);
    throw new Error('DOCX文件解析失败');
  }
}

export async function parsePdfFile(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF parse error:', error);
    throw new Error('PDF文件解析失败');
  }
}
