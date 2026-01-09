import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { SEO, schemas } from '../components/SEO'

// Table of Contents sections
const TOC_SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'how-it-works', title: 'How TailwindCSS Works in PDFs' },
  { id: 'tutorial', title: 'Step-by-Step Tutorial' },
  { id: 'best-practices', title: 'Best Practices' },
  { id: 'code-examples', title: 'Code Examples' },
  { id: 'advanced', title: 'Advanced Techniques' },
  { id: 'api-integration', title: 'API Integration' },
  { id: 'faq', title: 'FAQ' },
]

// Code examples
const INVOICE_EXAMPLE = `<div class="p-8 max-w-2xl mx-auto bg-white">
  <div class="flex justify-between items-start mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">INVOICE</h1>
      <p class="text-gray-500">#INV-2024-001</p>
    </div>
    <div class="text-right">
      <p class="font-semibold">Your Company</p>
      <p class="text-gray-500">123 Business St</p>
    </div>
  </div>

  <table class="w-full mb-8">
    <thead>
      <tr class="border-b-2 border-gray-200">
        <th class="text-left py-2">Item</th>
        <th class="text-right py-2">Qty</th>
        <th class="text-right py-2">Price</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b">
        <td class="py-2">Web Development</td>
        <td class="text-right">10</td>
        <td class="text-right">$1,500</td>
      </tr>
    </tbody>
  </table>

  <div class="text-right">
    <p class="text-2xl font-bold">Total: $1,500</p>
  </div>
</div>`

const RESUME_EXAMPLE = `<div class="p-8 max-w-2xl mx-auto">
  <header class="mb-8 border-b pb-4">
    <h1 class="text-4xl font-bold text-gray-900">John Doe</h1>
    <p class="text-xl text-emerald-600">Senior Developer</p>
    <p class="text-gray-500">john@example.com | (555) 123-4567</p>
  </header>

  <section class="mb-6">
    <h2 class="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">
      Experience
    </h2>
    <div class="mb-4">
      <h3 class="font-semibold">Tech Company - Lead Developer</h3>
      <p class="text-gray-500 text-sm">2020 - Present</p>
      <ul class="list-disc ml-5 text-gray-600">
        <li>Led team of 5 developers</li>
        <li>Implemented CI/CD pipeline</li>
      </ul>
    </div>
  </section>

  <section>
    <h2 class="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">
      Skills
    </h2>
    <div class="flex flex-wrap gap-2">
      <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
        React
      </span>
      <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        TypeScript
      </span>
      <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
        Node.js
      </span>
    </div>
  </section>
</div>`

const API_CURL_EXAMPLE = `curl -X POST https://htmltopdf.buscarid.com/api/convert \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "html_content": "<div class=\\"p-8 bg-white\\"><h1 class=\\"text-2xl font-bold\\">Hello TailwindCSS!</h1></div>",
    "page_size": "A4",
    "orientation": "portrait"
  }'`

const API_PYTHON_EXAMPLE = `import requests

response = requests.post(
    "https://htmltopdf.buscarid.com/api/convert",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "html_content": """
            <div class="p-8 bg-white">
                <h1 class="text-2xl font-bold text-gray-900">
                    Hello from Python!
                </h1>
            </div>
        """,
        "page_size": "A4"
    }
)

# Get job_id and poll for result
job_id = response.json()["job_id"]
print(f"Job created: {job_id}")`

const API_NODE_EXAMPLE = `const response = await fetch('https://htmltopdf.buscarid.com/api/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    html_content: \`
      <div class="p-8 bg-white">
        <h1 class="text-2xl font-bold">Hello from Node.js!</h1>
      </div>
    \`,
    page_size: 'A4'
  })
});

const { job_id } = await response.json();
console.log('Job created:', job_id);`

// FAQ items
const FAQS = [
  {
    question: 'What TailwindCSS version does PDF Leaf support?',
    answer: 'PDF Leaf automatically includes TailwindCSS v3 via CDN. All utility classes from the core framework are supported. Custom configurations and plugins require inline styles.',
  },
  {
    question: 'Can I use custom colors with TailwindCSS?',
    answer: 'Yes! While the default Tailwind palette is available, you can use arbitrary values like bg-[#ff6b6b] or text-[rgb(100,200,100)] for custom colors.',
  },
  {
    question: 'How do I add page breaks between sections?',
    answer: 'Use the page-break class to force a break after an element, page-break-before for breaks before, or avoid-break to prevent an element from splitting across pages.',
  },
  {
    question: 'Are responsive classes like md: and lg: supported?',
    answer: 'PDFs are rendered at a fixed width, so responsive breakpoint classes are not meaningful. Use fixed widths and the max-w-* utilities for consistent layouts.',
  },
  {
    question: 'Can I use Google Fonts with TailwindCSS?',
    answer: 'Yes! Include a Google Fonts link in your HTML head section. Then use font-[FontName] or define the font-family in a style tag.',
  },
  {
    question: 'What is the maximum HTML size allowed?',
    answer: 'HTML content is limited to 2MB. For optimal performance, keep your HTML under 500KB and use external image URLs instead of base64 encoded images.',
  },
  {
    question: 'How do I handle multi-page documents?',
    answer: 'Use page-break classes to control where pages split. For tables, consider using the avoid-break class on rows to prevent awkward splits.',
  },
  {
    question: 'Does PDF Leaf support dark mode classes?',
    answer: 'Dark mode (dark:) classes are not applied in PDFs since there is no dark mode context. Use the standard color classes for consistent PDF output.',
  },
]

