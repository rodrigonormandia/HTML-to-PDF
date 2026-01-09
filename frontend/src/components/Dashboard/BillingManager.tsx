import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

interface SubscriptionStatus {
  plan: string
  status: string
  monthly_limit: number
  current_period_end?: number
}

export default function BillingManager() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/stripe/subscription/${user.id}`)
        const data = await response.json()
        setSubscription(data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setSubscription({
          plan: 'free',
          status: 'active',
          monthly_limit: 100,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const handleManageBilling = async () => {
    if (!user) return

    setPortalLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/stripe/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await response.json()
      if (data.portal_url) {
        window.location.href = data.portal_url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
      case 'past_due':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'text-gray-600 dark:text-gray-400'
      case 'starter':
        return 'text-blue-600 dark:text-blue-400'
      case 'pro':
        return 'text-purple-600 dark:text-purple-400'
      case 'enterprise':
        return 'text-amber-600 dark:text-amber-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('billing.currentPlan')}
        </h3>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`text-3xl font-bold capitalize ${getPlanColor(subscription?.plan || 'free')}`}>
              {subscription?.plan || 'Free'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subscription?.monthly_limit?.toLocaleString()} PDFs{t('pricing.monthly')}
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.status || 'active')}`}>
              {t(`billing.${subscription?.status}`) || subscription?.status}
            </span>
            {subscription?.current_period_end && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('billing.nextBilling')}: {formatDate(subscription.current_period_end)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {subscription?.plan === 'free' ? (
            <Link
              to="/pricing"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('billing.upgrade')}
            </Link>
          ) : (
            <>
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {portalLoading ? '...' : t('billing.manageBilling')}
              </button>
              <Link
                to="/pricing"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                {t('billing.upgrade')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('pricing.comparison.title')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">PDFs/mo</th>
                <th className="py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className={`border-b border-gray-100 dark:border-gray-800 ${subscription?.plan === 'free' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">Free</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">100</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">$0</td>
              </tr>
              <tr className={`border-b border-gray-100 dark:border-gray-800 ${subscription?.plan === 'starter' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">Starter</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">2,000</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">$15/mo</td>
              </tr>
              <tr className={`border-b border-gray-100 dark:border-gray-800 ${subscription?.plan === 'pro' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">Pro</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">10,000</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">$49/mo</td>
              </tr>
              <tr className={`${subscription?.plan === 'enterprise' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">Enterprise</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">50,000</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">$99/mo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/pricing"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {t('pricing.comparison.title')} →
          </Link>
        </div>
      </div>
    </div>
  )
}
