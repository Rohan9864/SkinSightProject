const colorConfig = {
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    icon: 'text-sky-600',
    value: 'text-sky-700',
    accent: 'border-l-4 border-sky-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    value: 'text-emerald-700',
    accent: 'border-l-4 border-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    value: 'text-amber-700',
    accent: 'border-l-4 border-amber-500',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    value: 'text-rose-700',
    accent: 'border-l-4 border-rose-500',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    icon: 'text-violet-600',
    value: 'text-violet-700',
    accent: 'border-l-4 border-violet-500',
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'sky',
  trend = null, // { direction: 'up' | 'down', percent: number }
  subtext = null,
}) {
  const config = colorConfig[color] || colorConfig.sky;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-2xl p-6 ${config.accent} transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${config.value}`}>{value}</p>
          {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
          {trend && (
            <div className={`text-xs font-semibold mt-2 ${trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percent}%
            </div>
          )}
        </div>
        {Icon && <Icon className={`w-12 h-12 ${config.icon} opacity-50`} />}
      </div>
    </div>
  );
}
