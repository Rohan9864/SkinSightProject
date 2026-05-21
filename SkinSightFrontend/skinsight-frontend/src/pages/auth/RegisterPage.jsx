// LOCATION: skinsight-frontend/src/pages/auth/RegisterPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Logo from '../../components/common/Logo'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [done,    setDone]    = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const pw = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/api/auth/register', {
        name:            data.name,
        email:           data.email,
        password:        data.password,
        confirmPassword: data.confirmPassword,
      })
      setDone(true)
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.email
        || 'Registration failed. Please try again.'
      toast.error(typeof msg === 'object'
        ? Object.values(msg)[0] : msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br
        from-slate-900 via-slate-800 to-sky-900
        flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl
          max-w-md w-full p-8 text-center">
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
          <p className="text-slate-500 mb-6 leading-relaxed">
            We sent a verification link to your email address.
            Click the link to activate your account before logging in.
          </p>
          <div className="bg-sky-50 rounded-xl p-4 mb-6
            border border-sky-100">
            <p className="text-sky-700 text-sm font-medium">
              Didn't receive the email? Check your spam folder or
              wait a few minutes.
            </p>
          </div>
          <Link to="/login"
            className="block w-full py-3.5 rounded-xl font-semibold
              text-white bg-gradient-to-r from-sky-500 to-cyan-400
              shadow-lg hover:-translate-y-0.5 transition-all">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden
        bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900
        flex-col items-center justify-center p-12">

        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.8) 1px,transparent 0)',
            backgroundSize: '36px 36px',
          }}/>
        <div className="absolute top-1/4 right-1/4 w-64 h-64
          bg-sky-500/20 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48
          bg-cyan-400/10 rounded-full blur-3xl"/>

        <div className="relative z-10 max-w-sm text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Logo size="lg" showText={true} theme="dark" className="shadow-lg shadow-sky-500/20 rounded-xl bg-white/5 p-1" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Start Your Free Screening Today
          </h2>
          <p className="text-slate-300 leading-relaxed mb-10">
            Join SkinSight and get AI-assisted skin disease screening
            reviewed by licensed dermatologists.
          </p>

          {/* Steps preview */}
          <div className="space-y-4 text-left">
            {[
              { step:'1', text:'Create your free account' },
              { step:'2', text:'Upload a skin lesion photo' },
              { step:'3', text:'Receive AI-powered analysis' },
              { step:'4', text:'Get doctor-reviewed results' },
            ].map(item => (
              <div key={item.step}
                className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br
                  from-sky-500 to-cyan-400 flex items-center justify-center
                  text-white text-xs font-bold flex-shrink-0 shadow">
                  {item.step}
                </div>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center
        px-4 sm:px-8 lg:px-12 bg-white py-12">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center mb-8">
          <Logo size="sm" showText={true} className="shadow-lg shadow-sky-500/20 rounded-lg bg-slate-100/90 p-1" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold
              text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500">
              Free to use. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}
            className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold
                text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5
                  flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0
                         00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border
                    text-slate-900 placeholder-slate-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30
                    focus:border-sky-500 transition-colors
                    ${errors.name
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-rose-500">
                  ⚠ {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold
                text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5
                  flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2
                         0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
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
                <p className="mt-1.5 text-xs text-rose-500">
                  ⚠ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold
                text-slate-700 mb-1.5">Password</label>
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
                  placeholder="Minimum 8 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border
                    text-slate-900 placeholder-slate-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30
                    focus:border-sky-500 transition-colors
                    ${errors.password
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3.5
                    flex items-center text-slate-400 hover:text-slate-600">
                  {showPw
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500">
                  ⚠ {errors.password.message}
                </p>
              )}
              {/* Strength indicator */}
              {pw && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(n => (
                    <div key={n}
                      className={`h-1 flex-1 rounded-full transition-colors
                        ${pw.length >= n * 3
                          ? n <= 1 ? 'bg-rose-400'
                          : n <= 2 ? 'bg-amber-400'
                          : n <= 3 ? 'bg-sky-400'
                          : 'bg-emerald-400'
                          : 'bg-slate-200'}`}/>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold
                text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5
                  flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0
                         0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02
                         12.02 0 003 9c0 5.591 3.824 10.29 9 11.622
                         5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <input
                  type={showCpw ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: v => v === pw || 'Passwords do not match',
                  })}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border
                    text-slate-900 placeholder-slate-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-sky-500/30
                    focus:border-sky-500 transition-colors
                    ${errors.confirmPassword
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'}`}
                />
                <button type="button" onClick={() => setShowCpw(!showCpw)}
                  className="absolute inset-y-0 right-0 pr-3.5
                    flex items-center text-slate-400 hover:text-slate-600">
                  {showCpw
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-500">
                  ⚠ {errors.confirmPassword.message}
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
                justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none"
                    viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"/>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-slate-400">
                Already have an account?
              </span>
            </div>
          </div>

          <Link to="/login"
            className="block w-full text-center py-3.5 rounded-xl
              font-semibold text-slate-700 border-2 border-slate-200
              hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50
              transition-all duration-200">
            Sign In Instead
          </Link>

          <p className="mt-6 text-center text-xs text-slate-400">
            By creating an account you agree to our{' '}
            <a href="#" className="text-sky-600 hover:underline">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}