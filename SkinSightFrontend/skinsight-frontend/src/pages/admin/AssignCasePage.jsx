import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function AssignCasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [caseRes, doctorsRes] = await Promise.all([
        api.get(`/api/cases/${id}`),
        api.get('/api/profiles/doctors'),
      ]);

      setCaseData(caseRes.data);

      // Add case count for each doctor
      const casesRes = await api.get('/api/cases');
      const allCases = casesRes.data || [];

      const doctorsWithCounts = (doctorsRes.data || []).map((doctor) => {
        const caseCount = allCases.filter(
          (c) => c.assignedDoctorId === doctor.userId
        ).length;
        return {
          ...doctor,
          caseCount,
        };
      });

      setDoctors(doctorsWithCounts);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
      console.error(error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    try {
      setAssigning(true);
      await api.patch(`/api/cases/${id}/assign`, {
        doctorId: selectedDoctor.userId,
      });

      toast.success('Case assigned successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign case');
      console.error(error);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!caseData) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">Case not found</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
    );
  }

  const imageUrl = caseData.imageUrl?.startsWith('http')
    ? caseData.imageUrl
    : `http://localhost:8080/${caseData.imageUrl}`;

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Case Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Patient
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-2">
                {caseData.patientName}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Case Details
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">Body Area:</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {caseData.bodyArea}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">Case ID:</p>
                  <p className="text-sm font-semibold text-slate-800">#{caseData.id}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis Info */}
            {caseData.diagnosisResult && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  AI Analysis
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">Prediction:</p>
                    <p className="text-sm font-semibold text-sky-600">
                      {caseData.diagnosisResult.predictedClass}
                    </p>
                  </div>
                  {caseData.diagnosisResult.severityLevel && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">Severity:</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          caseData.diagnosisResult.severityLevel === 'MILD'
                            ? 'bg-emerald-100 text-emerald-700'
                            : caseData.diagnosisResult.severityLevel === 'MODERATE'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {caseData.diagnosisResult.severityLevel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Case Image */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <img
              src={imageUrl}
              alt="Case"
              className="w-full h-auto object-cover max-h-96"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>

        {/* RIGHT: Doctor Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 h-fit">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Select Doctor
            </h2>
            <p className="text-sm text-slate-600">
              Choose a dermatologist to review this case
            </p>
          </div>

          {doctors.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {doctors.map((doctor) => (
                <label
                  key={doctor.userId}
                  className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-sky-50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="doctor"
                    value={doctor.userId}
                    checked={selectedDoctor?.userId === doctor.userId}
                    onChange={() => {
                      // Allow deselection by clicking the same radio button
                      if (selectedDoctor?.userId === doctor.userId) {
                        setSelectedDoctor(null);
                      } else {
                        setSelectedDoctor(doctor);
                      }
                    }}
                    className="w-4 h-4 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {doctor.name}
                    </p>
                    {doctor.specialization && (
                      <p className="text-xs text-slate-500 mt-1">
                        {doctor.specialization}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {doctor.caseCount} case{doctor.caseCount !== 1 ? 's' : ''}
                      </span>
                      {doctor.yearsOfExperience && (
                        <span className="text-xs text-slate-500">
                          {doctor.yearsOfExperience} years exp.
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No doctors available</p>
            </div>
          )}

          {/* Assign Button */}
          <button
            onClick={handleAssign}
            disabled={!selectedDoctor || assigning}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {assigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <ArrowRightIcon className="w-5 h-5" />
                Assign Case
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => navigate('/admin')}
            disabled={assigning}
            className="w-full px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
  );
}