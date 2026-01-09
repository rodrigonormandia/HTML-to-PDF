import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export default function ApiKeyManager() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [user])

  async function fetchApiKeys() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, created_at, last_used_at, is_active')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createApiKey() {
    if (!user || !newKeyName.trim()) return

    setCreating(true)
    try {
      // Generate a random API key
      const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`
      const keyPrefix = rawKey.substring(0, 12)

      // Hash the key for storage
      const encoder = new TextEncoder()
      const data = encoder.encode(rawKey)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        name: newKeyName.trim(),
        key_hash: keyHash,
        key_prefix: keyPrefix,
        is_active: true,
      })

      if (error) throw error

      setNewlyCreatedKey(rawKey)
      setNewKeyName('')
      setShowCreateForm(false)
      toast.success(t('dashboard.keyCreated'))
      fetchApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  async function revokeApiKey(keyId: string) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success(t('dashboard.keyRevoked'))
      fetchApiKeys()
    } catch (error) {
      console.error('Error revoking API key:', error)
      toast.error('Failed to revoke API key')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success(t('dashboard.keyCopied'))
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('dashboard.keyCreated')}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-2 rounded text-sm font-mono text-yellow-900 dark:text-yellow-100 break-all">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="px-3 py-2 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                >
                  {t('dashboard.copyKey')}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.apiKeys')}
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.createApiKey')}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('dashboard.keyName')}
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={createApiKey}
                disabled={creating || !newKeyName.trim()}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? '...' : t('dashboard.create')}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewKeyName('')
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
              >
                {t('dashboard.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Keys Table */}
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('dashboard.noApiKeys')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.keyName')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Key
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.created')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.status')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {key.name}
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {key.key_prefix}...
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          key.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {key.is_active && (
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          {t('dashboard.revokeKey')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
