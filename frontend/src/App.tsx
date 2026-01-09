import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './hooks/useTheme';
import { TemplatesGallery, type Template } from './components/TemplatesGallery';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import AuthModal from './components/Auth/AuthModal';
import { HtmlEditor } from './components/HtmlEditor';

const MAX_CHARS = 2097152; // 2MB
const POLL_INTERVAL = 500; // ms
const MAX_POLL_TIME = 120000; // 2 min max

const EXAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>PDF Leaf Example</title>
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
    <span class="logo">PDF Leaf</span>
    <span class="badge">Example</span>
  </div>

  <h1 class="text-2xl font-bold mb-4">Demo Report</h1>

  <p>This is a complete HTML example demonstrating the capabilities of <strong>PDF Leaf</strong>.</p>

  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Available Features</h2>
    <ul class="list-disc list-inside space-y-1">
      <li>Custom CSS with &lt;style&gt; tag</li>
      <li>TailwindCSS classes</li>
      <li>Page configuration (@page)</li>
      <li>Custom fonts and colors</li>
    </ul>
  </div>

  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Example Table</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-200">
          <th class="border p-2 text-left">Item</th>
          <th class="border p-2 text-left">Description</th>
          <th class="border p-2 text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border p-2">Product A</td>
          <td class="border p-2">Description of product A</td>
          <td class="border p-2 text-right">$150.00</td>
        </tr>
        <tr>
          <td class="border p-2">Product B</td>
          <td class="border p-2">Description of product B</td>
          <td class="border p-2 text-right">$250.00</td>
        </tr>
        <tr class="bg-gray-100 font-bold">
          <td class="border p-2" colspan="2">Total</td>
          <td class="border p-2 text-right">$400.00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PAGE BREAK: use class="page-break" to force a new page -->
  <div class="page-break"></div>

  <!-- PAGE 2 -->
  <div class="header">
    <span class="logo">PDF Leaf</span>
    <span class="badge">Page 2</span>
  </div>

  <h1 class="text-2xl font-bold mb-4">Second Page</h1>

  <div class="card">
    <h2 class="text-lg font-semibold mb-2">Page Break</h2>
    <p>Use the <code class="bg-gray-200 px-1 rounded">page-break</code> class to force a new page:</p>
    <pre class="bg-gray-800 text-green-400 p-3 rounded mt-2 text-sm">&lt;div class="page-break"&gt;&lt;/div&gt;</pre>
    <p class="mt-3">Available classes:</p>
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li><code class="bg-gray-200 px-1 rounded">page-break</code> - break after the element</li>
      <li><code class="bg-gray-200 px-1 rounded">page-break-before</code> - break before the element</li>
      <li><code class="bg-gray-200 px-1 rounded">avoid-break</code> - avoid break inside the element</li>
    </ul>
  </div>

  <div class="footer">
    Generated with PDF Leaf | pdfleaf.com
  </div>
