import { useId } from 'react'

export default function Logo({ size = 'md', showText = true, className = '', animated = false, theme = 'light' }) {
  const id = useId()
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-[10px]' },
    sm: { icon: 'w-8 h-8', text: 'text-sm' },
    md: { icon: 'w-12 h-12', text: 'text-base' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl' },
    '2xl': { icon: 'w-28 h-28', text: 'text-4xl' },
  }

  const config = sizeMap[size] || sizeMap.md
  const animationClass = animated ? 'animate-pulse' : ''
  const gradientId = `circleGrad-${id}`
  const titleClass = theme === 'dark' ? 'text-white' : 'text-slate-800'
  const subtitleClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600'

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        className={`${config.icon} flex-shrink-0 ${animationClass}`}
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="200" r="190" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" />

        <g>
          <path
            d="M 100 120 Q 80 110 85 90 Q 95 75 110 80 Q 125 70 140 85 Q 145 100 135 120"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            opacity="0.9"
          />

          <circle cx="65" cy="105" r="4" fill="#06b6d4" />
          <circle cx="90" cy="75" r="3.5" fill="#0ea5e9" />
          <circle cx="130" cy="75" r="4" fill="#06b6d4" />
          <circle cx="155" cy="100" r="3.5" fill="#0ea5e9" />
          <circle cx="145" cy="135" r="4" fill="#06b6d4" />
          <circle cx="110" cy="155" r="3.5" fill="#0ea5e9" />
          <circle cx="75" cy="140" r="4" fill="#06b6d4" />

          <line x1="65" y1="105" x2="90" y2="75" stroke="#0ea5e9" strokeWidth="2" opacity="0.7" />
          <line x1="90" y1="75" x2="130" y2="75" stroke="#06b6d4" strokeWidth="2" opacity="0.7" />
          <line x1="130" y1="75" x2="155" y2="100" stroke="#0ea5e9" strokeWidth="2" opacity="0.7" />
          <line x1="155" y1="100" x2="145" y2="135" stroke="#06b6d4" strokeWidth="2" opacity="0.7" />
          <line x1="145" y1="135" x2="110" y2="155" stroke="#0ea5e9" strokeWidth="2" opacity="0.7" />
          <line x1="110" y1="155" x2="75" y2="140" stroke="#06b6d4" strokeWidth="2" opacity="0.7" />
          <line x1="75" y1="140" x2="65" y2="105" stroke="#0ea5e9" strokeWidth="2" opacity="0.7" />
          <line x1="110" y1="60" x2="110" y2="170" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
        </g>

        <g>
          <ellipse cx="280" cy="130" rx="40" ry="60" fill="#fed7aa" opacity="0.9" />
          <path d="M 250 80 Q 240 60 260 50 Q 280 45 300 55" fill="#f5deb3" opacity="0.85" />
          <circle cx="270" cy="110" r="3" fill="#1e293b" />
          <path d="M 268 108 Q 268 105 272 105" fill="none" stroke="#1e293b" strokeWidth="1.5" opacity="0.6" />
          <rect x="270" y="180" width="20" height="30" fill="#fed7aa" opacity="0.8" />
          <circle cx="295" cy="145" r="38" fill="none" stroke="#0369a1" strokeWidth="4" opacity="0.95" />
          <line x1="323" y1="173" x2="360" y2="210" stroke="#0369a1" strokeWidth="4" opacity="0.9" />
          <circle cx="295" cy="145" r="35" fill="#fecaca" opacity="0.12" />
          <circle cx="280" cy="130" r="2.5" fill="#fca5a5" opacity="0.95" />
          <circle cx="305" cy="135" r="2" fill="#ef4444" opacity="0.9" />
          <circle cx="290" cy="155" r="2.2" fill="#fca5a5" opacity="0.92" />
          <circle cx="310" cy="150" r="1.8" fill="#ef4444" opacity="0.85" />
          <circle cx="295" cy="168" r="2" fill="#fca5a5" opacity="0.9" />
          <circle cx="275" cy="145" r="1.5" fill="#fed7aa" opacity="0.8" />
          <circle cx="275" cy="125" r="7" fill="white" opacity="0.2" />
        </g>

        <g>
          <line
            x1="155"
            y1="120"
            x2="255"
            y2="120"
            stroke="#06b6d4"
            strokeWidth="2"
            opacity="0.4"
            strokeDasharray="6,4"
          />
        </g>
      </svg>

      {showText && (
        <div className="text-center">
          <div className={`font-bold tracking-tight ${config.text}`}>
            <span className="text-cyan-300">Skin</span>
            <span className={titleClass}>Sight</span>
          </div>
          <p className={`text-xs font-medium ${subtitleClass}`}>
            AI-Powered Skin Disease Screening
          </p>
        </div>
      )}
    </div>
  )
}
