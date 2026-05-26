import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';

export default function DoctorAssignedCasesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchAssignedCases();
  }, []);

  const fetchAssignedCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases/assigned/my');
      // Filter for cases that are not yet completed (status !== RELEASED)
      const pendingCases = (response.data || []).filter(
        (c) => c.status !== 'RELEASED'
      );
      // Sort by most recent first
      pendingCases.sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      setCases(pendingCases);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load assigned cases');
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
      width: '10%',
      render: (value) => `#${value}`,
    },
    {
      key: 'patientName',
      label: 'Patient Name',
      width: '18%',
    },
    {
      key: 'bodyArea',
      label: 'Body Area',
      width: '15%',
    },
    {
      key: 'status',
      label: 'Status',
      width: '14%',
      render: (value) => <StatusBadge status={value} />,
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
          <span className="text-xs text-slate-500">Pending</span>
        ),
    },
    {
      key: 'diagnosisResult',
      label: 'Severity',
      width: '14%',
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
      key: 'submittedAt',
      label: 'Assigned',
      width: '12%',
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
      width: '13%',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/doctor/cases/${value}`)}
          disabled={row.status === 'RELEASED'}
          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {row.status === 'RELEASED' ? 'View' : 'Review'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ClipboardDocumentCheckIcon className="w-8 h-8 text-sky-600" />
          <h1 className="text-2xl font-bold text-slate-800">Assigned Cases</h1>
        </div>
        <p className="text-sm text-slate-600">
          {cases.length} active assigned case{cases.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
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
            <ClipboardDocumentCheckIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No cases assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
