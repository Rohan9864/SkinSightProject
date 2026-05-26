export default function Logo({ size = 'md', className = '', animated = false }) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  }

  const imageClass = sizeMap[size] || sizeMap.md
  const animationClass = animated ? 'animate-pulse' : ''

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="SkinSight logo"
        className={`${imageClass} ${animationClass} rounded-full object-cover`}
      />
    </div>
  )
}
