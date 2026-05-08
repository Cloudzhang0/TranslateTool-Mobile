import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { useTranslation } from './hooks/useTranslation';
import { Header } from './components/layout/Header';
import { LanguageBar } from './components/layout/LanguageBar';
import { InputPanel } from './components/layout/InputPanel';
import { OutputPanel } from './components/layout/OutputPanel';
import { FeatureBar } from './components/layout/FeatureBar';
import { HistoryPanel } from './components/layout/HistoryPanel';
import { AlertCircle } from 'lucide-react';

function App() {
  const inputText = useAppStore((s) => s.input.text);
  const targetLang = useAppStore((s) => s.output.targetLang);
  const style = useAppStore((s) => s.output.style);
  const error = useAppStore((s) => s.ui.error);
  const setError = useAppStore((s) => s.setError);
  const { triggerTranslation } = useTranslation();

  // 输入变化时自动翻译
  useEffect(() => {
    if (inputText.trim()) {
      triggerTranslation();
    }
  }, [inputText, targetLang, style]);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <Header />
      <LanguageBar />

      <main className="flex-1 flex flex-col lg:flex-row translate-container">
        <InputPanel />
        <OutputPanel />
      </main>

      <FeatureBar />
      <HistoryPanel />

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-[#DADCE0] rounded-lg shadow-md">
          <AlertCircle className="w-5 h-5 text-[#EA4335]" />
          <span className="text-sm text-[#202124]">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-[#5F6368] hover:text-[#202124] text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
