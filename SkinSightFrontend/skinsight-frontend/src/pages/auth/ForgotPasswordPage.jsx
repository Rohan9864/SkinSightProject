import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Logo from '../../components/common/Logo'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailSent, setEmailSent] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const emailValue = watch('email')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', {
        email: data.email,
      })
      setEmailSent(data.email)
      setSubmitted(true)
      toast.success('Password reset link sent to your email!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
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
            Reset Your Password
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-10">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div className="space-y-3 text-left">
            {[
              'Secure password reset link',
              'Valid for 1 hour',
              'No password change if token expired',
              'Request a new link if needed',
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
          {!submitted ? (
            <>
              <div className="mb-8">
                <Link to="/login"
                  className="inline-flex items-center gap-1 text-sky-600
                    hover:text-sky-700 font-medium text-sm mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                  Back to Sign In
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-slate-500">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold
                    text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5
                      flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border
                        text-slate-900 placeholder-slate-400 text-sm
                        focus:outline-none focus:ring-2 focus:ring-sky-500/30
                        focus:border-sky-500 transition-colors
                        ${errors.email
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                      <span>⚠</span> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !emailValue}
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
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                Remember your password?{' '}
                <Link to="/login"
                  className="text-sky-600 hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100
                  flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-emerald-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-slate-500 mb-4">
                  We sent a password reset link to <strong>{emailSent}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                  <p className="text-sky-700 text-sm">
                    <span className="font-semibold">Next Step:</span> Click the link in your email to reset your password. The link expires in 1 hour.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-amber-700 text-sm">
                    <span className="font-semibold">Didn't receive it?</span> Check your spam folder or request a new link below.
                  </p>
                </div>

                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full py-3.5 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-sky-500 to-cyan-400
                    shadow-lg hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-200">
                  Request New Link
                </button>

                <Link to="/login"
                  className="block w-full text-center py-3.5 rounded-xl
                    font-medium text-slate-700 border-2 border-slate-200
                    hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50
                    transition-all">
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
