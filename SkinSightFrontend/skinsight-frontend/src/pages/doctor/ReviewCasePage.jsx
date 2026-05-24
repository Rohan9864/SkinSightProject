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
      // Reset override fields if not overriding
      ...(action !== 'OVERRIDDEN' && {
        overriddenClass: '',
        overrideReason: '',
      }),
    }));
  };

  const isFormValid = () => {
    if (!formData.action) return false;
    if (formData.clinicalNotes.trim().length < 10) return false;
    if (
      formData.action === 'OVERRIDDEN' &&
      (!formData.overriddenClass || !formData.overrideReason.trim())
    ) {
      return false;
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
        clinicalNotes: formData.clinicalNotes,
      };

      if (formData.action === 'OVERRIDDEN') {
        payload.overriddenClass = formData.overriddenClass;
        payload.overrideReason = formData.overrideReason;
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

  const submittedDate = new Date(caseData.submittedAt).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const imageUrl = caseData.imageUrl?.startsWith('http')
    ? caseData.imageUrl
    : `http://localhost:8080/${caseData.imageUrl}`;

  const heatmapUrl = diagnosis?.heatmapUrl?.startsWith('http')
    ? diagnosis.heatmapUrl
    : `http://localhost:8080/${diagnosis?.heatmapUrl}`;

  return (
    <>
      <div className="space-y-6">
        {/* Patient Info Banner */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                Patient
              </p>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {caseData.patientName}
              </p>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                Case #ID
              </p>
              <p className="text-lg font-bold text-slate-800 mt-1">#{caseData.id}</p>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                Submitted
              </p>
              <p className="text-lg font-bold text-slate-800 mt-1">{submittedDate}</p>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                Body Area
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {caseData.bodyArea}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                Description
              </p>
              <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                {caseData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Images */}
          <div className="space-y-6">
            <HeatmapViewer originalUrl={imageUrl} heatmapUrl={heatmapUrl} />
          </div>

          {/* RIGHT COLUMN: Diagnosis + Review Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Diagnosis Summary */}
            <DiagnosisResultCard diagnosisResult={diagnosis} />

            {/* Doctor Review Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Submit Your Review</h3>

              {/* Action Selection */}
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
                      <p className="text-sm font-semibold text-slate-800">
                        Confirm AI Diagnosis
                      </p>
                      <p className="text-xs text-slate-500">
                        I agree with the AI prediction
                      </p>
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
                      <p className="text-sm font-semibold text-slate-800">
                        Override Diagnosis
                      </p>
                      <p className="text-xs text-slate-500">
                        I disagree with the AI prediction
                      </p>
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
                      <p className="text-sm font-semibold text-slate-800">
                        Request Resubmission
                      </p>
                      <p className="text-xs text-slate-500">
                        Patient should submit a better image
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Clinical Notes - Always Visible */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Clinical Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="clinicalNotes"
                  value={formData.clinicalNotes}
                  onChange={handleInputChange}
                  placeholder="Enter your clinical observations and recommendations..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p
                    className={`text-xs ${
                      formData.clinicalNotes.length < 10
                        ? 'text-rose-500'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formData.clinicalNotes.length} characters (min 10)
                  </p>
                </div>
              </div>

              {/* Override Diagnosis - Only When Overriding */}
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
                      placeholder="Explain why you are overriding the AI prediction..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
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