import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { SEO, schemas } from '../components/SEO'

const EXAMPLE_CODE = `<div class="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
  <div class="flex items-center space-x-4">
    <div class="shrink-0">
      <img class="h-12 w-12" src="/logo.png" alt="Logo">
    </div>
    <div>
      <div class="text-xl font-medium text-black">PDF Leaf</div>
      <p class="text-slate-500">TailwindCSS to PDF</p>
    </div>
  </div>
</div>`

const FAQS = [
  {
    question: 'What is TailwindCSS to PDF conversion?',
    answer:
      'TailwindCSS to PDF conversion allows you to convert HTML styled with Tailwind utility classes directly into a PDF document. PDF Leaf automatically includes the TailwindCSS CDN, so all your utility classes work out of the box.',
  },
  {
    question: 'Is PDF Leaf free to use?',
    answer:
      'Yes! PDF Leaf offers a free tier with 100 PDF conversions per month. No watermarks, no expiration on your PDFs. Paid plans are available for higher volume needs.',
  },
  {
    question: 'Do generated PDFs expire?',
    answer:
      'No, unlike some competitors that expire PDFs after 2 hours, PDF Leaf PDFs never expire. Once generated, they are yours forever.',
  },
  {
    question: 'Can I use custom fonts with TailwindCSS?',
    answer:
      'Yes! You can include Google Fonts or any web font in your HTML. Just add the font link in your HTML head section and use the font-family in your styles.',
  },
  {
    question: 'Does PDF Leaf support page breaks?',
    answer:
      'Yes! PDF Leaf supports three CSS classes for page control: page-break (break after), page-break-before (break before), and avoid-break (prevent breaks inside an element).',
  },
]

export default function TailwindToPdf() {
  const { t } = useTranslation()

  const faqSchema = schemas.faqPage(FAQS)
  const softwareSchema = schemas.softwareApplication(
    'PDF Leaf - TailwindCSS to PDF Converter',
    'Convert TailwindCSS-styled HTML to PDF instantly. Native Tailwind support, custom headers/footers, page breaks. No watermark, no expiration.',
    'https://htmltopdf.buscarid.com/tailwind-to-pdf'
  )

  return (
    <Layout>
      <SEO
        title="TailwindCSS to PDF Converter - Free Online Tool"
        description="Convert TailwindCSS-styled HTML to PDF instantly. Native Tailwind support, custom headers/footers, page breaks. No watermark, no expiration. Free online tool."
        path="/tailwind-to-pdf"
        jsonLd={[softwareSchema, faqSchema]}
      />

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            {t('tailwindToPdf.badge', 'The Only Tool With Native TailwindCSS Support')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('tailwindToPdf.hero_title', 'Convert TailwindCSS to PDF Online')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t(
              'tailwindToPdf.hero_subtitle',
              'The only HTML to PDF converter with native TailwindCSS support. All utility classes work instantly - no configuration needed.'
            )}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-600/25"
          >
            {t('tailwindToPdf.cta', 'Try It Free')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('tailwindToPdf.features_title', 'Why Choose PDF Leaf for TailwindCSS?')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-gray-900/50">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('tailwindToPdf.feature1_title', 'Native TailwindCSS')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'tailwindToPdf.feature1_desc',
                  'All Tailwind utility classes work out of the box. No manual CSS setup required - just paste and convert.'
                )}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-gray-900/50">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('tailwindToPdf.feature2_title', 'Custom Headers & Footers')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'tailwindToPdf.feature2_desc',
                  'Add page numbers, logos, and custom HTML to headers and footers. Full HTML support with inline styles.'
                )}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-gray-900/50">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('tailwindToPdf.feature3_title', 'Page Break Control')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  'tailwindToPdf.feature3_desc',
                  'Use simple CSS classes to control page breaks. Force breaks, prevent breaks, or avoid splitting elements.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('tailwindToPdf.example_title', 'See It In Action')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {t('tailwindToPdf.example_subtitle', 'Paste TailwindCSS HTML and get a beautiful PDF instantly')}
          </p>
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-gray-400">example.html</span>
            </div>
            <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
              <code>{EXAMPLE_CODE}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('tailwindToPdf.how_it_works', 'How It Works')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('tailwindToPdf.step1_title', 'Paste Your HTML')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('tailwindToPdf.step1_desc', 'Paste your TailwindCSS-styled HTML into the editor')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('tailwindToPdf.step2_title', 'Configure Settings')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('tailwindToPdf.step2_desc', 'Optionally adjust page size, margins, headers and footers')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('tailwindToPdf.step3_title', 'Download PDF')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('tailwindToPdf.step3_desc', 'Click convert and download your PDF instantly')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('tailwindToPdf.faq_title', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                  <svg
                    className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
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
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('tailwindToPdf.cta_title', 'Ready to Convert Your TailwindCSS to PDF?')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {t('tailwindToPdf.cta_subtitle', 'Start converting for free. No signup required for your first conversion.')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-600/25"
          >
            {t('tailwindToPdf.cta_button', 'Start Converting Now')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
