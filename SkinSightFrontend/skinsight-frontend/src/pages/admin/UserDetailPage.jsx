import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${id}`);
      const userData = response.data;
      setUser(userData);

      if (userData.role === 'DOCTOR') {
        const profileResponse = await api.get(`/api/profiles/doctor/${id}`);
        setProfile(profileResponse.data);
      } else if (userData.role === 'PATIENT') {
        const profileResponse = await api.get(`/api/profiles/patient/${id}`);
        setProfile(profileResponse.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load user details');
      console.error(error);
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 mb-4">User not found.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all"
        >
          Back to users
        </button>
      </div>
    );
  }

  const emailVerified =
    user?.isEmailVerified ?? user?.emailVerified ??
    profile?.isEmailVerified ?? profile?.emailVerified;
  const isActive = profile?.active ?? user?.active;
  const profileImageUrl = profile?.profileImageUrl ?? user?.profileImageUrl;
  const displayPhone = profile?.phone ?? user?.phone;
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="inline-flex items-center gap-2 text-slate-700 hover:text-sky-600 font-semibold"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back to users
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-600 font-semibold">
              User Details
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-3">{user.name}</h1>
            <p className="text-sm text-slate-500 mt-2">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
              <p className="text-base text-slate-800 font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Account Status</p>
              <p className="text-base text-slate-800 font-semibold">
                {isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Email Verified</p>
              <p className="text-base text-slate-800 font-semibold">
                {emailVerified ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
              <p className="text-base text-slate-800 font-semibold">
                {displayPhone || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">User ID</p>
              <p className="text-base text-slate-800 font-semibold">#{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Joined</p>
              <p className="text-base text-slate-800 font-semibold">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {profileImageUrl && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Profile Image</p>
                <img
                  src={profileImageUrl}
                  alt={user.name}
                  className="mt-2 w-32 h-32 object-cover rounded-2xl border border-slate-200"
                />
              </div>
            )}
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {isDoctor && (
              <>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Specialization</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.specialization || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">License Number</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.licenseNumber || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Hospital Affiliation</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.hospitalAffiliation || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Experience</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.yearsOfExperience != null ? `${profile.yearsOfExperience} years` : 'Not provided'}
                  </p>
                </div>
              </>
            )}

            {isPatient && (
              <>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Age</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.age != null ? `${profile.age} years` : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Gender</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.gender || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Address</p>
                  <p className="text-base text-slate-800 font-semibold">
                    {profile.address || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Medical History</p>
                  <p className="text-base text-slate-800 font-semibold whitespace-pre-line">
                    {profile.medicalHistory || 'Not provided'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
