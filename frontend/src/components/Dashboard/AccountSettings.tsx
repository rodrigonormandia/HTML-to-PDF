import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Profile {
  display_name: string | null
  preferred_language: string
}

export default function AccountSettings() {
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    preferred_language: 'en',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [user])

  async function fetchProfile() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, preferred_language')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          preferred_language: data.preferred_language || 'en',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name || null,
          preferred_language: profile.preferred_language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Update i18n language if changed
      if (profile.preferred_language !== i18n.language) {
        i18n.changeLanguage(profile.preferred_language)
      }

      toast.success(t('dashboard.settingsSaved'))
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function deleteAccount() {
    if (!user) return

    try {
      // Note: This requires a Supabase Edge Function or backend endpoint
      // For now, we'll just sign out and show a message
      toast.info('Account deletion requires contacting support')
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('dashboard.settings')}
        </h2>

        <div className="space-y-4 max-w-md">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('dashboard.displayName')}
            </label>
            <input
              type="text"
              value={profile.display_name || ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder={t('dashboard.displayNamePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('dashboard.language')}
            </label>
            <select
              value={profile.preferred_language}
              onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português (Brasil)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '...' : t('dashboard.saveChanges')}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/50 border border-red-200 dark:border-red-900/50">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          {t('dashboard.dangerZone')}
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('dashboard.deleteAccount')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.deleteWarning')}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('dashboard.deleteAccount')}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('dashboard.confirmDelete')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('dashboard.confirmDeleteMessage')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {t('dashboard.cancel')}
                </button>
                <button
                  onClick={deleteAccount}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('dashboard.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="text-center">
        <button
          onClick={() => {
            signOut()
            toast.success(t('auth.logoutSuccess'))
          }}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  )
}
