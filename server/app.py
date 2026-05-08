"""
翻译工具 Flask 后端
替代原 Express.js 后端，使用 translators 库进行免费翻译
"""

import os
import re
import time
import logging
import concurrent.futures
from collections import OrderedDict

import translators as ts
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 翻译引擎配置，默认 google，可选 bing
TRANSLATOR_ENGINE = os.getenv('TRANSLATOR_ENGINE', 'bing')

# 语言名称映射
LANG_NAMES = {
    'zh': '中文', 'en': '英语', 'ja': '日语', 'ko': '韩语',
    'de': '德语', 'fr': '法语', 'es': '西班牙语', 'pt': '葡萄牙语',
    'ru': '俄语', 'ar': '阿拉伯语', 'it': '意大利语', 'nl': '荷兰语',
    'pl': '波兰语', 'tr': '土耳其语', 'vi': '越南语', 'th': '泰语',
    'id': '印尼语', 'uk': '乌克兰语', 'cs': '捷克语', 'da': '丹麦语',
    'el': '希腊语', 'et': '爱沙尼亚语', 'fi': '芬兰语', 'hu': '匈牙利语',
    'lt': '立陶宛语', 'lv': '拉脱维亚语', 'ro': '罗马尼亚语', 'sk': '斯洛伐克语',
    'sl': '斯洛文尼亚语', 'sv': '瑞典语', 'nb': '挪威语', 'bg': '保加利亚语',
}

# translators 库的语言代码映射（部分代码与前端不同）
LANG_CODE_MAP = {
    'nb': 'no',  # 挪威语：前端用 nb，translators 用 no
}


class TranslationCache:
    """FIFO 翻译缓存，最大 1000 条"""

    def __init__(self, max_size=1000):
        self._cache = OrderedDict()
        self._max_size = max_size

    def get(self, key):
        return self._cache.get(key)

    def set(self, key, value):
        if key in self._cache:
            self._cache.move_to_end(key)
        else:
            if len(self._cache) >= self._max_size:
                self._cache.popitem(last=False)
            self._cache[key] = value


cache = TranslationCache()


def detect_language(text):
    """基于正则的语言检测"""
    patterns = [
        (r'[一-鿿]', 'zh', '中文', 0.95),
        (r'[぀-ゟ゠-ヿ]', 'ja', '日语', 0.95),
        (r'[가-힯ᄀ-ᇿ]', 'ko', '韩语', 0.95),
        (r'[؀-ۿ]', 'ar', '阿拉伯语', 0.95),
        (r'[฀-๿]', 'th', '泰语', 0.95),
    ]
    for pattern, lang, name, conf in patterns:
        if re.search(pattern, text):
            return {'language': lang, 'languageName': name, 'confidence': conf}
    return {'language': 'en', 'languageName': '英语', 'confidence': 0.85}


def translate_text(text, source_lang, target_lang, style='standard'):
    """调用 translators 库进行翻译，含超时控制、自动重试和引擎切换"""
    # 映射语言代码
    src = LANG_CODE_MAP.get(source_lang, source_lang) if source_lang and source_lang != 'auto' else 'auto'
    tgt = LANG_CODE_MAP.get(target_lang, target_lang)

    # translators 库不支持 style，对于 casual/formal 在文本末尾附加提示
    # 这是一个 best-effort 的处理方式
    input_text = text
    if style == 'casual':
        input_text = f"{text}\n\n[请用口语化、轻松的风格翻译]"
    elif style == 'formal':
        input_text = f"{text}\n\n[请用正式、书面语的风格翻译]"

    # 尝试的引擎列表（alibaba 通常比 bing 快）
    engines = ['alibaba', 'google', TRANSLATOR_ENGINE, 'deepl']

    # 超时时间（秒）
    TIMEOUT = 8

    def _do_translate(engine):
        return ts.translate_text(
            input_text,
            translator=engine,
            from_language=src if src != 'auto' else 'auto',
            to_language=tgt,
        )

    last_error = None
    for engine in engines:
        for attempt in range(2):
            try:
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(_do_translate, engine)
                    result = future.result(timeout=TIMEOUT)

                if result and isinstance(result, str) and result.strip():
                    # 清理可能附带的风格提示文本
                    for marker in ['[请用口语化、轻松的风格翻译]', '[请用正式、书面语的风格翻译]']:
                        if marker in result:
                            result = result.replace(marker, '').strip()
                    # 记录成功使用的引擎
                    if engine != engines[0]:
                        logger.info(f"使用备用引擎 {engine} 成功")
                    return result
                else:
                    last_error = f"翻译结果为空 (engine: {engine})"
                    continue
            except concurrent.futures.TimeoutError:
                last_error = f"引擎 {engine} 超时 (>{TIMEOUT}s)"
                logger.warning(f"翻译引擎 {engine} 尝试 {attempt+1} 超时")
                continue
            except Exception as e:
                last_error = str(e)
                logger.warning(f"翻译引擎 {engine} 尝试 {attempt+1} 失败: {e}")
                continue
        if last_error is None:
            break

    raise Exception(last_error or "所有翻译引擎均失败")


