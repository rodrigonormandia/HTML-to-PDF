import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'signup'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupComplete, setSignupComplete] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
      setMode('login')
      setSignupComplete(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError(t('auth.passwordMismatch'))
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError(t('auth.weakPassword'))
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password)
        if (error) {
          if (error.message.includes('already registered')) {
            setError(t('auth.emailInUse'))
          } else {
            setError(error.message)
          }
        } else {
          setSignupComplete(true)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(t('auth.invalidCredentials'))
        } else {
          toast.success(t('auth.loginSuccess'))
          onClose()
        }
      }
    } catch {
      setError(t('auth.genericError'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? t('auth.login') : t('auth.signup')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setMode('login')}
            className={mode === 'login'
              ? 'flex-1 py-3 text-sm font-medium transition-colors text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'flex-1 py-3 text-sm font-medium transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => setMode('signup')}
            className={mode === 'signup'
              ? 'flex-1 py-3 text-sm font-medium transition-colors text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
              : 'flex-1 py-3 text-sm font-medium transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          >
            {t('auth.signup')}
          </button>
        </div>
        {signupComplete ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('auth.checkEmailTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('auth.checkEmailMessage', { email })}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              {t('auth.understood')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="********"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="********"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? t('auth.loading') : (mode === 'login' ? t('auth.login') : t('auth.signup'))}
          </button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {mode === 'login' ? (
              <>
                {t('auth.noAccount')}{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  {t('auth.signup')}
                </button>
              </>
            ) : (
              <>
                {t('auth.hasAccount')}{' '}
                <button type="button" onClick={() => setMode('login')} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  {t('auth.login')}
                </button>
              </>
            )}
          </p>
        </form>
        )}
      </div>
    </div>
  )
}
