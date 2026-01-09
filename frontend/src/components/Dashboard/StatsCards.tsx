import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Stats {
  conversionsThisMonth: number
  remainingConversions: number
  activeApiKeys: number
  currentPlan: string
}

export default function StatsCards() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    conversionsThisMonth: 0,
    remainingConversions: 100,
    activeApiKeys: 0,
    currentPlan: 'free',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!user) return

      try {
        // Get conversions this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: conversionsCount } = await supabase
          .from('conversions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())

        // Get active API keys
        const { count: apiKeysCount } = await supabase
          .from('api_keys')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true)

        // Get profile info (plan and monthly_limit are in profiles table)
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, monthly_limit')
          .eq('id', user.id)
          .single()

        const monthlyLimit = profile?.monthly_limit || 100
        const planName = profile?.plan || 'free'

        setStats({
          conversionsThisMonth: conversionsCount || 0,
          remainingConversions: Math.max(0, monthlyLimit - (conversionsCount || 0)),
          activeApiKeys: apiKeysCount || 0,
          currentPlan: planName,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const cards = [
    {
      label: t('dashboard.conversionsThisMonth'),
      value: stats.conversionsThisMonth,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      label: t('dashboard.remaining'),
      value: stats.remainingConversions,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: t('dashboard.activeKeys'),
      value: stats.activeApiKeys,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      label: t('dashboard.currentPlan'),
      value: stats.currentPlan.charAt(0).toUpperCase() + stats.currentPlan.slice(1),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'amber',
    },
  ]

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
    },
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
            <div className={`p-2 rounded-lg ${colorClasses[card.color].bg}`}>
              <span className={colorClasses[card.color].icon}>{card.icon}</span>
            </div>
          </div>
          <div className={`text-2xl font-bold ${colorClasses[card.color].text}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