@app.route('/api/detect', methods=['POST'])
def api_detect():
    data = request.get_json(silent=True)
    text = data.get('text', '') if data else ''
    if not text.strip():
        return jsonify({'error': '文本不能为空'}), 400
    return jsonify(detect_language(text))


@app.route('/api/translate', methods=['POST'])
def api_translate():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': '无效的请求'}), 400

    text = data.get('text', '')
    source_lang = data.get('source_lang', 'auto')
    target_lang = data.get('target_lang', 'en')
    style = data.get('style', 'standard')

    if not text.strip():
        return jsonify({'error': '文本不能为空'}), 400

    # 检查缓存
    cache_key = f"{text}_{source_lang}_{target_lang}_{style}"
    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify({
            'translated_text': cached,
            'source_lang': source_lang or 'auto',
            'cached': True,
        })

    try:
        translated = translate_text(text, source_lang, target_lang, style)
        cache.set(cache_key, translated)
        return jsonify({
            'translated_text': translated,
            'source_lang': source_lang or 'auto',
            'cached': False,
        })
    except Exception as e:
        return jsonify({'error': f'翻译失败: {str(e)}'}), 500


@app.route('/api/ocr', methods=['POST'])
def api_ocr():
    if 'image' not in request.files and 'image' not in request.form:
        return jsonify({'error': '请上传图片'}), 400

    # 模拟 OCR（与原 Express 后端一致）
    return jsonify({
        'text': '这是一段从图片中识别出的文字。\nThis is text recognized from the image.',
        'confidence': 0.95,
        'language': 'zh',
    })


@app.route('/api/document/parse', methods=['POST'])
def api_document_parse():
    if 'file' not in request.files:
        return jsonify({'error': '请上传文件'}), 400

    f = request.files['file']
    filename = f.filename or 'unknown'
    try:
        content = f.read().decode('utf-8', errors='replace')
    except Exception:
        content = ''

    return jsonify({
        'text': content or f'文档内容提取自: {filename}',
        'pages': 1,
        'wordCount': len(content.split()) if content else 0,
    })


@app.route('/api/website/extract', methods=['POST'])
def api_website_extract():
    data = request.get_json(silent=True)
    url = data.get('url', '') if data else ''

    if not url:
        return jsonify({'error': '请输入网址'}), 400

    # 简单的 URL 格式校验
    if not re.match(r'https?://', url):
        return jsonify({'error': '无效的网址'}), 400

    # 模拟网页抓取（与原 Express 后端一致）
    return jsonify({
        'title': '示例网页标题',
        'content': (
            f'这是从 {url} 抓取的网页内容。\n\n'
            '这里是文章的正文内容，包含了主要的信息和观点。'
            '网页抓取功能可以提取网页中的主要文本内容，去除广告、导航栏等干扰元素。'
        ),
        'author': '示例作者',
        'publishDate': time.strftime('%Y-%m-%d'),
    })


@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({
        'status': 'ok',
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'translator': TRANSLATOR_ENGINE,
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    logger.info(f'翻译引擎: {TRANSLATOR_ENGINE}')
    logger.info(f'服务器运行在 http://localhost:{port}')
    logger.info('API 端点:')
    logger.info('  POST /api/detect       - 语言检测')
    logger.info('  POST /api/translate    - 翻译')
    logger.info('  POST /api/ocr          - 图片OCR')
    logger.info('  POST /api/document/parse - 文档解析')
    logger.info('  POST /api/website/extract - 网页抓取')
    logger.info('  GET  /api/health       - 健康检查')
    app.run(host='0.0.0.0', port=port, debug=True)
