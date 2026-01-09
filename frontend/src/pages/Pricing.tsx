import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { SEO, schemas } from '../components/SEO'

interface Plan {
  id: string
  name: string
  price_monthly: number
  pdfs_per_month: number
  api_keys_limit: number
  features: string[]
  stripe_price_id: string | null
  display_order: number
}

export default function Pricing() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string>('free')

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order')

        if (error) throw error
        setPlans(data || [])
      } catch (error) {
        console.error('Error fetching plans:', error)
        // Fallback to hardcoded plans if DB fetch fails
        setPlans([
          { id: 'free', name: 'Free', price_monthly: 0, pdfs_per_month: 100, api_keys_limit: 3, features: ['noWatermark', 'noExpiration', 'apiAccess'], stripe_price_id: null, display_order: 1 },
          { id: 'starter', name: 'Starter', price_monthly: 1500, pdfs_per_month: 2000, api_keys_limit: 10, features: ['noWatermark', 'noExpiration', 'apiAccess', 'webhooks', 'emailSupport'], stripe_price_id: null, display_order: 2 },
          { id: 'pro', name: 'Pro', price_monthly: 4900, pdfs_per_month: 10000, api_keys_limit: 25, features: ['noWatermark', 'noExpiration', 'apiAccess', 'webhooks', 'prioritySupport', 'customDomain', 'analytics'], stripe_price_id: null, display_order: 3 },
          { id: 'enterprise', name: 'Enterprise', price_monthly: 9900, pdfs_per_month: 50000, api_keys_limit: 100, features: ['noWatermark', 'noExpiration', 'apiAccess', 'webhooks', 'dedicatedSupport', 'customDomain', 'analytics', 'sla', 'sso'], stripe_price_id: null, display_order: 4 },
        ])
      } finally {
        setLoading(false)
      }
    }

    async function fetchUserPlan() {
      if (!user) return
      try {
        const { data } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        if (data?.plan) setUserPlan(data.plan)
      } catch (error) {
        console.error('Error fetching user plan:', error)
      }
    }

    fetchPlans()
    fetchUserPlan()
  }, [user])

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      // For free plan, just redirect to sign up or dashboard
      window.location.href = user ? '/dashboard' : '/'
      return
    }

    if (!user) {
      // Redirect to login/signup if not authenticated
      window.location.href = '/'
      return
    }

    // For paid plans, create Stripe checkout session
    // TODO: Implement Stripe checkout
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          user_id: user.id,
        }),
      })
      const data = await response.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  const isPopular = (planId: string) => planId === 'pro'
  const formatPrice = (cents: number) => (cents / 100).toFixed(0)

  const pricingSchema = schemas.product(
    'PDF Leaf - HTML to PDF Converter Plans',
    'Choose the perfect plan for your PDF generation needs. From free tier to enterprise solutions.',
    [
      { name: 'Free', price: '0' },
      { name: 'Starter', price: '15' },
      { name: 'Pro', price: '49' },
      { name: 'Enterprise', price: '99' },
    ]
  )

  return (
    <Layout>
      <SEO
        title="Pricing Plans - HTML to PDF API"
        description="Choose the perfect PDF Leaf plan. Free tier with 100 PDFs/month, no watermark, no expiration. Paid plans from $15/month with higher limits and priority support."
        path="/pricing"
        jsonLd={pricingSchema}
      />
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 flex flex-col ${
                    isPopular(plan.id)
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                      : 'border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular(plan.id) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {t('pricing.popular')}
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {userPlan === plan.id && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {t('pricing.currentPlan')}
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t(`pricing.plans.${plan.id}.name`)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {t(`pricing.plans.${plan.id}.description`)}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${formatPrice(plan.price_monthly)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('pricing.monthly')}
                      </span>
                    </div>
                  </div>

                  {/* PDFs per month */}
                  <div className="text-center py-3 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.pdfs_per_month.toLocaleString()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      PDFs{t('pricing.monthly')}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="flex-grow space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t(`pricing.features.${feature}`)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={userPlan === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      isPopular(plan.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                        : plan.price_monthly === 0
                        ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                    }`}
                  >
                    {userPlan === plan.id
                      ? t('pricing.currentPlan')
                      : plan.price_monthly === 0
                      ? t('pricing.getStarted')
                      : t('pricing.subscribe')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Comparison with competitors */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {t('pricing.comparison.title')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full max-w-3xl mx-auto text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      {t('pricing.comparison.feature')}
                    </th>
                    <th className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      {t('pricing.comparison.others')}
                    </th>
                    <th className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">
                      PDF Leaf
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {t('pricing.comparison.freePdfs')}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">50/mo</td>
                    <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">100/mo</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {t('pricing.comparison.expiration')}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2 hours</td>
                    <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">{t('pricing.comparison.never')}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">TailwindCSS</td>
                    <td className="py-3 px-4 text-red-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-3 px-4 text-green-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {t('pricing.comparison.watermark')}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{t('pricing.comparison.some')}</td>
                    <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">{t('pricing.comparison.never')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