</body>
</html>`;

function App() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // PDF Settings
  const [showSettings, setShowSettings] = useState(false);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState({ top: '2', bottom: '2', left: '2', right: '2' });
  const [marginUnit, setMarginUnit] = useState('cm');
  const [includePageNumbers, setIncludePageNumbers] = useState(false);

  // Header/Footer Settings
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');
  const [headerHeight, setHeaderHeight] = useState('2');
  const [footerHeight, setFooterHeight] = useState('2');
  const [headerFooterUnit, setHeaderFooterUnit] = useState('cm');
  const [excludeHeaderPages, setExcludeHeaderPages] = useState('');
  const [excludeFooterPages, setExcludeFooterPages] = useState('');

  // Templates Gallery
  const [showTemplatesGallery, setShowTemplatesGallery] = useState(false);

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
    // Verificar se o usuário está logado
    if (!user) {
      toast.warning(t('auth.login_required_to_convert'));
      setShowAuthModal(true);
      return;
    }

    if (!htmlContent.trim()) {
      showErrorWithSuggestion('errors.empty_html', 'suggestions.add_content');
      return;
    }

    setLoading(true);
    setProgress(10);
    setStatusText(t('feedback.submitting'));

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      // 1. Submit job com user_id
      const submitResponse = await axios.post(
        `${apiUrl}/api/convert`,
        {
          html_content: htmlContent,
          action: action,
          page_size: pageSize,
          orientation: orientation,
          margin_top: `${margins.top}${marginUnit}`,
          margin_bottom: `${margins.bottom}${marginUnit}`,
          margin_left: `${margins.left}${marginUnit}`,
          margin_right: `${margins.right}${marginUnit}`,
          include_page_numbers: includePageNumbers,
          header_html: headerHtml || null,
          footer_html: footerHtml || null,
          header_height: `${headerHeight}${headerFooterUnit}`,
          footer_height: `${footerHeight}${headerFooterUnit}`,
          exclude_header_pages: excludeHeaderPages || null,
          exclude_footer_pages: excludeFooterPages || null,
          user_id: user.id
        }
      );

      const { job_id } = submitResponse.data;
      setProgress(20);
      setStatusText(t('feedback.queued'));

      // 2. Poll for status
      let status = 'pending';
      let pollCount = 0;
      const maxPolls = MAX_POLL_TIME / POLL_INTERVAL;

      while (status !== 'completed' && status !== 'failed' && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const statusResponse = await axios.get(`${apiUrl}/api/jobs/${job_id}`);
        status = statusResponse.data.status;
        pollCount++;

        if (status === 'pending') {
          setProgress(20 + Math.min(pollCount, 20));
          setStatusText(t('feedback.queued'));
        } else if (status === 'processing') {
          setProgress(40 + Math.min(pollCount * 2, 40));
          setStatusText(t('feedback.processing'));
        } else if (status === 'failed') {
          throw new Error(statusResponse.data.error || 'PDF generation failed');
        }
      }

      if (status !== 'completed') {
        throw new Error('Timeout waiting for PDF');
      }

      setProgress(90);
      setStatusText(t('feedback.downloading'));

      // 3. Download PDF
      const pdfResponse = await axios.get(
        `${apiUrl}/api/jobs/${job_id}/download?action=${action}`,
        { responseType: 'blob' }
      );

      setProgress(100);
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
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
        const errorDetail = error.response?.data?.detail;

        switch (status) {
          case 400:
            showErrorWithSuggestion('errors.invalid_html', 'suggestions.check_tags');
            break;
          case 401:
            // Erro de autenticação
            if (errorDetail?.error === 'authentication_required') {
              toast.warning(t('auth.login_required_to_convert'));
              setShowAuthModal(true);
            } else {
              showErrorWithSuggestion('errors.auth_error', 'suggestions.login_again');
            }
            break;
          case 422:
            showErrorWithSuggestion('errors.size_limit', 'suggestions.reduce_size');
            break;
          case 429:
            // Cota excedida ou rate limit
            if (errorDetail?.error === 'quota_exceeded') {
              const quota = errorDetail.quota;
              toast.error(
                <div>
                  <p className="font-medium">{t('errors.quota_exceeded')}</p>
                  <p className="text-sm mt-1 opacity-80">
                    {t('errors.quota_used', { used: quota?.used || 0, limit: quota?.limit || 0 })}
                  </p>
                </div>,
                { autoClose: 8000 }
              );
            } else {
              showErrorWithSuggestion('errors.rate_limit', 'suggestions.wait_retry');
            }
            break;
          case 500:
            showErrorWithSuggestion('errors.server_error', 'suggestions.try_again');
            break;
          default:
            showErrorWithSuggestion('errors.unknown', 'suggestions.try_again');
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
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
    setHeaderHtml('');
    setFooterHtml('');
    setHeaderHeight('2');
    setFooterHeight('2');
    setExcludeHeaderPages('');
    setExcludeFooterPages('');
    setIncludePageNumbers(false);
  };

  const handleLoadExample = () => {
    setHtmlContent(EXAMPLE_HTML);
    setHeaderHtml('<div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:10pt;">\n  <span style="font-weight:bold; color:#22c55e;">PDF Leaf</span>\n  <span style="color:#666;">Demo Report</span>\n</div>');
    setFooterHtml('<div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:9pt; color:#888;">\n  <span>Generated on ' + new Date().toLocaleDateString('en-US') + '</span>\n  <span>Page {{page}} of {{pages}}</span>\n</div>');
    setHeaderHeight('1.5');
    setFooterHeight('1');
    setIncludePageNumbers(true);
    toast.info(t('editor.example_loaded'));
  };

  const handleSelectTemplate = (template: Template) => {
    setHtmlContent(template.html);
    if (template.headerHtml) setHeaderHtml(template.headerHtml);
    if (template.footerHtml) setFooterHtml(template.footerHtml);
    if (template.headerHeight) setHeaderHeight(template.headerHeight);
    if (template.footerHeight) setFooterHeight(template.footerHeight);
    setShowTemplatesGallery(false);
    toast.info(t('templates.template_loaded'));
  };

  const homePage = (
    <Layout>
      <div className="container mx-auto px-4 max-w-4xl py-6 flex flex-col gap-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-900/50 flex-grow flex flex-col">
          <HtmlEditor
            value={htmlContent}
            onChange={setHtmlContent}
            onCtrlEnter={() => handleConvert('preview')}
            maxLength={MAX_CHARS}
            placeholder={t('editor.placeholder')}
            theme={theme}
            minHeight="300px"
            className="flex-grow"
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

                  {/* Header/Footer Section */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('settings.headers_footers')}
                    </h3>

                    {/* Header HTML */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t('settings.header_html')}
                      </label>
                      <textarea
                        value={headerHtml}
                        onChange={(e) => setHeaderHtml(e.target.value)}
                        placeholder={t('settings.header_placeholder')}
                        className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.height')}:</span>
                        <input
                          type="number"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={headerHeight}
                          onChange={(e) => setHeaderHeight(e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{headerFooterUnit}</span>
                      </div>
                    </div>

                    {/* Footer HTML */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t('settings.footer_html')}
                      </label>
                      <textarea
                        value={footerHtml}
                        onChange={(e) => setFooterHtml(e.target.value)}
                        placeholder={t('settings.footer_placeholder')}
                        className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('settings.height')}:</span>
                        <input
                          type="number"
                          min="0.5"
                          max="10"
                          step="0.5"
                          value={footerHeight}
                          onChange={(e) => setFooterHeight(e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{headerFooterUnit}</span>
                      </div>
                    </div>

                    {/* Height Unit Selector */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('settings.header_footer_unit')}
                      </label>
                      <select
                        value={headerFooterUnit}
                        onChange={(e) => setHeaderFooterUnit(e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                      </select>
                    </div>

                    {/* Page Exclusions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t('settings.exclude_header_pages')}
                        </label>
                        <input
                          type="text"
                          value={excludeHeaderPages}
                          onChange={(e) => setExcludeHeaderPages(e.target.value)}
                          placeholder="1, 3, 5"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t('settings.exclude_footer_pages')}
                        </label>
                        <input
                          type="text"
                          value={excludeFooterPages}
                          onChange={(e) => setExcludeFooterPages(e.target.value)}
                          placeholder="1, 3, 5"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('settings.exclude_pages_hint')}
                    </p>
                  </div>

                  {/* Page Break Info */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings.page_break_title')}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {t('settings.page_break_description')}
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-xs">
                      <code className="text-blue-600 dark:text-blue-400">&lt;div class="page-break"&gt;&lt;/div&gt;</code>
                    </div>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                      <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">page-break</code> - {t('settings.page_break_after')}</li>
                      <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">page-break-before</code> - {t('settings.page_break_before')}</li>
                      <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">avoid-break</code> - {t('settings.avoid_break')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplatesGallery(true)}
                disabled={loading}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm border border-gray-200 dark:border-gray-600 hover:scale-105 active:scale-95"
              >
                {t('templates.btn_templates')}
              </button>
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
      </div>

      <TemplatesGallery
        isOpen={showTemplatesGallery}
        onClose={() => setShowTemplatesGallery(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </Layout>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={homePage} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <ToastContainer position="bottom-right" theme={theme} />
    </>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
