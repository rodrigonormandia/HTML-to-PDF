import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { SEO, schemas } from '../components/SEO';

// Feature icons as SVG components
const TailwindIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
  </svg>
);

const HeaderFooterIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);

const AsyncIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const PageBreakIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="8" rx="1" />
    <rect x="4" y="14" width="16" height="8" rx="1" />
    <line x1="2" y1="12" x2="6" y2="12" strokeDasharray="2 2" />
    <line x1="10" y1="12" x2="14" y2="12" strokeDasharray="2 2" />
    <line x1="18" y1="12" x2="22" y2="12" strokeDasharray="2 2" />
  </svg>
);

const ApiIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 17l6-6-6-6M12 19h8" />
  </svg>
);

const NoExpireIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function Home() {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const features = [
    {
      icon: <TailwindIcon />,
      title: t('home.features.tailwind.title'),
      description: t('home.features.tailwind.desc'),
    },
    {
      icon: <HeaderFooterIcon />,
      title: t('home.features.headers.title'),
      description: t('home.features.headers.desc'),
    },
    {
      icon: <AsyncIcon />,
      title: t('home.features.async.title'),
      description: t('home.features.async.desc'),
    },
    {
      icon: <PageBreakIcon />,
      title: t('home.features.pagebreak.title'),
      description: t('home.features.pagebreak.desc'),
    },
    {
      icon: <ApiIcon />,
      title: t('home.features.api.title'),
      description: t('home.features.api.desc'),
    },
    {
      icon: <NoExpireIcon />,
      title: t('home.features.noexpire.title'),
      description: t('home.features.noexpire.desc'),
    },
  ];

  const steps = [
    {
      number: '1',
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.desc'),
    },
    {
      number: '2',
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.desc'),
    },
    {
      number: '3',
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.desc'),
    },
  ];

  const plans = [
    { name: 'Free', price: '$0', pdfs: '50/mo' },
    { name: 'Starter', price: '$9', pdfs: '500/mo' },
    { name: 'Pro', price: '$29', pdfs: '2,000/mo' },
    { name: 'Enterprise', price: t('home.pricingPreview.custom'), pdfs: t('home.pricingPreview.unlimited') },
  ];

  return (
    <Layout>
      <SEO
        title="Free Online HTML to PDF Converter with TailwindCSS Support"
        description="Convert HTML to PDF instantly with native TailwindCSS support. Custom headers, footers, page breaks. No watermark, no expiration. Free online tool and API."
        path="/"
        jsonLd={[
          schemas.webApplication,
          schemas.faqPage([
            { question: t('home.faq.q1'), answer: t('home.faq.a1') },
            { question: t('home.faq.q2'), answer: t('home.faq.a2') },
            { question: t('home.faq.q3'), answer: t('home.faq.a3') },
            { question: t('home.faq.q4'), answer: t('home.faq.a4') }
          ])
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-16 lg:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-96 h-96 bg-emerald-300 dark:bg-emerald-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {t('home.hero.subtitle')}
              </p>

              {/* Bullet points */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-gray-700 dark:text-gray-300">{t('home.hero.bullet1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-gray-700 dark:text-gray-300">{t('home.hero.bullet2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-gray-700 dark:text-gray-300">{t('home.hero.bullet3')}</span>
                </li>
              </ul>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/editor"
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-600/25"
                >
                  {t('home.hero.cta_primary')}
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  {t('home.hero.cta_secondary')}
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                {/* Code Editor Mock */}
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-hidden">
                    <code>{`<div class="bg-white p-8">
  <h1 class="text-3xl font-bold
      text-blue-600">
    Invoice #1234
  </h1>
  <p class="text-gray-600">
    Total: $1,250.00
  </p>
</div>`}</code>
                  </pre>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-4">
                  <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>

                {/* PDF Preview Mock */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner">
                  <div className="border-b border-gray-200 pb-2 mb-2">
                    <div className="h-4 w-24 bg-blue-600 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-xs text-gray-400">PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <UserIcon />
              </div>
              <div className="text-3xl font-bold mb-1">10,000+</div>
              <div className="text-blue-100">{t('home.hero.stats.users')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <CheckIcon />
              </div>
              <div className="text-3xl font-bold mb-1">99.99%</div>
              <div className="text-blue-100">{t('home.hero.stats.uptime')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <LightningIcon />
              </div>
              <div className="text-3xl font-bold mb-1">~800ms</div>
              <div className="text-blue-100">{t('home.hero.stats.latency')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {t('home.features.subtitle')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('home.useCases.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12">
            {t('home.useCases.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Invoice */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
              <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-700 p-4">
                <img
                  src="/images/invoice-preview.png"
                  alt="Invoice Template"
                  className="h-full w-auto object-contain shadow-sm rounded-md"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('home.useCases.invoice.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('home.useCases.invoice.desc')}</p>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
              <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-700 p-4">
                <img
                  src="/images/resume-preview.png"
                  alt="Resume Template"
                  className="h-full w-auto object-contain shadow-sm rounded-md"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('home.useCases.resume.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('home.useCases.resume.desc')}</p>
              </div>
            </div>

            {/* Report */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
              <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-700 p-4">
                <img
                  src="/images/report-preview.png"
                  alt="Report Template"
                  className="h-full w-auto object-contain shadow-sm rounded-md"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('home.useCases.report.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('home.useCases.report.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('home.howItWorks.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('home.codeExample.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-8">
            {t('home.codeExample.subtitle')}
          </p>

          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-gray-300">
              <code>{`import { PdfLeaf } from '@pdfleaf/sdk';

const pdf = await PdfLeaf.convert({
  html: '<h1 class="text-3xl text-blue-600">Hello PDF!</h1>',
  format: 'A4'
});`}</code>
            </pre>
          </div>

          <div className="text-center mt-8">
            <a
              href={`${apiUrl}/api/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t('home.codeExample.viewDocs')}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('home.testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12">
            {t('home.testimonials.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, star) => (
                    <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{t(`home.testimonials.review${i}.text`)}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t(`home.testimonials.review${i}.author`)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`home.testimonials.review${i}.role`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('home.faq.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12">
            {t('home.faq.subtitle')}
          </p>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`home.faq.q${i}`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(`home.faq.a${i}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('home.pricingPreview.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12">
            {t('home.pricingPreview.subtitle')}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${index === 2
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${index === 2 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className={`text-3xl font-bold mb-2 ${index === 2 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.price}
                  {index < 3 && <span className="text-sm font-normal">/mo</span>}
                </div>
                <p className={`text-sm ${index === 2 ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.pdfs} PDFs
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t('home.pricingPreview.viewAll')}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('home.finalCta.title')}
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            {t('home.finalCta.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/editor"
              className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              {t('home.hero.cta_primary')}
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              {t('home.hero.cta_secondary')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
