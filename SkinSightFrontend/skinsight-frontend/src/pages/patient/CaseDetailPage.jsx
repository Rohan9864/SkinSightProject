import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import HeatmapViewer from '../../components/case/HeatmapViewer';
import DiagnosisResultCard from '../../components/case/DiagnosisResultCard';
import api from '../../api/axios';

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const [caseRes, reportRes] = await Promise.all([
        api.get(`/api/cases/${id}`),
        api.get(`/api/reports/cases/${id}`).catch(() => null),
      ]);

      const caseData = caseRes.data;
      setCaseData(caseData);

      if (reportRes?.data?.reportUrl) {
        setReportUrl(reportRes.data.reportUrl);
      }

      // If released, use diagnosis from case data or fetch separately
      if (caseData.status === 'RELEASED') {
        // First check if diagnosis is already in the case data
        if (caseData.diagnosisResult) {
          setDiagnosis(caseData.diagnosisResult);
        } else {
          // If not, try to fetch diagnosis separately
          try {
            const diagRes = await api.get(`/api/diagnosis/cases/${id}`);
            setDiagnosis(diagRes.data);
          } catch (error) {
            console.error('Failed to fetch diagnosis:', error);
            // Use empty diagnosis structure so page still shows
            setDiagnosis({});
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load case details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      const response = await api.post(`/api/reports/cases/${id}`);
      setReportUrl(response.data.reportUrl);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!caseData) {
    return (
      <DashboardLayout title="Case Details">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">Case not found</p>
          <button
            onClick={() => navigate('/patient')}
            className="px-4 py-2.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const submittedDate = new Date(caseData.submittedAt).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const imageUrl = caseData.imageUrl?.startsWith('http')
    ? caseData.imageUrl
    : `http://localhost:8080/${caseData.imageUrl}`;

  // Get heatmap from diagnosis first, then check caseData
  let heatmapUrl = null;
  if (diagnosis?.heatmapUrl) {
    heatmapUrl = diagnosis.heatmapUrl.startsWith('http')
      ? diagnosis.heatmapUrl
      : `http://localhost:8080/${diagnosis.heatmapUrl}`;
  } else if (caseData.heatmapUrl) {
    heatmapUrl = caseData.heatmapUrl.startsWith('http')
      ? caseData.heatmapUrl
      : `http://localhost:8080/${caseData.heatmapUrl}`;
  }

  return (
    <DashboardLayout title={`Case #${id}`}>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Case #{caseData.id}
              </p>
              <p className="text-sm text-slate-600 mt-1">{caseData.bodyArea}</p>
            </div>
            <StatusBadge status={caseData.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">Submitted</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{submittedDate}</p>
            </div>
            {caseData.assignedDoctorName && (
              <div>
                <p className="text-xs text-slate-500">Assigned Doctor</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {caseData.assignedDoctorName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PENDING / UNDER_REVIEW Status */}
        {(caseData.status === 'PENDING' || caseData.status === 'UNDER_REVIEW') && (
          <div className="space-y-6">
            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                {/* Submitted */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Submitted</p>
                </div>

                {/* Connector Line */}
                <div className="flex-1 h-1 bg-slate-300 mx-2 mb-6" />

                {/* AI Analysis */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      caseData.status === 'UNDER_REVIEW'
                        ? 'bg-sky-100'
                        : 'bg-slate-200'
                    }`}
                  >
                    {caseData.status === 'UNDER_REVIEW' ? (
                      <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircleIcon className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">AI Analysis</p>
                </div>

                {/* Connector Line */}
                <div className="flex-1 h-1 bg-slate-300 mx-2 mb-6" />

                {/* Doctor Review */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-2">
                    <ClockIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Doctor Review</p>
                </div>

                {/* Connector Line */}
                <div className="flex-1 h-1 bg-slate-300 mx-2 mb-6" />

                {/* Released */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-2">
                    <CheckCircleIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Released</p>
                </div>
              </div>

              {/* Message */}
              <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-sm text-sky-900">
                  Your case is being processed by our AI system and medical review team.
                  You will be notified when results are ready.
                </p>
              </div>
            </div>

            {/* Case Image */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Uploaded Image
              </h3>
              <div className="bg-slate-50 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Skin lesion"
                  className="w-full h-auto object-contain max-h-96"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                Case Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{caseData.description}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Duration</p>
                  <p className="text-sm text-slate-700">{caseData.duration}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RELEASED Status */}
        {caseData.status === 'RELEASED' && (
          <div>
            {/* Case Description */}
            <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                Case Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{caseData.description}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Duration</p>
                  <p className="text-sm text-slate-700">{caseData.duration}</p>
                </div>
              </div>
            </div>

            {/* Three Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Column 1: Image + Heatmap */}
              <div>
                <HeatmapViewer
                  originalUrl={imageUrl}
                  heatmapUrl={heatmapUrl}
                />
              </div>

              {/* Column 2: AI Diagnosis */}
              <div>
                {diagnosis?.predictedClass || diagnosis?.class ? (
                  <DiagnosisResultCard diagnosisResult={diagnosis} />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                    <p className="text-slate-500 text-sm">AI diagnosis is being processed...</p>
                  </div>
                )}
              </div>

              {/* Column 3: Doctor Review */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Doctor Review
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {caseData.assignedDoctorName || 'Not assigned'}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <p className="text-xs text-slate-500 mb-2">Review Status</p>
                  {caseData.doctorReview?.action && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        caseData.doctorReview.action === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {caseData.doctorReview.action === 'CONFIRMED'
                        ? 'Confirmed'
                        : caseData.doctorReview.action === 'OVERRIDDEN'
                        ? 'Overridden'
                        : 'Resubmission Required'}
                    </span>
                  )}
                </div>

                {caseData.doctorReview?.overriddenClass && (
                  <div className="border-t border-slate-200 pt-6">
                    <p className="text-xs text-slate-500 mb-2">Final Diagnosis</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {caseData.doctorReview.overriddenClass}
                    </p>
                    {caseData.doctorReview.overrideReason && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-1">Reason for Override</p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {caseData.doctorReview.overrideReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {caseData.doctorReview?.clinicalNotes && (
                  <div className="border-t border-slate-200 pt-6">
                    <p className="text-xs text-slate-500 mb-2">Clinical Notes</p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {caseData.doctorReview.clinicalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Report Generation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Clinical Report</h3>
              {reportUrl ? (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800">
                      Report generated successfully
                    </span>
                  </div>
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download Report
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {reportLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      Generate PDF Report
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESUBMISSION_REQUIRED Status */}
        {caseData.status === 'RESUBMISSION_REQUIRED' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex gap-4">
                <ClockIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Resubmission Required
                  </h3>
                  {caseData.doctorReview?.clinicalNotes && (
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {caseData.doctorReview.clinicalNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/patient/submit')}
              className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-xl font-semibold shadow hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
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