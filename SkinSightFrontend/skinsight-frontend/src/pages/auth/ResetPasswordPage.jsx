import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Logo from '../../components/common/Logo'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const pw = watch('password')

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', {
        token: token,
        newPassword: data.password,
      })
      toast.success('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900
        flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100
            flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-rose-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-slate-500 mb-6">
            The password reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/forgot-password"
            className="inline-block w-full py-3.5 rounded-xl font-semibold text-white
              bg-gradient-to-r from-sky-500 to-cyan-400 shadow-lg
              hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden
        bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900
        flex-col items-center justify-center p-12">

        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.8) 1px,transparent 0)',
            backgroundSize: '36px 36px',
          }}/>

        <div className="absolute top-1/4 right-1/4 w-64 h-64
          bg-sky-500/20 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48
          bg-cyan-400/15 rounded-full blur-3xl"/>

        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Logo size="lg" showText={true} theme="dark" className="shadow-lg shadow-sky-500/20 rounded-xl bg-white/5 p-1" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Create a New Password
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-10">
            Enter a strong password that you haven't used with other accounts.
          </p>

          <div className="space-y-3 text-left">
            {[
              'At least 8 characters long',
              'Mix of uppercase and lowercase',
              'Include numbers and symbols',
              'Different from your old password',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20
                  border border-emerald-500/40 flex items-center
                  justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center
        px-4 sm:px-8 lg:px-12 bg-white">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center mb-8">
          <Logo size="sm" showText={true} className="shadow-lg shadow-sky-500/20 rounded-lg bg-slate-100/90 p-1" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-500">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold
                text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5
                  flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2
                         2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border
                    text-slate-900 placeholder-slate-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30
                    focus:border-sky-500 transition-colors
                    ${errors.password
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                />
                <button type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3.5
                    flex items-center text-slate-400 hover:text-slate-600
                    transition-colors">
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                           0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3
                           3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88
                           9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
                           3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943
                           9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                           8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                           7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold
                text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5
                  flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2
                         2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showCpw ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === pw || 'Passwords do not match',
                  })}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border
                    text-slate-900 placeholder-slate-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30
                    focus:border-sky-500 transition-colors
                    ${errors.confirmPassword
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                />
                <button type="button"
                  onClick={() => setShowCpw(!showCpw)}
                  className="absolute inset-y-0 right-0 pr-3.5
                    flex items-center text-slate-400 hover:text-slate-600
                    transition-colors">
                  {showCpw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                           0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3
                           3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88
                           9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
                           3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943
                           9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                           8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                           7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <span>⚠</span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white
                bg-gradient-to-r from-sky-500 to-cyan-400
                shadow-lg shadow-sky-200 hover:shadow-sky-300
                hover:-translate-y-0.5 disabled:opacity-60
                disabled:cursor-not-allowed disabled:translate-y-0
                transition-all duration-200 flex items-center
                justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Remember your password?{' '}
            <Link to="/login"
              className="text-sky-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