export default function TailwindToPdfGuide() {
  const { t } = useTranslation()

  // JSON-LD schemas
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Complete Guide to TailwindCSS to PDF Conversion',
    description: 'Learn how to convert TailwindCSS-styled HTML to PDF. Step-by-step tutorial, code examples, best practices and API integration guide.',
    image: 'https://htmltopdf.buscarid.com/og-guide.png',
    datePublished: '2026-01-09',
    dateModified: '2026-01-09',
    author: {
      '@type': 'Organization',
      name: 'PDF Leaf',
      url: 'https://htmltopdf.buscarid.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'PDF Leaf',
      logo: {
        '@type': 'ImageObject',
        url: 'https://htmltopdf.buscarid.com/logo.png'
      }
    }
  }

  const faqSchema = schemas.faqPage(FAQS)

  const breadcrumbSchema = schemas.breadcrumb([
    { name: 'Home', url: 'https://htmltopdf.buscarid.com/' },
    { name: 'Guide', url: 'https://htmltopdf.buscarid.com/guide/tailwind-to-pdf' }
  ])

  return (
    <Layout>
      <SEO
        title="The Complete Guide to TailwindCSS to PDF Conversion | PDF Leaf"
        description="Master TailwindCSS to PDF conversion with our comprehensive guide. Step-by-step tutorial, code examples, best practices, and API integration."
        path="/guide/tailwind-to-pdf"
        type="article"
        jsonLd={[articleSchema, faqSchema, breadcrumbSchema]}
      />

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            Complete Guide
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('guide.title', 'The Complete Guide to TailwindCSS to PDF Conversion')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('guide.subtitle', 'Everything you need to know about converting TailwindCSS-styled HTML to beautiful PDF documents.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-emerald-600/25"
            >
              Try the Editor
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#tutorial"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
            >
              Jump to Tutorial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Table of Contents</h2>
          <nav className="grid md:grid-cols-2 gap-2">
            {TOC_SECTIONS.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{section.title}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Introduction */}
      <section id="introduction" className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Introduction</h2>

          <p className="text-gray-600 dark:text-gray-400">
            TailwindCSS has revolutionized how developers build user interfaces with its utility-first approach.
            But what happens when you need to generate PDFs from that beautifully styled HTML? That's where
            PDF Leaf comes in - the only HTML to PDF converter with native TailwindCSS support.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">What is TailwindCSS?</h3>
          <p className="text-gray-600 dark:text-gray-400">
            TailwindCSS is a utility-first CSS framework that provides low-level utility classes to build
            custom designs directly in your HTML. Instead of writing custom CSS, you apply pre-built classes
            like <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">p-4</code>,
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">text-center</code>, and
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">bg-blue-500</code>.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">Common Use Cases</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Invoices & Receipts:</strong> Generate professional invoices with consistent branding</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Reports & Documents:</strong> Create data reports with tables and charts</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Resumes & CVs:</strong> Build modern resume templates for job applications</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Contracts & Proposals:</strong> Generate legal documents with proper formatting</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Certificates:</strong> Create award certificates and diplomas</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How TailwindCSS Works in PDFs */}
      <section id="how-it-works" className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How TailwindCSS Works in PDFs</h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Automatic CDN Injection</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              PDF Leaf automatically includes the TailwindCSS CDN in your HTML before rendering. This means
              you don't need to include any script tags - just use Tailwind classes directly.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <p className="text-emerald-800 dark:text-emerald-200 text-sm">
                <strong>Note:</strong> We inject <code className="bg-emerald-100 dark:bg-emerald-900/50 px-1 rounded">https://cdn.tailwindcss.com</code> automatically,
                so all core Tailwind utilities are available.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Supported Classes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Layout & Spacing</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">p-*</code> - Padding</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">m-*</code> - Margin</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">flex</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">grid</code> - Layout</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">gap-*</code> - Gap spacing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Typography</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">text-*</code> - Font size & color</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">font-*</code> - Font weight</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">leading-*</code> - Line height</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">tracking-*</code> - Letter spacing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Colors & Backgrounds</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">bg-*</code> - Background color</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">text-*</code> - Text color</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">border-*</code> - Border color</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">bg-gradient-*</code> - Gradients</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Borders & Effects</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">rounded-*</code> - Border radius</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">shadow-*</code> - Box shadow</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">border-*</code> - Border width</li>
                  <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">divide-*</code> - Dividers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Limitations</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>Responsive classes:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">md:</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">lg:</code> breakpoints don't apply (fixed width rendering)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>Dark mode:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">dark:</code> classes are not applied in PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>Animations:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">animate-*</code> classes are ignored (static output)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>Custom plugins:</strong> Only core Tailwind classes; plugins require manual CSS</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Step-by-Step Tutorial */}
      <section id="tutorial" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Step-by-Step Tutorial</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Create Your HTML with TailwindCSS</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Write your HTML using Tailwind utility classes. You don't need to include any CSS files or CDN links -
                  PDF Leaf handles that automatically.
                </p>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-gray-400">your-document.html</span>
                  </div>
                  <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                    <code>{`<div class="p-8 max-w-lg mx-auto">
  <h1 class="text-3xl font-bold text-gray-900">
    My Document Title
  </h1>
  <p class="text-gray-600 mt-4">
    Your content here with TailwindCSS styling.
  </p>
</div>`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Open the PDF Leaf Editor</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Navigate to the editor and paste your HTML code. The editor provides syntax highlighting
                  and real-time character count.
                </p>
                <Link
                  to="/editor"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Open Editor
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Configure PDF Settings</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Adjust the PDF options according to your needs:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Page Size:</strong> A4, Letter, Legal, or custom sizes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Orientation:</strong> Portrait or Landscape</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Margins:</strong> Top, bottom, left, right in mm or inches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Headers/Footers:</strong> Custom HTML with page numbers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">4</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Preview and Download</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click "Preview" to see how your PDF will look, then "Download PDF" to save your document.
                  The conversion takes just a few seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Best Practices</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Use Fixed Widths</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Instead of responsive classes, use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">max-w-*</code> for
                consistent layouts across all page sizes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Optimize Images</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Use external image URLs instead of base64. Keep images under 1MB for faster processing.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Control Page Breaks</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">avoid-break</code> on elements
                that shouldn't split across pages, like table rows.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Test with Preview</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Always use the preview feature before downloading to catch layout issues early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section id="code-examples" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Code Examples</h2>

          <div className="space-y-8">
            {/* Invoice Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Invoice Template</h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400">invoice.html</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{INVOICE_EXAMPLE}</code>
                </pre>
              </div>
            </div>

            {/* Resume Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Resume Template</h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400">resume.html</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{RESUME_EXAMPLE}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Techniques */}
      <section id="advanced" className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Advanced Techniques</h2>

          <div className="space-y-8">
            {/* Custom Headers/Footers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Custom Headers & Footers</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add custom HTML to headers and footers. Use special CSS counters for page numbers:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`<!-- Footer with page numbers -->
<div style="text-align: center; font-size: 10px; color: #666;">
  Page <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>`}</code>
                </pre>
              </div>
            </div>

            {/* Page Breaks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Page Break Classes</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <code className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded font-mono text-sm">page-break</code>
                  <span className="text-gray-600 dark:text-gray-400">Forces a page break after the element</span>
                </div>
                <div className="flex items-start gap-4">
                  <code className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded font-mono text-sm">page-break-before</code>
                  <span className="text-gray-600 dark:text-gray-400">Forces a page break before the element</span>
                </div>
                <div className="flex items-start gap-4">
                  <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded font-mono text-sm">avoid-break</code>
                  <span className="text-gray-600 dark:text-gray-400">Prevents the element from splitting across pages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Integration */}
      <section id="api-integration" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">API Integration</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Integrate PDF generation into your applications using our REST API. Get your API key from the dashboard.
          </p>

          <div className="space-y-8">
            {/* cURL */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">cURL</span>
              </h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{API_CURL_EXAMPLE}</code>
                </pre>
              </div>
            </div>

            {/* Python */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm font-mono">Python</span>
              </h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{API_PYTHON_EXAMPLE}</code>
                </pre>
              </div>
            </div>

            {/* Node.js */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-sm font-mono">Node.js</span>
              </h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{API_NODE_EXAMPLE}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              View Full API Documentation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
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
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Convert Your TailwindCSS to PDF?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Start converting for free. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              Try the Editor
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:bg-emerald-800"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
