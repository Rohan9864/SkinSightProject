import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';

export default function PatientCasesListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases/my');
      setCases(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load cases');
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
      key: 'bodyArea',
      label: 'Body Area',
      width: '18%',
    },
    {
      key: 'description',
      label: 'Description',
      width: '25%',
      render: (value) => (
        <p className="truncate text-sm text-slate-700">{value}</p>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
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
      width: '15%',
      render: (value) => (
        <button
          onClick={() => navigate(`/patient/cases/${value}`)}
          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-all"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
        {/* Header with Submit Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">All Cases</h1>
            <p className="text-sm text-slate-600 mt-1">
              {cases.length} case{cases.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <button
            onClick={() => navigate('/patient/submit')}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-xl font-semibold shadow hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            Submit New Case
          </button>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {cases.length > 0 ? (
            <DataTable
              columns={caseColumns}
              data={cases}
              searchableFields={['bodyArea', 'description']}
              paginated={true}
              pageSize={15}
            />
          ) : (
            <div className="text-center py-12">
              <DocumentArrowUpIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No cases submitted yet</p>
              <button
                onClick={() => navigate('/patient/submit')}
                className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow"
              >
                Submit Your First Case
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
