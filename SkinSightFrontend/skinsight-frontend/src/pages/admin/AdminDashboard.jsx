import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentArrowUpIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [casesRes, patientsRes, doctorsRes, auditRes] = await Promise.all([
        api.get('/api/cases'),
        api.get('/api/users/patients'),
        api.get('/api/users/doctors'),
        api.get('/api/audit-logs'),
      ]);

      // Sort cases by submittedAt in descending order (latest first)
      const sortedCases = (casesRes.data || []).sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      setCases(sortedCases);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setAuditLogs((auditRes.data || []).slice(0, 8));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Calculate stats
  const totalCases = cases.length;
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;

  const today = new Date().toDateString();
  const releasedToday = cases.filter(
    (c) => c.status === 'RELEASED' && new Date(c.updatedAt).toDateString() === today
  ).length;

  // Case status distribution
  const statusData = [
    { name: 'Pending', value: cases.filter((c) => c.status === 'PENDING').length, fill: '#fbbf24' },
    { name: 'Under Review', value: cases.filter((c) => c.status === 'UNDER_REVIEW').length, fill: '#3b82f6' },
    { name: 'Released', value: cases.filter((c) => c.status === 'RELEASED').length, fill: '#10b981' },
  ].filter((item) => item.value > 0);

  // Unassigned cases
  const unassignedCases = cases.filter(
    (c) => c.status === 'PENDING' && !c.assignedDoctorId && !c.assignedDoctorName
  );

  // Doctor workload
  const doctorWorkload = {};
  cases.forEach((c) => {
    if (c.assignedDoctorName) {
      doctorWorkload[c.assignedDoctorName] = (doctorWorkload[c.assignedDoctorName] || 0) + 1;
    }
  });

  const workloadChartData = Object.entries(doctorWorkload)
    .map(([name, count]) => ({
      name,
      cases: count,
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 8);

  // Cases table columns
  const caseColumns = [
    {
      key: 'id',
      label: 'Case ID',
      width: '12%',
      render: (value) => `#${value}`,
    },
    {
      key: 'patientName',
      label: 'Patient',
      width: '18%',
    },
    {
      key: 'assignedDoctorName',
      label: 'Doctor',
      width: '18%',
      render: (value) => value || <span className="text-xs text-slate-400">Unassigned</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'diagnosisResult',
      label: 'AI Result',
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
      key: 'submittedAt',
      label: 'Date',
      width: '12%',
      render: (value) =>
        new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
    },
  ];

  return (
      <div className="space-y-6">
        {/* ROW 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Cases"
            value={totalCases}
            icon={DocumentArrowUpIcon}
            color="sky"
          />
          <StatCard
            title="Total Patients"
            value={totalPatients}
            icon={UsersIcon}
            color="emerald"
          />
          <StatCard
            title="Total Doctors"
            value={totalDoctors}
            icon={UsersIcon}
            color="violet"
          />
          <StatCard
            title="Released Today"
            value={releasedToday}
            icon={CheckCircleIcon}
            color="amber"
          />
        </div>

        {/* ROW 2: Status Overview + Unassigned + Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Case Status Overview (40%) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Case Status Overview
            </h2>
            {statusData.length > 0 ? (
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <p className="text-slate-500 text-center text-sm">No cases yet.</p>
              </div>
            )}
          </div>

          {/* Middle: Unassigned Cases Alert (30%) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Unassigned Cases</h2>
              {unassignedCases.length > 0 && (
                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
                  {unassignedCases.length}
                </span>
              )}
            </div>

            {unassignedCases.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {unassignedCases.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">
                        Case #{c.id}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{c.patientName}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/cases/${c.id}`)}
                      className="px-2 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600 transition-all flex-shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {unassignedCases.length > 5 && (
                  <button
                    onClick={() => navigate('/admin/all-cases')}
                    className="w-full text-center py-2.5 text-sky-600 hover:text-sky-700 font-semibold text-sm border-t border-slate-200 mt-2 transition-all hover:bg-sky-50 rounded"
                  >
                    See More ({unassignedCases.length - 5} more) →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">All cases assigned!</p>
              </div>
            )}
          </div>

          {/* Right: Recent Audit Logs (30%) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
            {auditLogs.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {auditLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-sky-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {log.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        by {log.performedByName}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(log.performedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No activity yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: All Cases Table + Doctor Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: All Cases Table (70%) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">All Cases</h2>
            <DataTable
              columns={caseColumns}
              data={cases}
              searchableFields={['patientName', 'bodyArea']}
              paginated={true}
              pageSize={10}
            />
          </div>

          {/* Right: Doctor Workload Chart (30%) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Doctor Workload</h2>
            {workloadChartData.length > 0 ? (
              <div className="h-96 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workloadChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="cases"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-slate-500 text-center text-sm">
                  No assigned cases yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}