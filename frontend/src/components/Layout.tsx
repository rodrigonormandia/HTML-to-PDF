import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './Auth/AuthModal'
import { LanguageSelector } from './LanguageSelector'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = () => {
    signOut()
    toast.success(t('auth.logoutSuccess'))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="PDF Leaf Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
              <p className="text-gray-500 dark:text-gray-400">{t('app.subtitle')}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm transition-colors ${
                isActive('/')
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/editor"
              className={`px-3 py-1.5 text-sm transition-colors ${
                isActive('/editor')
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('nav.editor')}
            </Link>
            <Link
              to="/pricing"
              className={`px-3 py-1.5 text-sm transition-colors ${
                isActive('/pricing')
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('nav.pricing')}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {t('dashboard.title')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {t('auth.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {t('auth.login')}
              </button>
            )}
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
              title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            >
              {theme === 'dark' ? (
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('footer.apiDocs')}
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('footer.apiRedoc')}
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href="/privacy.html"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('legal.privacy')}
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href="/terms.html"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          >
            {t('legal.terms')}
          </a>
        </div>
        <div>&copy; {new Date().getFullYear()} PDF Leaf v1.12.0 | {t('footer.developer')}</div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}
