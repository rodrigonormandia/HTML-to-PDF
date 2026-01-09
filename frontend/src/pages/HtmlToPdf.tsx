import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { SEO, schemas } from '../components/SEO'

const EXAMPLE_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 1rem; }
    .card { background: #f8fafc; padding: 1.5rem; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Monthly Report</h1>
  </div>
  <div class="card">
    <p>Your content here...</p>
  </div>
</body>
</html>`

const FAQS = [
  {
    question: 'How do I convert HTML to PDF online?',
    answer:
      'Simply paste your HTML code into the PDF Leaf editor, configure your PDF settings (page size, margins, orientation), and click Convert. Your PDF will be generated instantly and ready for download.',
  },
  {
    question: 'Is the HTML to PDF converter free?',
    answer:
      'Yes! PDF Leaf offers 100 free PDF conversions per month. No watermarks are added to your PDFs, and they never expire. Paid plans are available for higher volume needs.',
  },
  {
    question: 'What HTML features are supported?',
    answer:
      'PDF Leaf supports full HTML5 and CSS3, including custom fonts, images, tables, flexbox, grid, and more. TailwindCSS utility classes are also supported natively.',
  },
  {
    question: 'Can I add headers and footers to my PDF?',
    answer:
      'Yes! You can add custom HTML headers and footers to every page of your PDF. Include page numbers, logos, dates, or any custom content using full HTML with inline styles.',
  },
  {
    question: 'What page sizes are supported?',
    answer:
      'PDF Leaf supports A3, A4, A5, Letter, Legal, B4, B5, and custom dimensions. You can also choose between portrait and landscape orientation.',
  },
  {
    question: 'Is there an API for HTML to PDF conversion?',
    answer:
      'Yes! PDF Leaf provides a REST API for programmatic PDF generation. Get your API key from the dashboard and integrate PDF generation into your applications.',
  },
]

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Conversion',
    description: 'Convert HTML to PDF in seconds. No waiting, no queues - just instant results.',
    color: 'emerald',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Full CSS Support',
    description: 'CSS3, Flexbox, Grid, custom fonts, and TailwindCSS all work perfectly.',
    color: 'blue',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: 'Headers & Footers',
    description: 'Add custom HTML headers and footers with page numbers, logos, and more.',
    color: 'purple',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Page Control',
    description: 'Control page breaks with simple CSS classes. Keep tables and content together.',
    color: 'orange',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Developer API',
    description: 'REST API with simple authentication. Generate PDFs programmatically.',
    color: 'pink',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'No Watermarks',
    description: 'Your PDFs are clean and professional. No watermarks, even on the free plan.',
    color: 'teal',
  },
]

const USE_CASES = [
  { title: 'Invoices & Receipts', desc: 'Generate professional invoices from HTML templates' },
  { title: 'Reports & Documents', desc: 'Create formatted reports with charts and tables' },
  { title: 'Contracts & Agreements', desc: 'Produce legally-formatted documents' },
  { title: 'Certificates', desc: 'Design beautiful certificates and awards' },
  { title: 'Resumes & CVs', desc: 'Export styled resumes to PDF format' },
  { title: 'E-commerce', desc: 'Generate order confirmations and shipping labels' },
]

export default function HtmlToPdf() {
  const { t } = useTranslation()

  const faqSchema = schemas.faqPage(FAQS)
  const softwareSchema = schemas.softwareApplication(
    'PDF Leaf - Free HTML to PDF Converter',
    'Convert HTML to PDF online for free. Full CSS support, custom headers/footers, page breaks. No watermark, no expiration. Free online tool and API.',
    'https://htmltopdf.buscarid.com/html-to-pdf'
  )

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
      pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
      teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    }
    return colors[color] || colors.emerald
  }

  return (
    <Layout>
      <SEO
        title="Free HTML to PDF Converter Online - No Watermark"
        description="Convert HTML to PDF online for free. Full CSS3 support, TailwindCSS, custom headers/footers, page breaks. No watermark, no expiration. Free tool and API."
        path="/html-to-pdf"
        jsonLd={[softwareSchema, faqSchema]}
      />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            {t('htmlToPdf.badge', 'Free Online Tool - No Registration Required')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {t('htmlToPdf.hero_title', 'Convert HTML to PDF')}
            <span className="text-blue-600 dark:text-blue-400"> {t('htmlToPdf.hero_title_highlight', 'Instantly')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t(
              'htmlToPdf.hero_subtitle',
              'The most powerful free HTML to PDF converter. Full CSS support, TailwindCSS, custom headers and footers. No watermarks, no expiration.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/25"
            >
              {t('htmlToPdf.cta_primary', 'Start Converting Free')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              {t('htmlToPdf.cta_secondary', 'See Features')}
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            {t('htmlToPdf.hero_note', '100 free conversions/month • No credit card required')}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('htmlToPdf.features_title', 'Everything You Need to Convert HTML to PDF')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('htmlToPdf.features_subtitle', 'Powerful features for developers and designers alike')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              const colorClasses = getColorClasses(feature.color)
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-gray-900/50 hover:shadow-xl transition-shadow"
                >
                  <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <span className={colorClasses.text}>{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('htmlToPdf.example_title', 'Simple HTML In, Beautiful PDF Out')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {t(
                  'htmlToPdf.example_desc',
                  'Just paste your HTML code and we handle the rest. Full CSS support means your PDFs look exactly like your web pages.'
                )}
              </p>
              <ul className="space-y-3">
                {['CSS3 & HTML5 support', 'TailwindCSS native', 'Custom web fonts', 'Images and SVGs'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-400">document.html</span>
              </div>
              <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
                <code>{EXAMPLE_CODE}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('htmlToPdf.usecases_title', 'What Can You Create?')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('htmlToPdf.usecases_subtitle', 'PDF Leaf is perfect for any document generation use case')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((useCase, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('htmlToPdf.faq_title', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/50"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                  <svg
                    className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('htmlToPdf.cta_title', 'Ready to Convert Your HTML to PDF?')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('htmlToPdf.cta_subtitle', 'Start for free. No signup required for your first conversion.')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-xl transition-all hover:scale-105 shadow-xl"
          >
            {t('htmlToPdf.cta_button', 'Convert HTML to PDF Now')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
