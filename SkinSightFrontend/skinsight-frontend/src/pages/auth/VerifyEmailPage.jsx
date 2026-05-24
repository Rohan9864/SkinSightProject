import { useSearchParams, Link } from 'react-router-dom'
import Logo from '../../components/common/Logo'

const SCENARIOS = {
  success: {
    icon: (
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
    ),
    color: 'emerald',
    title: 'Email Verified!',
    message: 'Your email address has been successfully verified. Your SkinSight account is now active and ready to use.',
    btnLabel: 'Continue to Sign In',
    btnTo: '/login',
    btnStyle: 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:shadow-emerald-500/50',
    extra: null,
  },

  'already-used': {
    icon: (
      <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
    ),
    color: 'sky',
    title: 'Already Verified',
    message: 'This email address has already been verified. You can sign in to your account right away.',
    btnLabel: 'Go to Sign In',
    btnTo: '/login',
    btnStyle: 'bg-gradient-to-r from-sky-500 to-cyan-400 hover:shadow-sky-500/50',
    extra: null,
  },

  expired: {
    icon: (
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
    ),
    color: 'amber',
    title: 'Link Expired',
    message: 'This verification link has expired. Email verification links are valid for 24 hours. Please register again to receive a new link.',
    btnLabel: 'Register Again',
    btnTo: '/register',
    btnStyle: 'bg-gradient-to-r from-amber-500 to-orange-400 hover:shadow-amber-500/50',
    extra: (
      <p className="text-slate-400 text-sm mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-sky-400 font-medium hover:text-sky-300 transition-colors">
          Sign in here
        </Link>
      </p>
    ),
  },

  invalid: {
    icon: (
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
    ),
    color: 'rose',
    title: 'Invalid Link',
    message: 'This verification link is invalid or has already been used. Please register again or contact support if you believe this is an error.',
    btnLabel: 'Go to Register',
    btnTo: '/register',
    btnStyle: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:shadow-rose-500/50',
    extra: (
      <p className="text-slate-400 text-sm mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-sky-400 font-medium hover:text-sky-300 transition-colors">
          Sign in here
        </Link>
      </p>
    ),
  },
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const status = params.get('status') || 'invalid'
  const scenario = SCENARIOS[status] || SCENARIOS.invalid

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Animated blobs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"/>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"/>

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-2xl px-8 py-12 text-center border border-slate-700/50">
          
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Logo size="lg" animated={true} theme="light" />
          </div>

          {/* Icon */}
          <div className="mb-6">
            {scenario.icon}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            {scenario.title}
          </h1>

          {/* Message */}
          <p className="text-slate-300 leading-relaxed mb-8 text-base">
            {scenario.message}
          </p>

          {/* Primary button */}
          <Link to={scenario.btnTo}
            className={`block w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${scenario.btnStyle}`}>
            {scenario.btnLabel}
          </Link>

          {/* Secondary link */}
          {scenario.extra}
        </div>

        {/* Bottom link back to landing */}
        <div className="text-center mt-6">
          <Link to="/"
            className="text-slate-400 text-sm hover:text-slate-300 transition-colors">
            ← Back to SkinSight
          </Link>
        </div>
      </div>
    </div>
  )
}
