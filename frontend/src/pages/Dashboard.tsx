import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import StatsCards from '../components/Dashboard/StatsCards'
import ConversionHistory from '../components/Dashboard/ConversionHistory'
import ApiKeyManager from '../components/Dashboard/ApiKeyManager'
import AccountSettings from '../components/Dashboard/AccountSettings'
import BillingManager from '../components/Dashboard/BillingManager'

type TabId = 'overview' | 'api-keys' | 'billing' | 'settings'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t('dashboard.loginRequired')}</p>
            <Link
              to="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('dashboard.backToHome')}
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: t('dashboard.overview') },
    { id: 'api-keys', label: t('dashboard.apiKeys') },
    { id: 'billing', label: t('billing.title') },
    { id: 'settings', label: t('dashboard.settings') },
  ]

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('dashboard.title')}
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsCards />
            <ConversionHistory />
          </div>
        )}

        {activeTab === 'api-keys' && <ApiKeyManager />}

        {activeTab === 'billing' && <BillingManager />}

        {activeTab === 'settings' && <AccountSettings />}
      </div>
    </Layout>
  )
}
