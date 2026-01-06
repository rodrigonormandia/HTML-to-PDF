import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_CHARS = 2097152; // 2MB

const EXAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Exemplo PDF Gravity</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .logo {
      font-size: 2rem;
      font-weight: bold;
      color: #3b82f6;
    }
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin: 1rem 0;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">PDF Gravity</span>
    <span class="badge">Exemplo</span>
  </div>

  <h1 class="text-2xl font-bold mb-4">Relatório de Demonstração</h1>

  <p>Este é um exemplo completo de HTML que demonstra as capacidades do <strong>PDF Gravity</strong>.</p>

  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Recursos Disponíveis</h2>
    <ul class="list-disc list-inside space-y-1">
      <li>CSS personalizado com a tag &lt;style&gt;</li>
      <li>Classes do TailwindCSS</li>
      <li>Configuração de página (@page)</li>
      <li>Fontes e cores customizadas</li>
    </ul>
  </div>

  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Tabela de Exemplo</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-200">
          <th class="border p-2 text-left">Item</th>
          <th class="border p-2 text-left">Descrição</th>
          <th class="border p-2 text-right">Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">Produto A</td>
          <td class="border p-2">Descrição do produto A</td>
          <td class="border p-2 text-right">R$ 150,00</td>
        </tr>
        <tr>
          <td class="border p-2">Produto B</td>
          <td class="border p-2">Descrição do produto B</td>
          <td class="border p-2 text-right">R$ 250,00</td>
        </tr>
        <tr class="bg-gray-100 font-bold">
          <td class="border p-2" colspan="2">Total</td>
          <td class="border p-2 text-right">R$ 400,00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Gerado com PDF Gravity | htmltopdf.buscarid.com
  </div>
</body>
</html>`;

function App() {
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const showErrorWithSuggestion = (errorKey: string, suggestionKey: string) => {
    toast.error(
      <div>
        <p className="font-medium">{t(errorKey)}</p>
        <p className="text-sm mt-1 opacity-80">{t(suggestionKey)}</p>
      </div>,
      { autoClose: 5000 }
    );
  };

  const handleConvert = async (action: 'preview' | 'download') => {
    if (!htmlContent.trim()) {
      showErrorWithSuggestion('errors.empty_html', 'suggestions.add_content');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatusText(t('feedback.uploading'));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/convert`,
        {
          html_content: htmlContent,
          action: action
        },
        {
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
              if (percent === 100) {
                setStatusText(t('feedback.processing'));
              }
            }
          },
          onDownloadProgress: () => {
            setStatusText(t('feedback.downloading'));
          }
        }
      );

      setProgress(100);
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

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        switch (status) {
          case 400:
            showErrorWithSuggestion('errors.invalid_html', 'suggestions.check_tags');
            break;
          case 422:
            showErrorWithSuggestion('errors.size_limit', 'suggestions.reduce_size');
            break;
          case 429:
            showErrorWithSuggestion('errors.rate_limit', 'suggestions.wait_retry');
            break;
          case 500:
            showErrorWithSuggestion('errors.server_error', 'suggestions.try_again');
            break;
          default:
            showErrorWithSuggestion('errors.unknown', 'suggestions.try_again');
        }
      } else {
        showErrorWithSuggestion('errors.network', 'suggestions.check_connection');
      }
    } finally {
      setLoading(false);
      setProgress(0);
      setStatusText('');
    }
  };

  const handleClear = () => {
    setHtmlContent('');
  };

  const handleLoadExample = () => {
    setHtmlContent(EXAMPLE_HTML);
    toast.info(t('editor.example_loaded'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleConvert('preview');
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
            onChange={(e) => setHtmlContent(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
          />

          <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
            <span>
              {htmlContent.length.toLocaleString('pt-BR')} / {MAX_CHARS.toLocaleString('pt-BR')} {t('editor.characters')}
            </span>
            <span className="text-xs">{t('editor.shortcut_hint')}</span>
          </div>

          {loading && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-blue-600 animate-pulse">{statusText}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleLoadExample}
                disabled={loading}
                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm border border-gray-200"
              >
                {t('editor.btn_example')}
              </button>
              <button
                onClick={handleClear}
                disabled={loading || !htmlContent}
                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm border border-gray-200"
              >
                {t('editor.btn_clear')}
              </button>
            </div>
            <div className="flex gap-3">
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
        <div>&copy; {new Date().getFullYear()} PDF Gravity v1.0.3 | {t('footer.developer')}</div>
      </footer>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
