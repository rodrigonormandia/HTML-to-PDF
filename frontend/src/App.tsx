import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './hooks/useTheme';

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
  const { theme, toggleTheme } = useTheme();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // PDF Settings
  const [showSettings, setShowSettings] = useState(false);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState({ top: '2', bottom: '2', left: '2', right: '2' });
  const [marginUnit, setMarginUnit] = useState('cm');
  const [includePageNumbers, setIncludePageNumbers] = useState(false);

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
          action: action,
          page_size: pageSize,
          orientation: orientation,
          margin_top: `${margins.top}${marginUnit}`,
          margin_bottom: `${margins.bottom}${marginUnit}`,
          margin_left: `${margins.left}${marginUnit}`,
          margin_right: `${margins.right}${marginUnit}`,
          include_page_numbers: includePageNumbers
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 py-4 px-6 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="PDF Gravity Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
              <p className="text-gray-500 dark:text-gray-400">{t('app.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? (
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 max-w-4xl flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900/50 flex-grow flex flex-col">
          <textarea
            className="flex-grow w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder={t('editor.placeholder')}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
          />

          <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>
              {htmlContent.length.toLocaleString('pt-BR')} / {MAX_CHARS.toLocaleString('pt-BR')} {t('editor.characters')}
            </span>
            <span className="text-xs">{t('editor.shortcut_hint')}</span>
          </div>

          {loading && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">{statusText}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* PDF Settings Panel */}
          <div className="mt-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <span>{showSettings ? '▼' : '▶'}</span>
              <span>{t('settings.title')}</span>
            </button>

            {showSettings && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Page Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('settings.page_size')}
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="A3">A3</option>
                      <option value="A5">A5</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('settings.orientation')}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrientation('portrait')}
                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                          orientation === 'portrait'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t('settings.portrait')}
                      </button>
                      <button
                        onClick={() => setOrientation('landscape')}
                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                          orientation === 'landscape'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t('settings.landscape')}
                      </button>
                    </div>
                  </div>

                  {/* Margins */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('settings.margins')}
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.margin_top')}:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={margins.top}
                          onChange={(e) => setMargins({ ...margins, top: e.target.value })}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.margin_bottom')}:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={margins.bottom}
                          onChange={(e) => setMargins({ ...margins, bottom: e.target.value })}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.margin_left')}:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={margins.left}
                          onChange={(e) => setMargins({ ...margins, left: e.target.value })}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.margin_right')}:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={margins.right}
                          onChange={(e) => setMargins({ ...margins, right: e.target.value })}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <select
                        value={marginUnit}
                        onChange={(e) => setMarginUnit(e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                  </div>

                  {/* Page Numbers */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePageNumbers}
                        onChange={(e) => setIncludePageNumbers(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('settings.page_numbers')}</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">{t('settings.page_numbers_hint')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleLoadExample}
                disabled={loading}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm border border-gray-200 dark:border-gray-600 hover:scale-105 active:scale-95"
              >
                {t('editor.btn_example')}
              </button>
              <button
                onClick={handleClear}
                disabled={loading || !htmlContent}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm border border-gray-200 dark:border-gray-600 hover:scale-105 active:scale-95"
              >
                {t('editor.btn_clear')}
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleConvert('preview')}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 font-medium hover:scale-105 active:scale-95"
              >
                {loading ? t('editor.generating') : t('editor.btn_preview')}
              </button>
              <button
                onClick={() => handleConvert('download')}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:opacity-50 font-medium hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-600/25"
              >
                {loading ? t('editor.generating') : t('editor.btn_download')}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('footer.apiDocs')}
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('footer.apiRedoc')}
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href="/privacy.html"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('legal.privacy')}
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href="/terms.html"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('legal.terms')}
          </a>
        </div>
        <div>&copy; {new Date().getFullYear()} PDF Gravity v1.2.0 | {t('footer.developer')}</div>
      </footer>

      <ToastContainer position="bottom-right" theme={theme} />
    </div>
  );
}

export default App;
