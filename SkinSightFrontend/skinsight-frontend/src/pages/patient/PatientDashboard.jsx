import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, notificationsRes] = await Promise.all([
        api.get('/api/cases/my'),
        api.get('/api/notifications/my'),
      ]);
      setCases(casesRes.data || []);
      setNotifications(notificationsRes.data || []);
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
  const pendingCount = cases.filter((c) => c.status === 'PENDING').length;
  const underReviewCount = cases.filter((c) => c.status === 'UNDER_REVIEW').length;
  const releasedCount = cases.filter((c) => c.status === 'RELEASED').length;

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Pending', value: pendingCount, fill: '#fbbf24' },
    { name: 'Under Review', value: underReviewCount, fill: '#3b82f6' },
    { name: 'Released', value: releasedCount, fill: '#10b981' },
  ].filter((item) => item.value > 0);

  // Recent cases (last 5)
  const recentCases = cases.slice(0, 5);

  // Table columns
  const caseColumns = [
    {
      key: 'id',
      label: 'Case ID',
      width: '15%',
      render: (value) => `#${value}`,
    },
    { key: 'bodyArea', label: 'Body Area', width: '20%' },
    {
      key: 'status',
      label: 'Status',
      width: '20%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted Date',
      width: '25%',
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
      width: '20%',
      render: (value) => (
        <button
          onClick={() => navigate(`/patient/cases/${value}`)}
          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-all"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Patient Dashboard">
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
            title="Pending"
            value={pendingCount}
            icon={DocumentArrowUpIcon}
            color="amber"
          />
          <StatCard
            title="Under Review"
            value={underReviewCount}
            icon={DocumentArrowUpIcon}
            color="sky"
          />
          <StatCard
            title="Released"
            value={releasedCount}
            icon={DocumentArrowUpIcon}
            color="emerald"
          />
        </div>

        {/* ROW 2: Recent Cases + Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Cases Table (60%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Recent Cases
              </h2>
              {recentCases.length > 0 ? (
                <DataTable
                  columns={caseColumns}
                  data={recentCases}
                  searchable={false}
                  paginated={false}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">No cases submitted yet.</p>
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

          {/* Right: Status Distribution Chart (40%) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Status Distribution
            </h2>
            {statusDistribution.length > 0 ? (
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} case${value !== 1 ? 's' : ''}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-500 text-center">
                  No cases yet. Submit your first case to see the distribution.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Notifications Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Notifications
            </h2>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    await api.patch('/api/notifications/my/read-all');
                    fetchData();
                  } catch (error) {
                    toast.error('Failed to mark notifications as read');
                  }
                }}
                className="text-sm text-sky-600 hover:text-sky-700 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div
                    className={`flex-shrink-0 w-3 h-3 mt-2 rounded-full ${
                      notif.isRead ? 'bg-slate-300' : 'bg-sky-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
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
              <p className="text-slate-500">No notifications yet.</p>
            </div>
          )}
        </div>

        {/* Submit Case Button */}
        {totalCases > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/patient/submit')}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-xl font-semibold shadow hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <DocumentArrowUpIcon className="w-5 h-5" />
              Submit New Case
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}