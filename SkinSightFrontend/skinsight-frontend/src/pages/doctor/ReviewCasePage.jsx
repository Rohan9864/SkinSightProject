import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HeatmapViewer from '../../components/case/HeatmapViewer';
import DiagnosisResultCard from '../../components/case/DiagnosisResultCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import api from '../../api/axios';

const DISEASE_CLASSES = [
  'Melanoma',
  'Melanocytic Nevi',
  'Basal Cell Carcinoma',
  'Actinic Keratosis',
  'Benign Keratosis',
  'Dermatofibroma',
  'Vascular Lesion',
  'Squamous Cell Carcinoma',
];

export default function ReviewCasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);

  const [formData, setFormData] = useState({
    action: null, // 'CONFIRMED' | 'OVERRIDDEN' | 'RESUBMISSION_REQUESTED'
    clinicalNotes: '',
    overriddenClass: '',
    overrideReason: '',
  });

  useEffect(() => {
    fetchCaseAndDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCaseAndDiagnosis = async () => {
    try {
      setLoading(true);
      const [caseRes, diagRes] = await Promise.all([
        api.get(`/api/cases/${id}`),
        api.get(`/api/diagnosis/cases/${id}`),
      ]);

      setCaseData(caseRes.data);
      setDiagnosis(diagRes.data);
      setFormData((prev) => ({
        ...prev,
        clinicalNotes: caseRes.data.clinicalNotes || '',
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load case');
      console.error(error);
      navigate('/doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActionChange = (action) => {
    setFormData((prev) => ({
      ...prev,
      action,
      ...(action !== 'OVERRIDDEN' && {
        overriddenClass: '',
        overrideReason: '',
      }),
      ...(action === 'RESUBMISSION_REQUESTED' && {
        clinicalNotes: '',
      }),
    }));
  };

  const isFormValid = () => {
    const notes = formData.clinicalNotes.trim();
    const reason = formData.overrideReason.trim();
    if (!formData.action) return false;
    if (formData.action === 'CONFIRMED' && notes.length < 10) return false;
    if (formData.action === 'OVERRIDDEN') {
      if (!formData.overriddenClass) return false;
      if (!reason) return false;
      if (notes.length < 10) return false;
    }
    return true;
  };

  const handleSubmitClick = () => {
    if (!isFormValid()) {
      toast.error('Please complete the form correctly');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);

    try {
      setSubmitting(true);
      const payload = {
        action: formData.action,
        clinicalNotes: formData.clinicalNotes.trim(),
      };

      if (formData.action === 'OVERRIDDEN') {
        payload.overriddenClass = formData.overriddenClass;
        payload.overriddenReason = formData.overrideReason.trim();
      }

      await api.post(`/api/reviews/cases/${id}`, payload);

      toast.success('Review submitted. Result released to patient.');
      setTimeout(() => {
        navigate('/doctor');
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const response = await api.get(`/api/reports/cases/${id}`);
      const reportUrl = response.data.reportUrl;
      if (reportUrl) {
        const win = window.open(reportUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = reportUrl;
        }
        toast.success('Report opened in a new tab');
        return;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(error);
      }
    }

    try {
      const generateResp = await api.post(`/api/reports/cases/${id}`);
      const reportUrl = generateResp.data.reportUrl;
      if (reportUrl) {
        const win = window.open(reportUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = reportUrl;
        }
        toast.success('Report generated and opened in a new tab');
        return;
      }
      toast.error('Report generated but report URL was not returned');
    } catch (error) {
      if (error.response?.status === 409) {
        try {
          const retryResp = await api.get(`/api/reports/cases/${id}`);
          const reportUrl = retryResp.data.reportUrl;
          if (reportUrl) {
            const win = window.open(reportUrl, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
              window.location.href = reportUrl;
            }
            toast.success('Report opened in a new tab');
            return;
          }
        } catch (inner) {
          console.error(inner);
        }
      }
      toast.error(error.response?.data?.message || 'Failed to generate report');
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!caseData || !diagnosis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 mb-4">Case or diagnosis not found</p>
        <button
          onClick={() => navigate('/doctor')}
          className="px-4 py-2.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const submittedDate = new Date(caseData.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const imageUrl = caseData.imageUrl?.startsWith('http')
    ? caseData.imageUrl
    : `http://localhost:8080/${caseData.imageUrl}`;

  const heatmapUrl = diagnosis?.heatmapUrl?.startsWith('http')
    ? diagnosis.heatmapUrl
    : `http://localhost:8080/${diagnosis?.heatmapUrl}`;

  const isReleased = caseData.status === 'RELEASED';

  return (
    <>
      <div className="space-y-6">
        {/* Patient Info Banner */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Patient</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{caseData.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Case #ID</p>
              <p className="text-lg font-bold text-slate-800 mt-1">#{caseData.id}</p>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Submitted</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{submittedDate}</p>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Body Area</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{caseData.bodyArea}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Description</p>
              <p className="text-sm text-slate-700 mt-1 line-clamp-2">{caseData.description}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <HeatmapViewer originalUrl={imageUrl} heatmapUrl={heatmapUrl} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <DiagnosisResultCard diagnosisResult={diagnosis} />

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Submit Your Review</h3>

              {isReleased ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">Case Released</p>
                    <p className="text-sm text-emerald-700 mt-2">
                      This case has already been released to the patient. Review details are shown below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Action Taken</label>
                    <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                      {caseData.doctorReview?.action || formData.action || 'N/A'}
                    </div>
                  </div>
 
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Clinical Notes</label>
                    <textarea
                      readOnly
                      value={caseData.doctorReview?.clinicalNotes || formData.clinicalNotes}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 resize-none"
                      rows={5}
                    />
                  </div>
 
                  {((caseData.doctorReview?.action || formData.action) === 'OVERRIDDEN') && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Overridden Class</label>
                        <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                          {caseData.doctorReview?.overriddenClass || formData.overriddenClass || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Override Reason</label>
                        <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                          {caseData.doctorReview?.overrideReason || formData.overrideReason || 'N/A'}
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleGenerateReport}
                    disabled={reportLoading}
                    className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reportLoading ? 'Preparing Report...' : 'Download Report'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      What is your action? <span className="text-rose-500">*</span>
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="action"
                          value="CONFIRMED"
                          checked={formData.action === 'CONFIRMED'}
                          onChange={(e) => handleActionChange(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Confirm AI Diagnosis</p>
                          <p className="text-xs text-slate-500">I agree with the AI prediction</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="action"
                          value="OVERRIDDEN"
                          checked={formData.action === 'OVERRIDDEN'}
                          onChange={(e) => handleActionChange(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Override Diagnosis</p>
                          <p className="text-xs text-slate-500">I disagree with the AI prediction</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="action"
                          value="RESUBMISSION_REQUESTED"
                          checked={formData.action === 'RESUBMISSION_REQUESTED'}
                          onChange={(e) => handleActionChange(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Request Resubmission</p>
                          <p className="text-xs text-slate-500">Patient should submit a better image</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Clinical Notes {formData.action !== 'RESUBMISSION_REQUESTED' && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      name="clinicalNotes"
                      value={formData.clinicalNotes}
                      onChange={handleInputChange}
                      placeholder={
                        formData.action === 'RESUBMISSION_REQUESTED'
                          ? 'Clinical notes are disabled for resubmission requests.'
                          : 'Enter your clinical observations and recommendations...'
                      }
                      disabled={formData.action === 'RESUBMISSION_REQUESTED'}
                      rows={5}
                      className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm resize-none ${
                        formData.action === 'RESUBMISSION_REQUESTED'
                          ? 'bg-slate-100 cursor-not-allowed text-slate-500'
                          : ''
                      }`}
                    />
                    {formData.action !== 'RESUBMISSION_REQUESTED' && (
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${formData.clinicalNotes.trim().length < 10 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {formData.clinicalNotes.length} characters (min 10)
                        </p>
                      </div>
                    )}
                  </div>

                  {formData.action === 'OVERRIDDEN' && (
                    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Override Diagnosis <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="overriddenClass"
                          value={formData.overriddenClass}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
                        >
                          <option value="">Select disease class...</option>
                          {DISEASE_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Reason for Override <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          name="overrideReason"
                          value={formData.overrideReason}
                          onChange={handleInputChange}
                          placeholder="Explain why you disagree with the AI diagnosis..."
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitClick}
                    disabled={!isFormValid() || submitting}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
        message="Are you sure you want to submit this review? This action will release the result to the patient."
        confirmLabel="Submit Review"
        cancelLabel="Cancel"
      />
    </>
  );
}
