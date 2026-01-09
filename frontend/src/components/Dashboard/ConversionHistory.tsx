import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Conversion {
  id: string
  created_at: string
  action: 'preview' | 'download'
  html_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export default function ConversionHistory() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10

  useEffect(() => {
    fetchConversions()
  }, [user, page])

  async function fetchConversions() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('conversions')
        .select('id, created_at, action, html_size, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) throw error

      if (page === 0) {
        setConversions(data || [])
      } else {
        setConversions((prev) => [...prev, ...(data || [])])
      }
      setHasMore((data?.length || 0) === pageSize)
    } catch (error) {
      console.error('Error fetching conversions:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading && conversions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentConversions')}
        </h2>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('dashboard.recentConversions')}
      </h2>

      {conversions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('dashboard.noConversions')}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.date')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.type')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.size')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conversion) => (
                  <tr
                    key={conversion.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(conversion.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          conversion.action === 'download'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {conversion.action === 'download' ? 'Download' : 'Preview'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {conversion.html_size ? formatSize(conversion.html_size) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          conversion.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : conversion.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {conversion.status === 'completed' ? 'Success' : conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {loading ? '...' : t('dashboard.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
