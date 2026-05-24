import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cases/assigned/my');
      setCases(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load assigned cases');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Calculate stats
  const totalAssigned = cases.length;
  const pendingReview = cases.filter((c) => c.status === 'UNDER_REVIEW').length;

  const today = new Date().toDateString();
  const completedToday = cases.filter(
    (c) => c.status === 'RELEASED' && new Date(c.updatedAt).toDateString() === today
  ).length;

  const overriddenCount = cases.filter(
    (c) => c.doctorReview?.action === 'OVERRIDDEN'
  ).length;

  // Severity distribution
  const severityDistribution = {};
  cases.forEach((c) => {
    // This would need diagnosis data, for now we estimate from recent cases
    if (c.diagnosisResult?.severityLevel) {
      severityDistribution[c.diagnosisResult.severityLevel] =
        (severityDistribution[c.diagnosisResult.severityLevel] || 0) + 1;
    }
  });

  const severityChartData = [
    { name: 'Mild', value: severityDistribution['MILD'] || 0, fill: '#10b981' },
    { name: 'Moderate', value: severityDistribution['MODERATE'] || 0, fill: '#f59e0b' },
    { name: 'Severe', value: severityDistribution['SEVERE'] || 0, fill: '#ef4444' },
  ].filter((item) => item.value > 0);

  return (
      <div className="space-y-6">
        {/* ROW 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Assigned"
            value={totalAssigned}
            icon={ClipboardDocumentCheckIcon}
            color="sky"
          />
          <StatCard
            title="Pending Review"
            value={pendingReview}
            icon={ClipboardDocumentCheckIcon}
            color="amber"
          />
          <StatCard
            title="Completed Today"
            value={completedToday}
            icon={CheckCircleIcon}
            color="emerald"
          />
          <StatCard
            title="Overridden"
            value={overriddenCount}
            icon={SparklesIcon}
            color="violet"
          />
        </div>

        {/* ROW 2: Quick Access Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/doctor/assigned-cases')}
            className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-sky-300 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-sky-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-sky-600">{pendingReview}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Assigned Cases
            </h3>
            <p className="text-sm text-slate-600">
              Review {pendingReview} case{pendingReview !== 1 ? 's' : ''} awaiting your review
            </p>
            <p className="text-xs text-sky-600 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
              View all cases →
            </p>
          </button>

          <button
            onClick={() => navigate('/doctor/cases-history')}
            className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-emerald-300 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-emerald-600">
                {cases.filter((c) => c.status === 'RELEASED').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Cases History
            </h3>
            <p className="text-sm text-slate-600">
              View {cases.filter((c) => c.status === 'RELEASED').length} completed case{
                cases.filter((c) => c.status === 'RELEASED').length !== 1 ? 's' : ''
              }
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
              View history →
            </p>
          </button>
        </div>

        {/* ROW 3: Recent Activity + Severity Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Activity (60%) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Recent Activity
            </h2>
            {cases.filter((c) => c.status === 'RELEASED').length > 0 ? (
              <div className="space-y-3">
                {cases
                  .filter((c) => c.status === 'RELEASED')
                  .slice(0, 5)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Case #{c.id} — {c.patientName}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {c.doctorReview?.action === 'CONFIRMED'
                                ? 'Confirmed AI diagnosis'
                                : 'Overrode AI prediction'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(c.updatedAt).toLocaleDateString('en-US', {
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
                <p className="text-slate-500 text-sm">No completed reviews yet.</p>
              </div>
            )}
          </div>

          {/* Right: Severity Distribution (40%) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Severity Distribution
            </h2>
            {severityChartData.length > 0 ? (
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-500 text-center text-sm">
                  No severity data available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}