import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConvert = async (action: 'preview' | 'download') => {
    if (!htmlContent.trim()) {
      toast.error(t('feedback.error'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/convert`,
        {
          html_content: htmlContent,
          action: action
        },
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (action === 'preview') {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'document.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast.success(t('feedback.success'));
    } catch (error) {
      console.error(error);
      toast.error(t('feedback.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <img src="/logo.png" alt="PDF Gravity Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
            <p className="text-gray-500">{t('app.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 max-w-4xl flex flex-col gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
          <textarea
            className="flex-grow w-full p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder={t('editor.placeholder')}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
          />

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => handleConvert('preview')}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? t('editor.generating') : t('editor.btn_preview')}
            </button>
            <button
              onClick={() => handleConvert('download')}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? t('editor.generating') : t('editor.btn_download')}
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            {t('footer.apiDocs')}
          </a>
          <span className="text-gray-300">|</span>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            {t('footer.apiRedoc')}
          </a>
        </div>
        <div>&copy; {new Date().getFullYear()} PDF Gravity v1.0.0 | {t('footer.developer')}</div>
      </footer>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
