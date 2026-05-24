import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';

export default function DoctorCasesHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchCasesHistory();
  }, []);

  const fetchCasesHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases/assigned/my');
      // Filter for RELEASED cases (completed/handled cases)
      const completedCases = (response.data || []).filter(
        (c) => c.status === 'RELEASED'
      );
      // Sort by most recent first
      completedCases.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setCases(completedCases);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load cases history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Table columns
  const caseColumns = [
    {
      key: 'id',
      label: 'Case ID',
      width: '12%',
      render: (value) => `#${value}`,
    },
    {
      key: 'patientName',
      label: 'Patient Name',
      width: '20%',
    },
    {
      key: 'bodyArea',
      label: 'Body Area',
      width: '15%',
    },
    {
      key: 'diagnosisResult',
      label: 'AI Prediction',
      width: '18%',
      render: (value) =>
        value?.predictedClass ? (
          <span className="text-sm font-semibold text-slate-700">
            {value.predictedClass}
          </span>
        ) : (
          <span className="text-xs text-slate-500">-</span>
        ),
    },
    {
      key: 'diagnosisResult',
      label: 'Severity',
      width: '12%',
      render: (value) => {
        if (!value?.severityLevel) return <span className="text-xs text-slate-500">-</span>;
        const colors = {
          MILD: 'bg-emerald-100 text-emerald-700',
          MODERATE: 'bg-amber-100 text-amber-700',
          SEVERE: 'bg-rose-100 text-rose-700',
        };
        return (
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
              colors[value.severityLevel]
            }`}
          >
            {value.severityLevel}
          </span>
        );
      },
    },
    {
      key: 'updatedAt',
      label: 'Completed',
      width: '15%',
      render: (value) =>
        new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'id',
      label: 'Action',
      width: '8%',
      render: (value) => (
        <button
          onClick={() => navigate(`/doctor/cases/${value}`)}
          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-all"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-800">Cases History</h1>
        </div>
        <p className="text-sm text-slate-600">
          {cases.length} completed case{cases.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Total Completed
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{cases.length}</p>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl border border-sky-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-sky-600" />
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">
              Avg Processing Time
            </span>
          </div>
          <p className="text-2xl font-bold text-sky-900">
            {cases.length > 0
              ? Math.round(
                  cases.reduce((sum, c) => {
                    const submitted = new Date(c.submittedAt);
                    const released = new Date(c.updatedAt);
                    const days = (released - submitted) / (1000 * 60 * 60 * 24);
                    return sum + days;
                  }, 0) / cases.length
                )
              : 0}{' '}
            days
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border border-violet-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
              This Month
            </span>
          </div>
          <p className="text-2xl font-bold text-violet-900">
            {
              cases.filter(
                (c) =>
                  new Date(c.updatedAt).getMonth() === new Date().getMonth() &&
                  new Date(c.updatedAt).getFullYear() === new Date().getFullYear()
              ).length
            }
          </p>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Completed Cases
        </h2>
        {cases.length > 0 ? (
          <DataTable
            columns={caseColumns}
            data={cases}
            searchableFields={['patientName', 'bodyArea']}
            paginated={true}
            pageSize={15}
          />
        ) : (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No completed cases yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
