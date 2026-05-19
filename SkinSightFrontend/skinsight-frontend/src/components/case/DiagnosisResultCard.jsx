const severityConfig = {
  MILD: {
    badge: 'bg-emerald-100 text-emerald-700',
    icon: '✓',
    bar: 'bg-emerald-500',
    message: 'Low risk — routine monitoring recommended',
  },
  MODERATE: {
    badge: 'bg-amber-100 text-amber-700',
    icon: '!',
    bar: 'bg-amber-500',
    message: 'Moderate risk — clinical evaluation advised',
  },
  SEVERE: {
    badge: 'bg-rose-100 text-rose-700',
    icon: '⚠',
    bar: 'bg-rose-500',
    message: 'High risk — urgent referral recommended',
  },
};

export default function DiagnosisResultCard({ diagnosisResult }) {
  if (!diagnosisResult) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
        <p className="text-slate-500 text-sm">No diagnosis available yet.</p>
      </div>
    );
  }

  const config = severityConfig[diagnosisResult.severityLevel] || severityConfig.MILD;
  const severityPercent = (diagnosisResult.severityScore || 0) * 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      {/* Predicted Class */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          AI Prediction
        </p>
        <p className="text-3xl font-bold text-sky-600">
          {diagnosisResult.predictedClass}
        </p>
      </div>

      {/* Severity */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Severity Level
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}
          >
            {diagnosisResult.severityLevel}
          </span>
        </div>

        {/* Severity Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full ${config.bar}`}
            style={{ width: `${severityPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Score: {severityPercent.toFixed(1)}%
        </p>

        {/* Severity Message */}
        <p className="text-sm text-slate-600 italic">{config.message}</p>
      </div>
    </div>
  );
}
