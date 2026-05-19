import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

export default function CaseCard({ caseData, onView }) {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView(caseData);
    } else {
      navigate(`/patient/cases/${caseData.id}`);
    }
  };

  const submittedDate = new Date(caseData.submittedAt).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Case #{caseData.id}
          </p>
          <p className="text-sm text-slate-600 mt-1">{caseData.bodyArea}</p>
        </div>
        <StatusBadge status={caseData.status} />
      </div>

      <div className="border-t border-slate-100 pt-4 mb-4">
        <p className="text-xs text-slate-500">Submitted</p>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          {submittedDate}
        </p>
      </div>

      <button
        onClick={handleView}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow"
      >
        View Details <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
