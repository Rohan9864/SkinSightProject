import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';

export default function AdminAllCasesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [filterAssignment, setFilterAssignment] = useState(''); // '' = all, 'assigned', 'unassigned'

  useEffect(() => {
    fetchAllCases();
  }, []);

  const fetchAllCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases');
      setCases(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load cases');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter cases based on assignment status
  const filteredCases = filterAssignment
    ? cases.filter((c) => {
        if (filterAssignment === 'assigned') return c.assignedDoctorName;
        if (filterAssignment === 'unassigned') return !c.assignedDoctorName;
        return true;
      })
    : cases;

  const assignedCount = cases.filter((c) => c.assignedDoctorName).length;
  const unassignedCount = cases.filter((c) => !c.assignedDoctorName).length;

  if (loading) return <LoadingSpinner />;

  const caseColumns = [
    {
      key: 'id',
      label: 'Case ID',
      width: '10%',
      render: (value) => `#${value}`,
    },
    {
      key: 'patientName',
      label: 'Patient',
      width: '15%',
    },
    {
      key: 'bodyArea',
      label: 'Body Area',
      width: '12%',
    },
    {
      key: 'assignedDoctorName',
      label: 'Assigned Doctor',
      width: '15%',
      render: (value) => value || 'Unassigned',
    },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'diagnosisResult',
      label: 'AI Result',
      width: '15%',
      render: (value) => {
        if (!value) return '-';
        const predictedClass = value.predictedClass || value.class;
        return (
          <span className="text-sm font-semibold text-slate-700">
            {predictedClass}
          </span>
        );
      },
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
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
      width: '9%',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/admin/cases/${value}`)}
          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-all"
        >
          {row.status === 'UNDER_REVIEW' && !row.assignedDoctorName ? 'Assign' : 'View'}
        </button>
      ),
    },
  ];

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Cases</h1>
          <p className="text-sm text-slate-600 mt-1">
            {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} 
            {filterAssignment && ` (${filterAssignment})`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Assignment Status</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterAssignment('')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !filterAssignment
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Cases ({cases.length})
            </button>
            <button
              onClick={() => setFilterAssignment('assigned')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterAssignment === 'assigned'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => setFilterAssignment('unassigned')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterAssignment === 'unassigned'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unassigned ({unassignedCount})
            </button>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {filteredCases.length > 0 ? (
            <DataTable
              columns={caseColumns}
              data={filteredCases}
              searchableFields={['patientName', 'bodyArea']}
              paginated={true}
              pageSize={15}
            />
          ) : (
            <div className="text-center py-12">
              <DocumentCheckIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No cases found</p>
            </div>
          )}
        </div>
      </div>
  );
}
